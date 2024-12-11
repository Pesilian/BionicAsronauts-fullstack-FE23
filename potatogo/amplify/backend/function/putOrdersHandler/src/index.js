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
  console.log('Incoming Event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    console.log('Parsed body:', body);

    const { orderId, orderStatus, orderItems } = body;
    const userRole = event.headers['x-user-role'];
    console.log(`Order ID: ${orderId}, User Role: ${userRole}`);

    if (!orderId) {
      console.log('Validation failed: Order ID missing');
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
    console.log('Fetching current order with params:', getParams);

    const currentOrder = await dynamoDB.send(new GetCommand(getParams));
    console.log('Current Order:', currentOrder);

    if (!currentOrder.Item) {
      console.log(`Order not found: ${orderId}`);
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Order not found' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const { orderStatus: currentStatus, orderItems: currentItems } = currentOrder.Item;
    console.log(`Current Status: ${currentStatus}, Current Items: ${JSON.stringify(currentItems)}`);

    // Step 2: Validate based on status and user role
    if (currentStatus === 'done') {
      console.log('Attempt to edit a completed order');
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Cannot edit a completed order' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (currentStatus === 'in progress' && userRole !== 'employee') {
      console.log('Unauthorized attempt to edit in-progress order by non-employee');
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
    if (orderStatus && orderStatus !== currentStatus) {
      updateExpression += ' orderStatus = :orderStatus';
      expressionAttributeValues[':orderStatus'] = orderStatus;
      changes.push(`Status changed from "${currentStatus}" to "${orderStatus}"`);
    }

    if (orderItems && JSON.stringify(orderItems) !== JSON.stringify(currentItems)) {
      if (Object.keys(expressionAttributeValues).length > 0) updateExpression += ',';
      updateExpression += ' orderItems = :orderItems';
      expressionAttributeValues[':orderItems'] = orderItems;
      changes.push(`Items updated`);
    }

    console.log('Update Expression:', updateExpression);
    console.log('Expression Attribute Values:', expressionAttributeValues);

    if (changes.length === 0) {
      console.log('No changes detected in the update');
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
    console.log('Update params:', updateParams);

    await dynamoDB.send(new UpdateCommand(updateParams));
    console.log(`Order ${orderId} updated successfully`);

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
    console.error('Error during order update:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update order', error: error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
