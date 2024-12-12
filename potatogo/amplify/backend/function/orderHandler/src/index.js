const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
  console.log('Full event:', JSON.stringify(event, null, 2));

  try {
    // Adjust to handle both API Gateway and Lambda console inputs
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event;

    // Extract cartId and customerName
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

    // Replace cartItemX with orderItemX
    const orderItems = Object.keys(cart)
      .filter(key => key.startsWith('cartItem'))
      .reduce((acc, key) => {
        const orderKey = key.replace('cart', 'order'); // Replace cart with order
        acc[orderKey] = cart[key];
        return acc;
      }, {});

    // Extract specials
    const specials = Object.keys(cart)
      .filter(key => key.startsWith('specials'))
      .reduce((acc, key) => {
        acc[key] = cart[key];
        return acc;
      }, {});

    // Create a new order
    const newOrder = {
      ...specials, // Include specials as-is
      ...orderItems, // Include renamed order items
      orderId: cartId,
      customerName,
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
