const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.addToSpecials = async event => {
  try {
    const body = event;
    const menuItems = body.menuItems;
    const specialsName = body.specialsName;
    const totalPrice = body.totalPrice;

    if (
      !specialsName ||
      !menuItems ||
      menuItems.length === 0 ||
      totalPrice === undefined
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Specialsname, menu items and totalPrice are required',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    let updatedItems = {};

    menuItems.forEach((item, index) => {
      const itemKey = `item${index + 1}`;
      updatedItems[itemKey] = {
        potatoe: item.potatoe,
        toppings: item.toppings || [],
        price: item.price,
      };
    });

    const putParams = {
      TableName: 'Pota-To-Go-specials',
      Item: {
        specialsName,
        ...updatedItems,
        totalPrice,
        updatedAt: new Date().toISOString(),
      },
    };

    await dynamoDB.send(new PutCommand(putParams));

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Specials posted successfully',
        specialsName,
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
