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
    const body =
      typeof event.body === 'string' ? JSON.parse(event.body) : event;

    const cartId = body.cartId;
    const customerName = body.customerName || 'Guest';
    const orderNote = body.orderNote || ''; 
    const totalPrice = body.totalPrice || 0; 

    console.log('Parsed Cart Id:', cartId);
    console.log('Parsed Customer Name:', customerName);
    console.log('Parsed Order Note:', orderNote);
    console.log('Parsed Total Price:', totalPrice);

    if (!cartId) {
      console.error('Missing cartId in body');
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Cart Id is required in the request body',
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

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

    const orderItems = Object.keys(cart)
      .filter((key) => key.startsWith('cartItem'))
      .reduce((acc, key) => {
        const orderKey = key.replace('cart', 'order');
        acc[orderKey] = cart[key];
        return acc;
      }, {});

    const specials = Object.keys(cart)
      .filter((key) => key.startsWith('specials'))
      .reduce((acc, key) => {
        acc[key] = cart[key];
        return acc;
      }, {});

    const generateOrderId = () => {
      return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    };

    const newOrder = {
      ...specials,
      ...orderItems,
      orderId: generateOrderId(),
      customerName,
      orderNote, 
      totalPrice, 
      orderStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    console.log('New Order Details:', JSON.stringify(newOrder));

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
        orderNote: newOrder.orderNote, 
        totalPrice: newOrder.totalPrice, 
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
