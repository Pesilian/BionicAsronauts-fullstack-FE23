/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    const { orderId, status, items } = body;
    const userRole = event.headers['x-user-role']; // e.g., 'customer' or 'employee'

    if (!orderId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Order ID is required' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Step 1: Fetch the current order
    const getParams = {
      TableName: 'Pota-To-Go-orders',
      Key: { orderId },
    };

    const currentOrder = await dynamoDB.send(new GetCommand(getParams));
    if (!currentOrder.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Order not found' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const { status: currentStatus, items: currentItems } = currentOrder.Item;

    // Step 2: Validate based on status and user role
    if (currentStatus === 'done') {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Cannot edit a completed order' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (currentStatus === 'in progress' && userRole !== 'employee') {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Only employees can edit in-progress orders' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Step 3: Build update expression and changes feedback
    const changes = [];
    const expressionAttributeValues = {};

    let updateExpression = 'SET';
    if (status && status !== currentStatus) {
      updateExpression += ' status = :status';
      expressionAttributeValues[':status'] = status;
      changes.push(`Status changed from "${currentStatus}" to "${status}"`);
    }

    if (items && JSON.stringify(items) !== JSON.stringify(currentItems)) {
      if (Object.keys(expressionAttributeValues).length > 0) updateExpression += ',';
      updateExpression += ' items = :items';
      expressionAttributeValues[':items'] = items;
      changes.push(`Items updated`);
    }

    if (changes.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No changes made' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Step 4: Update the order
    const updateParams = {
      TableName: 'Pota-To-Go-orders',
      Key: { orderId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    await dynamoDB.send(new UpdateCommand(updateParams));

    // Step 5: Return success response with changes
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Order ${orderId} updated successfully`,
        changes,
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error updating order:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update order', error: error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};