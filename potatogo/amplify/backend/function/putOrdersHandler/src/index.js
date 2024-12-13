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
    const body = JSON.parse(event.body);
    const { orderId, orderStatus, userName, ...updatedFields } = body; // Extract userName and other fields
    const userRole = event.headers['x-user-role']; // Get user role from headers

    // Step 1: Validate orderId
    if (!orderId) {
      return {
        statusCode: 400,
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
        body: JSON.stringify({ message: 'Order not found' }),
      };
    }

    // Extract current fields
    const { orderStatus: currentStatus, customerName, ...currentFields } = currentOrder.Item;

    // Step 4: Validate permissions and customer match
    if (currentStatus === 'done') {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Cannot edit a completed order' }),
      };
    }

    if (userRole !== 'employee') {
      if (!userName || userName !== customerName) {
        return {
          statusCode: 403,
          body: JSON.stringify({ message: 'Access denied: You can only edit your own orders.' }),
        };
      }
    }

    // Step 5: Prepare for updates
    let updateExpression = 'SET';
    const expressionAttributeValues = {};
    const changes = [];

    // Step 6: Update order status
    if (orderStatus && orderStatus !== currentStatus) {
      updateExpression += ' orderStatus = :orderStatus,';
      expressionAttributeValues[':orderStatus'] = orderStatus;
      changes.push(`Order status changed from "${currentStatus}" to "${orderStatus}"`);
    }

    // Step 7: Handle updates for each orderItemX and specialsX dynamically
    Object.keys(updatedFields).forEach((key) => {
      if (key.startsWith('orderItem') || key.startsWith('specials')) {
        const newValue = updatedFields[key];
        const currentValue = currentFields[key];

        // Check for differences
        if (JSON.stringify(newValue) !== JSON.stringify(currentValue)) {
          updateExpression += ` ${key} = :${key},`;
          expressionAttributeValues[`:${key}`] = newValue;

          // Log the changes
          changes.push(`${key} updated`);
        }
      }
    });

    // Step 8: Finalize the update expression
    updateExpression = updateExpression.slice(0, -1); // Remove trailing comma

    // If no changes, return early
    if (changes.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No changes made' }),
      };
    }

    // Step 9: Update in DynamoDB
    const updateParams = {
      TableName: 'Pota-To-Go-orders',
      Key: { orderId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    await dynamoDB.send(new UpdateCommand(updateParams));

    // Step 10: Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Order ${orderId} updated successfully`,
        changes,
      }),
    };
  } catch (error) {
    // Handle errors
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update order', error: error.message }),
    };
  }
};
