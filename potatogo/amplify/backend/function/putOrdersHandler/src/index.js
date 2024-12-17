const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
  try {
    // Parse the incoming request body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    const { orderId, orderStatus, userName, ...updatedFields } = body; // Extract userName and other fields
    const userRole = event.headers['x-user-role']; // Get user role from headers

    // Step 1: Validate orderId
    if (!orderId) {
      const data = {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: { message: 'Order ID is required' },
      };
      return { body: JSON.stringify(data) };
    }

    // Step 2: Fetch current order from DynamoDB
    const getParams = {
      TableName: 'Pota-To-Go-orders',
      Key: { orderId },
    };

    const currentOrder = await dynamoDB.send(new GetCommand(getParams));

    // Step 3: Handle if the order doesn't exist
    if (!currentOrder.Item) {
      const data = {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: { message: 'Order not found' },
      };
      return { body: JSON.stringify(data) };
    }

    // Extract current fields
    const { orderStatus: currentStatus, customerName, ...currentFields } = currentOrder.Item;

    // Step 4: Validate permissions and customer match
    if (userRole !== 'employee') {
      if (!userName || userName !== customerName) {
        const data = {
          statusCode: 403,
          headers: { 'Content-Type': 'application/json' },
          body: { message: 'Access denied: You can only edit your own orders.' },
        };
        return { body: JSON.stringify(data) };
      }

      // Restrict non-employee users
      const invalidFields = Object.keys(updatedFields).filter(
        (key) => !key.startsWith('orderItem') && !key.startsWith('specials')
      );

      if (invalidFields.length > 0) {
        const data = {
          statusCode: 403,
          headers: { 'Content-Type': 'application/json' },
          body: {
            message: `Access denied: Non-employees can only add or delete items and specials. Invalid fields: ${invalidFields.join(', ')}`,
          },
        };
        return { body: JSON.stringify(data) };
      }
    }

    // Step 5: Prepare for updates
    let updateExpression = 'SET';
    const expressionAttributeValues = {};
    const changes = [];
    let statusChange = null;

    // Step 6: Update order status (only for employees)
    if (userRole === 'employee' && orderStatus && orderStatus !== currentStatus) {
      updateExpression += ' orderStatus = :orderStatus,';
      expressionAttributeValues[':orderStatus'] = orderStatus;
      statusChange = `Order status changed from "${currentStatus}" to "${orderStatus}"`;
    }

    // Step 7: Handle updates for orderItemX and specialsX
    Object.keys(updatedFields).forEach((key) => {
      if (key.startsWith('orderItem') || key.startsWith('specials')) {
        const newValue = updatedFields[key];
        const currentValue = currentFields[key] || [];

        const newArray = Array.isArray(newValue) ? newValue : [newValue];
        const currentArray = Array.isArray(currentValue) ? currentValue : [currentValue];

        const added = newArray.filter((item) => !currentArray.includes(item));
        const removed = currentArray.filter((item) => !newArray.includes(item));

        if (added.length > 0) added.forEach((item) => changes.push(`${item} added to ${key}`));
        if (removed.length > 0) removed.forEach((item) => changes.push(`${item} removed from ${key}`));

        if (JSON.stringify(newArray) !== JSON.stringify(currentArray)) {
          updateExpression += ` ${key} = :${key},`;
          expressionAttributeValues[`:${key}`] = newArray.length === 1 ? newArray[0] : newArray;
        }
      }
    });

    // Add modifiedAt timestamp
    const modifiedAt = new Date().toISOString();
    updateExpression += ' modifiedAt = :modifiedAt,';
    expressionAttributeValues[':modifiedAt'] = modifiedAt;

    updateExpression = updateExpression.slice(0, -1); // Remove trailing comma

    if (changes.length === 0 && !statusChange) {
      const data = {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { message: 'No changes made' },
      };
      return { body: JSON.stringify(data) };
    }

    // Step 8: Update in DynamoDB
    const updateParams = {
      TableName: 'Pota-To-Go-orders',
      Key: { orderId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    await dynamoDB.send(new UpdateCommand(updateParams));

    // Step 9: Success Response
    const data = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        message: `Order ${orderId} updated successfully`,
        changes,
        statusChange,
        modifiedAt,
      },
    };
    return { body: JSON.stringify(data) };

  } catch (error) {
    const data = {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: { message: 'Failed to update order', error: error.message },
    };
    return { body: JSON.stringify(data) };
  }
};
