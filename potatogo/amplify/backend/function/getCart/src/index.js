const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.getCart = async event => {
  const cartId = event.queryStringParameters
    ? event.queryStringParameters.cartId
    : null;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (!cartId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'cartId is required',
      }),
      headers,
    };
  }

  try {
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
        headers,
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
        headers,
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        cartItems: result.Items,
      }),
      headers,
    };
  } catch (error) {
    console.error('Error occurred:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to process request',
        error: error.message,
      }),
      headers,
    };
  }
};
