const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand
} = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
  try {
    // Parse the incoming request body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    const { orderId, orderStatus, userName, ...updatedFields } = body;
    const userRole = event.headers['x-user-role'];

    // Validate orderId
    if (!orderId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Order ID is required' }),
      };
    }

    // Fetch current order from DynamoDB
    const getParams = {
      TableName: 'Pota-To-Go-orders',
      Key: { orderId },
    };
    const currentOrder = await dynamoDB.send(new GetCommand(getParams));

    if (!currentOrder.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Order not found' }),
      };
    }

    const { orderStatus: currentStatus, customerName, ...currentFields } = currentOrder.Item;

    // Permission validation
    if (userRole !== 'employee') {
      if (!userName || userName !== customerName || currentStatus !== 'Pending') {
        return {
          statusCode: 403,
          body: JSON.stringify({
            message: 'Access denied: Customers can only modify their own pending orders.',
          }),
        };
      }

      const invalidFields = Object.keys(updatedFields).filter(
        (key) => !key.startsWith('orderItem') && key !== 'orderNote'
      );

      if (invalidFields.length > 0) {
        return {
          statusCode: 403,
          body: JSON.stringify({
            message: `Access denied: Invalid fields for customer: ${invalidFields.join(', ')}`,
          }),
        };
      }
    }

    // Prepare for updates
    let updateExpression = '';
    const expressionAttributeValues = {};
    const changes = [];
    let statusChange = null;

    // Update order status
    if (userRole === 'employee' && orderStatus && orderStatus !== currentStatus) {
      updateExpression += 'SET orderStatus = :orderStatus,';
      expressionAttributeValues[':orderStatus'] = orderStatus;
      statusChange = `Order status changed from "${currentStatus}" to "${orderStatus}"`;
    }

    // Process updated fields
    Object.keys(updatedFields).forEach((key) => {
      const newValue = updatedFields[key];

      if (newValue === null) {
        // Handle deletions
        updateExpression += ` REMOVE ${key},`;
        changes.push(`${key} removed`);
      } else {
        // Handle updates or additions
        const currentValue = currentFields[key] || [];
        const newArray = Array.isArray(newValue) ? newValue : [newValue];
        const currentArray = Array.isArray(currentValue) ? currentValue : [currentValue];

        const added = newArray.filter(item => !currentArray.includes(item));
        const removed = currentArray.filter(item => !newArray.includes(item));

        if (added.length > 0) {
          added.forEach(item => changes.push(`${item} added to ${key}`));
        }

        if (removed.length > 0) {
          removed.forEach(item => changes.push(`${item} removed from ${key}`));
        }

        if (JSON.stringify(newArray) !== JSON.stringify(currentArray)) {
          updateExpression += ` SET ${key} = :${key},`;
          expressionAttributeValues[`:${key}`] = newArray.length === 1 ? newArray[0] : newArray;
        }
      }
    });

    // Add modifiedAt timestamp
    const modifiedAt = new Date().toISOString();
    updateExpression += ' SET modifiedAt = :modifiedAt,';
    expressionAttributeValues[':modifiedAt'] = modifiedAt;

    // Finalize the update expression
    updateExpression = updateExpression.replace(/,\s*$/, ''); // Remove trailing comma

    // Execute update
    const updateParams = {
      TableName: 'Pota-To-Go-orders',
      Key: { orderId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    await dynamoDB.send(new UpdateCommand(updateParams));

    // Response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Order ${orderId} updated successfully`,
        changes,
        statusChange,
        modifiedAt,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update order', error: error.message }),
    };
  }
};
