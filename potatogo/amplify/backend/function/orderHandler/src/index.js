const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.createguestOrder = async (event) => {
  console.log('Full event:', JSON.stringify(event, null, 2));

  try {
    // Extract cartItems and customerName from the body
    const body = JSON.parse(event.body);
    const { cartItems, customerName } = body;

    console.log('Parsed cartItems:', JSON.stringify(cartItems));
    console.log('Parsed customerName:', customerName);

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error('Invalid or missing cartItems in body');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'cartItems is required and must be a non-empty array' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (!customerName) {
      console.error('Missing customerName in body');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'customerName is required' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Ensure unique orderId
    let newOrderId;
    while (true) {
      newOrderId = Math.floor(Math.random() * 1000000).toString();
      console.log('Generated orderId:', newOrderId);

      const checkParams = {
        TableName: 'Pota-To-Go-orders',
        Key: { orderId: newOrderId },
      };

      const existingOrder = await dynamoDB.send(new GetCommand(checkParams));
      if (!existingOrder.Item) {
        console.log('Unique orderId confirmed:', newOrderId);
        break;
      }

      console.warn('Duplicate orderId detected, regenerating...');
    }

    // Create a new order
    const newOrder = {
      orderId: newOrderId,
      customerName,
      cartItems,
      orderStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    console.log('New Order Details:', JSON.stringify(newOrder));

    // Insert the new order into the orders table
    const putParams = {
      TableName: 'Pota-To-Go-orders',
      Item: {
        orderId: newOrder.orderId,
        customerName: newOrder.customerName,
        cartItems: JSON.stringify(newOrder.cartItems),
        orderStatus: newOrder.orderStatus,
        createdAt: newOrder.createdAt,
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
        customerName: newOrder.customerName,
        cartItems: newOrder.cartItems,
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
