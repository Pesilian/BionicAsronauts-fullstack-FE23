const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.addToMenu = async event => {
  try {
    // Här använder vi hela eventet, utan att behöva använda body
    const menuItem = event.menuItem; // direkt från event

    if (!menuItem) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Menu item is required' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const menuId =
      event.menuId || Math.floor(Math.random() * 1000000).toString();

    const putParams = {
      TableName: 'Pota-To-Go-menu',
      Item: {
        menuId,
        menuItem, // Lägg till menuItem direkt här
        updatedAt: new Date().toISOString(),
      },
    };

    await dynamoDB.send(new PutCommand(putParams));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Menu item added successfully',
        menuId,
        menuItem,
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
