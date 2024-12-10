const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.addToCart = async event => {
  try {
    const body = event; // Använd JSON från event
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

    let cartId = body.cartId;

    // Om inget cartId finns, generera ett nytt
    if (!cartId) {
      cartId = Math.floor(Math.random() * 1000000).toString();
    }

    // Kontrollera om cart redan finns
    const getCartParams = {
      TableName: 'Pota-To-Go-cart',
      Key: { cartId },
    };
    const existingCart = await dynamoDB.send(new GetCommand(getCartParams));
    let existingItems = {};
    let existingTotalPrice = 0;

    if (existingCart.Item) {
      existingItems = existingCart.Item;
      existingTotalPrice = existingCart.Item.totalPrice || 0;
    }

    let newItemsTotalPrice = 0;
    let updatedItems = { ...existingItems };

    for (let i = 0; i < menuItems.length; i++) {
      const item = menuItems[i];
      const itemKey = `item${i + 1}`;

      if (!item.potatoe || typeof item.price !== 'number') {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: `Each item must include 'potatoe' and a numeric 'price'`,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        };
      }

      updatedItems[itemKey] = {
        potatoe: item.potatoe,
        toppings: item.toppings || [],
        price: item.price,
      };

      newItemsTotalPrice += item.price;
    }

    const totalPrice = existingTotalPrice + newItemsTotalPrice;

    const putParams = {
      TableName: 'Pota-To-Go-cart',
      Item: {
        cartId,
        ...updatedItems,
        totalPrice,
        updatedAt: new Date().toISOString(),
      },
    };

    await dynamoDB.send(new PutCommand(putParams));

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Cart updated successfully',
        cartId,
        items: updatedItems,
        totalPrice,
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
