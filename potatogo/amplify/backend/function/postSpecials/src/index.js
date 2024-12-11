const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.addToSpecials = async event => {
  try {
    const body = event;
    const menuItems = body.menuItems;
    const specialsName = body.specialsName;
    const totalPrice = body.totalPrice; // Ta emot totalPrice i body

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

    // Initiera objekt för att lagra uppdaterade items
    let updatedItems = {};

    // Iterera genom menyn och lägg till varje item
    menuItems.forEach((item, index) => {
      const itemKey = `item${index + 1}`; // Dynamiskt sätt en nyckel för varje item, t.ex. item1, item2, etc.
      updatedItems[itemKey] = {
        potatoe: item.potatoe,
        toppings: item.toppings || [], // Om toppings inte finns, sätt en tom array
        price: item.price,
      };
    });

    // Uppdatera specialen med de nya items och totalPrice
    const putParams = {
      TableName: 'Pota-To-Go-specials',
      Item: {
        specialsName,
        ...updatedItems, // Sprid de dynamiska item-nycklarna
        totalPrice, // Ta emot och använd totalPrice från body
        updatedAt: new Date().toISOString(), // Tidsstämpel
      },
    };

    await dynamoDB.send(new PutCommand(putParams));

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Specials posted successfully',
        specialsName,
        items: updatedItems, // Returnera de nya item objekten
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
