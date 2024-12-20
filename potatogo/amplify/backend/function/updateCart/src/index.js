const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.updateCart = async event => {
  try {
    const body = event;
    const cartId = body.cartId;
    const newItem = body.newItem;

    if (!cartId || !newItem) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'cartId and newItem are required',
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

    const existingItems = existingCart.Item;
    const existingTotalPrice = existingCart.Item.totalPrice || 0;

    let nextItemNumber = 1;
    while (existingItems[`item${nextItemNumber}`]) {
      nextItemNumber++;
    }

    const updatedItems = {
      ...existingItems,
      [`item${nextItemNumber}`]: {
        potatoe: newItem.potatoe,
        toppings: newItem.toppings,
        price: newItem.price,
      },
    };

    const updatedTotalPrice = existingTotalPrice + newItem.price;

    const putParams = {
      TableName: 'Pota-To-Go-cart',
      Item: {
        cartId,
        ...updatedItems,
        totalPrice: updatedTotalPrice,
        updatedAt: new Date().toISOString(),
      },
    };

    await dynamoDB.send(new PutCommand(putParams));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Item added successfully',
        cartId,
        updatedItems,
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
