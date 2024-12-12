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

    const { orderId, orderStatus, orderItems, specials } = body;
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

    // Step 2: Accessing orderItems and specials from DynamoDB response
    const currentItems = [];
    const currentSpecials = [];

    // Dynamically push items from each orderItem field
    for (let i = 1; currentOrder.Item[`orderItem${i}`]; i++) {
      currentItems.push(...currentOrder.Item[`orderItem${i}`].L.map(item => item.S));
    }

    // Get specials
    for (let i = 1; currentOrder.Item[`specials${i}`]; i++) {
      currentSpecials.push(currentOrder.Item[`specials${i}`].S);
    }

    console.log(`Current Items: ${JSON.stringify(currentItems)}, Current Specials: ${JSON.stringify(currentSpecials)}`);

    // Step 3: Validate based on status and user role
    if (currentOrder.Item.orderStatus === 'done') {
      console.log('Attempt to edit a completed order');
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Cannot edit a completed order' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (currentOrder.Item.orderStatus === 'in progress' && userRole !== 'employee') {
      console.log('Unauthorized attempt to edit in-progress order by non-employee');
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Only employees can edit in-progress orders' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Step 4: Compare the old and new orderItems
    const addedItems = orderItems.filter(item => !currentItems.includes(item));
    const removedItems = currentItems.filter(item => !orderItems.includes(item));

    // Step 5: Compare the old and new specials
    const addedSpecials = specials.filter(item => !currentSpecials.includes(item));
    const removedSpecials = currentSpecials.filter(item => !specials.includes(item));

    const changes = [];
    const expressionAttributeValues = {};
    let updateExpression = 'SET';

    // Update order status if necessary
    if (orderStatus && orderStatus !== currentOrder.Item.orderStatus) {
      updateExpression += ' orderStatus = :orderStatus';
      expressionAttributeValues[':orderStatus'] = orderStatus;
      changes.push(`Status changed from "${currentOrder.Item.orderStatus}" to "${orderStatus}"`);
    }

    // Update items if necessary
    if (orderItems && JSON.stringify(orderItems) !== JSON.stringify(currentItems)) {
      if (Object.keys(expressionAttributeValues).length > 0) updateExpression += ',';
      updateExpression += ' orderItems = :orderItems';
      expressionAttributeValues[':orderItems'] = orderItems;
      changes.push('Items updated');
    }

    // Update specials if necessary
    if (specials && JSON.stringify(specials) !== JSON.stringify(currentSpecials)) {
      if (Object.keys(expressionAttributeValues).length > 0) updateExpression += ',';
      updateExpression += ' specials = :specials';
      expressionAttributeValues[':specials'] = specials;
      changes.push('Specials updated');
    }

    // Add the modifiedAt field
    const modifiedAt = new Date().toISOString();  // Current timestamp in ISO 8601 format
    updateExpression += ', modifiedAt = :modifiedAt';
    expressionAttributeValues[':modifiedAt'] = modifiedAt;

    console.log('Update Expression:', updateExpression);
    console.log('Expression Attribute Values:', expressionAttributeValues);

    // Step 6: Construct the response
    const addedItemsResponse = addedItems.length > 0 ? `Added Items: ${JSON.stringify(addedItems)}` : null;
    const removedItemsResponse = removedItems.length > 0 ? `Removed Items: ${JSON.stringify(removedItems)}` : null;
    const addedSpecialsResponse = addedSpecials.length > 0 ? `Added Specials: ${JSON.stringify(addedSpecials)}` : null;
    const removedSpecialsResponse = removedSpecials.length > 0 ? `Removed Specials: ${JSON.stringify(removedSpecials)}` : null;

    // Step 7: If no changes, return response
    if (changes.length === 0 && !addedItemsResponse && !removedItemsResponse && !addedSpecialsResponse && !removedSpecialsResponse) {
      console.log('No changes detected');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No changes made' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Step 8: Update the order in DynamoDB
    const updateParams = {
      TableName: 'Pota-To-Go-orders',
      Key: { orderId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    await dynamoDB.send(new UpdateCommand(updateParams));
    console.log(`Order ${orderId} updated successfully`);

    // Step 9: Return success response with changes
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Order ${orderId} updated successfully`,
        changes,
        addedItems: addedItemsResponse,
        removedItems: removedItemsResponse,
        addedSpecials: addedSpecialsResponse,
        removedSpecials: removedSpecialsResponse,
        modifiedAt: modifiedAt,  
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
