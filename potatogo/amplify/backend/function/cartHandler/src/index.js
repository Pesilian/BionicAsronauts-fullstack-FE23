const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.addToCart = async event => {
  try {
    const body = JSON.parse(event.body || '{}');
    const menuItems = body.menuItems;

    if (!menuItems || menuItems.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'At least one menu item is required' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const cartId = body.cartId;
    let cart = null;

    if (cartId) {
      const getParams = {
        TableName: 'Pota-To-Go-cart',
        Key: { cartId },
      };
      const cartResult = await dynamoDB.send(new GetCommand(getParams));

      if (cartResult.Item) {
        cart = cartResult.Item;
      }
    }

    let newCartId;
    let newCartItems = cart ? cart.items : [];

    if (cart) {
      newCartItems = [...newCartItems, ...menuItems];
      newCartId = cart.cartId;
    } else {
      newCartId = Math.floor(Math.random() * 1000000).toString();
      newCartItems = menuItems;
    }

    const putParams = {
      TableName: 'Pota-To-Go-cart',
      Item: {
        cartId: newCartId,
        items: newCartItems,
        createdAt: new Date().toISOString(),
      },
    };

    await dynamoDB.send(new PutCommand(putParams));

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Cart updated successfully',
        cartId: newCartId,
        items: newCartItems,
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
