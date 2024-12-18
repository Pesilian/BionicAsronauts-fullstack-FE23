const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.deleteCartItem = async event => {
  try {
    const body = JSON.parse(event.body || '{}');
    const cartId = body.cartId;
    const itemToRemoveKey = body.itemToRemoveKey;

    if (!cartId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'cartId is required',
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (!itemToRemoveKey) {
      const deleteParams = {
        TableName: 'Pota-To-Go-cart',
        Key: { cartId },
      };

      await dynamoDB.send(new DeleteCommand(deleteParams));

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Cart ${cartId} removed successfully`,
        }),
        headers: { 'Content-Type': 'application/json' },
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
        body: JSON.stringify({ message: 'Cart not found' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (!existingCart.Item[itemToRemoveKey]) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `${itemToRemoveKey} not found in the cart`,
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const updateParams = {
      TableName: 'Pota-To-Go-cart',
      Key: { cartId },
      UpdateExpression: `REMOVE ${itemToRemoveKey}`,
      ReturnValues: 'ALL_NEW',
    };

    const updatedCart = await dynamoDB.send(new UpdateCommand(updateParams));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `${itemToRemoveKey} removed successfully`,
        updatedCart: updatedCart.Attributes,
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error occurred:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to update cart',
        error: error.message,
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
