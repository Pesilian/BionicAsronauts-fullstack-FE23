const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.addToCart = async (event) => {
  try {
    const body =
      typeof event.body === 'string' ? JSON.parse(event.body) : event;

    let { cartId, cartItems, specials, price, customerName } = body;

    customerName = customerName || 'Guest';
    console.log('Parsed Customer Name:', customerName);

    if (!cartItems && !specials) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Either cartItems or specials must be provided.',
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (!price) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Price must be provided.',
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (!cartId) {
      cartId = Math.floor(Math.random() * 1000000).toString(); // Generate a random cart ID
    }

    const getCartParams = {
      TableName: 'Pota-To-Go-cart',
      Key: { cartId },
    };
    const existingCart = await dynamoDB.send(new GetCommand(getCartParams));
    const existingData = existingCart.Item || {};

    let updatedCart = { ...existingData, customerName };
    const currentItemsCount = Object.keys(existingData).filter(key =>
      key.startsWith('cartItem')
    ).length;
    const currentSpecialsCount = Object.keys(existingData).filter(key =>
      key.startsWith('specials')
    ).length;

    // Update the cart with new cartItems or specials
    if (cartItems) {
      const newItemKey = `cartItem${currentItemsCount + 1}`;
      updatedCart[newItemKey] = cartItems;
    }

    if (specials) {
      const newSpecialsKey = `specials${currentSpecialsCount + 1}`;
      updatedCart[newSpecialsKey] = specials;
    }

    // Update total price
    updatedCart.totalPrice = (existingData.totalPrice || 0) + price;
    updatedCart.updatedAt = new Date().toISOString();

    // Save updated cart in DynamoDB
    const putParams = {
      TableName: 'Pota-To-Go-cart',
      Item: {
        cartId,
        ...updatedCart,
      },
    };

    await dynamoDB.send(new PutCommand(putParams));

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Cart updated successfully',
        cartId,
        updatedCart,
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
