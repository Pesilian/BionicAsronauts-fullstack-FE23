const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.getMenu = async event => {
  try {
    const scanParams = {
      TableName: 'Pota-To-Go-menu',
    };

    const result = await dynamoDB.send(new ScanCommand(scanParams));

    if (result.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'No menu items found' }),
      };
    }

    // Gruppér items efter kategori
    const groupedItems = result.Items.reduce((acc, item) => {
      const category = item.category || 'Uncategorized'; // Default till 'Uncategorized' om ingen kategori finns
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Menu fetched successfully',
        menuItems: groupedItems,
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
