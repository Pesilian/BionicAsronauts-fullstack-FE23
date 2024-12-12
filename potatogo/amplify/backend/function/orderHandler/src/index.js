const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.createguestOrder = async (event) => {
  console.log('Full event:', JSON.stringify(event, null, 2));

  try {
    // Extract cartId from the event body
    const body = JSON.parse(event.body);
    const cartId = body.cartId;
    console.log('Parsed Cart Id from body:', cartId);

    if (!cartId) {
      console.error('Missing cartId in body');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Cart Id is required in the request body' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Query the cart from DynamoDB
    const queryParams = {
      TableName: 'Pota-To-Go-cart',
      KeyConditionExpression: 'cartId = :cartId',
      ExpressionAttributeValues: {
        ':cartId': cartId,
      },
    };
    console.log('Query Parameters:', JSON.stringify(queryParams));

    const result = await dynamoDB.send(new QueryCommand(queryParams));
    console.log('DynamoDB Query Result:', JSON.stringify(result.Items, null, 2));

    if (!result.Items || result.Items.length === 0) {
      console.error('Cart not found in database');
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Cart not found' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const cart = result.Items[0];
    if (!cart || !cart.cartItems) {
      console.error('Cart does not contain any cartItems');
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Cart does not contain items' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Create a new order
    const newOrderId = Math.floor(Math.random() * 1000000).toString();
    const newOrder = {
      orderId: newOrderId,
      cartItems: cart.cartItems,
      orderStatus: 'pending',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };

    console.log('New Order Details:', JSON.stringify(newOrder));

    // Insert the new order into the orders table
    const putParams = {
      TableName: 'Pota-To-Go-orders',
      Item: {
        orderId: newOrder.orderId,
        cartItems: JSON.stringify(newOrder.cartItems),
        orderStatus: newOrder.orderStatus,
        createdAt: newOrder.createdAt,
        modifiedAt: newOrder.modifiedAt,
      },
    };
    console.log('Put Parameters:', JSON.stringify(putParams));

    await dynamoDB.send(new PutCommand(putParams));
    console.log('Order successfully added to the orders table');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Order created successfully',
        orderId: newOrder.orderId,
        cartItems: newOrder.cartItems,
        orderStatus: newOrder.orderStatus,
        createdAt: newOrder.createdAt,
        modifiedAt: newOrder.modifiedAt,
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error occurred:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to process request',
        error: error.message,
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
