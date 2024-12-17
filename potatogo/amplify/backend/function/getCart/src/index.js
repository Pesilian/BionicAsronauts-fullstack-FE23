const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.getCart = async event => {
  const body = event;
  const cartId = body.cartId;

  try {
    if (!cartId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'cartId is required',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const getCartParams = {
      TableName: 'Pota-To-Go-cart',
      Key: { cartId },
    };

    const existingCart = await dynamoDB.send(new GetCommand(getCartParams));

    if (!existingCart.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Cart not found',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const scanParams = {
      TableName: 'Pota-To-Go-cart',
      FilterExpression: 'cartId = :cartId',
      ExpressionAttributeValues: {
        ':cartId': cartId,
      },
    };

    const result = await dynamoDB.send(new ScanCommand(scanParams));

    if (result.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No items found for this cart' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        cartItems: result.Items,
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
