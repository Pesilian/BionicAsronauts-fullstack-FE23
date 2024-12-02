const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.getMenu = async event => {
  try {
    const menuId = event.pathParameters.menuId;

    if (!menuId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Menu ID is required' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const getParams = {
      TableName: 'Pota-To-Go-menu',
      Key: { menuId },
    };

    const result = await dynamoDB.send(new GetCommand(getParams));

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Menu not found' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Menu fetched successfully',
        menu: result.Item,
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
