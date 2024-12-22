const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-user-role',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

exports.handler = async (event) => {
  try {
    // Parse the incoming request body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    const { orderId, orderStatus, userName, ...updatedFields } = body;
    const userRole = event.headers['x-user-role']; // Get user role from headers

    // Step 1: Validate orderId
    if (!orderId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Order ID is required' }),
      };
    }

    // Step 2: Fetch current order from DynamoDB
    const getParams = {
      TableName: 'Pota-To-Go-orders',
      Key: { orderId },
    };

    const currentOrder = await dynamoDB.send(new GetCommand(getParams));

    // Step 3: Handle if the order doesn't exist
    if (!currentOrder.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Order not found' }),
      };
    }

    const { orderStatus: currentStatus, customerName, ...currentFields } = currentOrder.Item;

    // Step 4: Validate permissions and customer match
    if (userRole !== 'employee') {
      if (!userName || userName !== customerName) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Access denied: You can only edit your own orders.' }),
        };
      }

      const invalidFields = Object.keys(updatedFields).filter(
        (key) => !key.startsWith('orderItem') && !key.startsWith('specials')
      );

      if (invalidFields.length > 0) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({
            message: `Access denied: Non-employees can only add or delete items and specials. Invalid fields: ${invalidFields.join(', ')}`,
          }),
        };
      }
    }

    let updateExpression = 'SET';
    const expressionAttributeValues = {};
    const changes = [];
    let statusChange = null;

    if (userRole === 'employee' && orderStatus && orderStatus !== currentStatus) {
      updateExpression += ' orderStatus = :orderStatus,';
      expressionAttributeValues[':orderStatus'] = orderStatus;
      statusChange = `Order status changed from "${currentStatus}" to "${orderStatus}"`;
    }

    Object.keys(updatedFields).forEach((key) => {
      if (key.startsWith('orderItem') || key.startsWith('specials')) {
        const newValue = updatedFields[key];
        const currentValue = currentFields[key] || [];

        const newArray = Array.isArray(newValue) ? newValue : [newValue];
        const currentArray = Array.isArray(currentValue) ? currentValue : [currentValue];

        const added = newArray.filter((item) => !currentArray.includes(item));
        const removed = currentArray.filter((item) => !newArray.includes(item));

        if (added.length > 0) {
          added.forEach((item) => changes.push(`${item} added to ${key}`));
        }

        if (removed.length > 0) {
          removed.forEach((item) => changes.push(`${item} removed from ${key}`));
        }

        if (JSON.stringify(newArray) !== JSON.stringify(currentArray)) {
          updateExpression += ` ${key} = :${key},`;
          expressionAttributeValues[`:${key}`] = newArray.length === 1 ? newArray[0] : newArray;
        }
      }
    });

    const modifiedAt = new Date().toISOString();
    updateExpression += ' modifiedAt = :modifiedAt,';
    expressionAttributeValues[':modifiedAt'] = modifiedAt;

    updateExpression = updateExpression.slice(0, -1);

    if (changes.length === 0 && !statusChange) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'No changes made' }),
      };
    }

    const updateParams = {
      TableName: 'Pota-To-Go-orders',
      Key: { orderId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    await dynamoDB.send(new UpdateCommand(updateParams));

    return {
      statusCode: 200,
      headers: corsHeaders,
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
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Failed to update order', error: error.message }),
    };
  }
};
