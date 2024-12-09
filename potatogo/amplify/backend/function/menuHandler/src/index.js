const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.addToMenu = async event => {
  try {
    const body = event;
    const { menuItem, category, price } = body;

    if (!menuItem || !category || !price) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Menu item, category and price are required',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const putParams = {
      TableName: 'Pota-To-Go-menu',
      Item: {
        menuItem,
        category,
        price,
        createdAt: new Date().toISOString(),
      },
    };

    await dynamoDB.send(new PutCommand(putParams));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Menu item added successfully',
        menuItem,
        category,
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
