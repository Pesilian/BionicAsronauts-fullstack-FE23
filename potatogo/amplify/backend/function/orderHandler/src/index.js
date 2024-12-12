const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.createguestOrder = async (event) => {
  console.log('Full event:', JSON.stringify(event, null, 2));

  try {
    // Extract cartId and customerName from the event body
    const body = JSON.parse(event.body);
    const cartId = body.cartId;
    const customerName = body.customerName || 'Guest';
    console.log('Parsed Cart Id:', cartId);
    console.log('Parsed Customer Name:', customerName);

    if (!cartId) {
      console.error('Missing cartId in body');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Cart Id is required in the request body' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Retrieve cart data from the cart table
    const getCartParams = {
      TableName: 'Pota-To-Go-cart',
      Key: { cartId },
    };
    const cartData = await dynamoDB.send(new GetCommand(getCartParams));
    const cart = cartData.Item;

    if (!cart) {
      console.error('Cart not found in database');
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Cart not found' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Extract cartItems and specials
    const orderItems = Object.keys(cart)
      .filter(key => key.startsWith('cartItem'))
      .map(key => cart[key]);

    const specials = Object.keys(cart)
      .filter(key => key.startsWith('specials'))
      .map(key => cart[key]);

    console.log('Order Items:', JSON.stringify(orderItems));
    console.log('Specials:', JSON.stringify(specials));

    // Create a new order
    const orderId = cartId;
    const newOrder = {
      orderId,
      customerName,
      orderItems,
      specials,
      orderStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    console.log('New Order Details:', JSON.stringify(newOrder));

    // Insert the new order into the orders table
    const putParams = {
      TableName: 'Pota-To-Go-orders',
      Item: newOrder,
    };
    console.log('Put Parameters:', JSON.stringify(putParams));

    await dynamoDB.send(new PutCommand(putParams));
    console.log('Order successfully added to the orders table');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Order created successfully',
        orderId: newOrder.orderId,
        customerName: newOrder.customerName,
        orderItems: newOrder.orderItems,
        specials: newOrder.specials,
        orderStatus: newOrder.orderStatus,
        createdAt: newOrder.createdAt,
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
