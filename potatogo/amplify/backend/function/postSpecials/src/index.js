const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.addToSpecials = async (event) => {
  try {
    const body = JSON.parse(event.body);  
    const { ingridients, specialsName, price } = body;


    if (!specialsName || !ingridients || ingridients.length === 0 || price === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Specialsname, ingridients, and price are required',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    let updatedItems = {};

   
    ingridients.forEach((item, index) => {
      const itemKey = `item${index + 1}`;
      updatedItems[itemKey] = {
        potatoe: item.potatoe, 
        toppings: item.toppings || [], 
        price: item.price || price,  
      };
    });

    const putParams = {
      TableName: 'Pota-To-Go-specials',
      Item: {
        specialsName,
        ...updatedItems,
        price,
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
        price,
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
