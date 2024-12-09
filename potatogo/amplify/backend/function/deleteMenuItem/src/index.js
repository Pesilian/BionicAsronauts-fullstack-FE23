const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.deleteMenuItem = async event => {
  try {
    const { menuId } = event;

    if (!menuId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Menu id is required' }),
      };
    }

    const deleteParams = {
      TableName: 'Pota-To-Go-menu',
      Key: {
        menuId: menuId,
      },
    };

    await dynamoDB.send(new DeleteCommand(deleteParams));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Menu item with menu id: '${menuId}' deleted successfully.`,
      }),
    };
  } catch (error) {
    console.error('Error occurred:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Failed to process request',
        error: error.message,
      }),
    };
  }
};
