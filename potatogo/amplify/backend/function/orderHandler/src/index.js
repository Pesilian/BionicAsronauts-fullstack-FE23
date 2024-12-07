const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.createguestOrder = async event => {
  console.log('Full event:', JSON.stringify(event, null, 2));

  try {
    const cartId = event.cartId;

    console.log('Parsed Cart Id:', cartId);

    if (!cartId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Cart Id is required' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const queryParams = {
      TableName: 'Pota-To-Go-cart',
      KeyConditionExpression: 'cartId = :cartId',
      ExpressionAttributeValues: {
        ':cartId': cartId,
      },
    };
    const result = await dynamoDB.send(new QueryCommand(queryParams));

    console.log(
      'DynamoDB Query Result:',
      JSON.stringify(result.Items, null, 2)
    );

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Cart not found' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const cart = result.Items[0];
    if (!cart || !cart.items) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Cart does not contain items' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const newOrderId = Math.floor(Math.random() * 1000000).toString();

    const newOrder = {
      orderId: newOrderId,
      items: cart.items,
      createdAt: new Date().toISOString(),
    };

    const putParams = {
      TableName: 'Pota-To-Go-orders',
      Item: {
        orderId: newOrder.orderId,
        items: JSON.stringify(newOrder.items),
        createdAt: newOrder.createdAt,
      },
    };

    await dynamoDB.send(new PutCommand(putParams));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Order created successfully',
        orderId: newOrder.orderId,
        items: newOrder.items,
        createdAt: newOrder.createdAt,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Error occurred:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to process request',
        error: error.message,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};
