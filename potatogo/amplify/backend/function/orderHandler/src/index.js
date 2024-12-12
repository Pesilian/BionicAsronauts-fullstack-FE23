const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.createOrderFunction = async (event) => {
  console.log('Full event:', JSON.stringify(event, null, 2));

  try {
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

    // Retrieve the cart from the cart table
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

    // Replace cart keys with order keys where applicable
    const orderData = {};
    Object.entries(cart).forEach(([key, value]) => {
      if (key.startsWith('cart')) {
        const orderKey = key.replace('cart', 'order');
        orderData[orderKey] = value;
      } else {
        orderData[key] = value; // Copy other fields as-is
      }
    });

    // Add missing fields
    orderData.orderId = cartId; // Use cartId as orderId
    orderData.customerName = customerName;
    orderData.orderStatus = 'pending'; // Default order status
    orderData.createdAt = new Date().toISOString(); // Timestamp for order creation

    console.log('Final Order Data:', JSON.stringify(orderData));

    // Save the new order to the orders table
    const putParams = {
      TableName: 'Pota-To-Go-orders',
      Item: orderData,
    };

    await dynamoDB.send(new PutCommand(putParams));
    console.log('Order successfully added to the orders table');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Order created successfully',
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        orderStatus: orderData.orderStatus,
        createdAt: orderData.createdAt,
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
