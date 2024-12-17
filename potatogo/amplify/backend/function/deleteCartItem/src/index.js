const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.deleteCartItem = async event => {
  try {
    const body = event; // Data från förfrågan
    const cartId = body.cartId;
    const itemToRemoveKey = body.itemToRemoveKey; // Nyckeln för objektet som ska tas bort (t.ex. "item2")

    if (!cartId || !itemToRemoveKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'cartId and itemToRemoveKey are required',
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

    if (!existingCart.Item[itemToRemoveKey]) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `${itemToRemoveKey} not found in the cart`,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const updateParams = {
      TableName: 'Pota-To-Go-cart',
      Key: { cartId },
      UpdateExpression: `REMOVE ${itemToRemoveKey}`,
      ReturnValues: 'ALL_NEW',
    };

    const result = await dynamoDB.send(new UpdateCommand(updateParams));

    let updatedTotalPrice = 0;
    Object.keys(result.Attributes).forEach(key => {
      if (key !== 'totalPrice' && result.Attributes[key].price) {
        updatedTotalPrice += result.Attributes[key].price;
      }
    });

    const totalPriceParams = {
      TableName: 'Pota-To-Go-cart',
      Key: { cartId },
      UpdateExpression: 'SET totalPrice = :totalPrice',
      ExpressionAttributeValues: {
        ':totalPrice': updatedTotalPrice,
      },
    };

    await dynamoDB.send(new UpdateCommand(totalPriceParams));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `${itemToRemoveKey} removed successfully`,
        cartId,
        updatedCart: result.Attributes,
        totalPrice: updatedTotalPrice,
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
        message: 'Failed to update cart',
        error: error.message,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};
