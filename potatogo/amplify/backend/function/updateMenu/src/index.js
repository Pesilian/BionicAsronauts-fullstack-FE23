const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.updateMenuItem = async event => {
  try {
    const body = event;

    const { menuId, menuItem, price } = body;

    if (!menuId || (!menuItem && !price)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'MenuId and changes (item or price) are required',
        }),
      };
    }

    let updateExpression = 'set';
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (menuItem) {
      updateExpression += ' #menuItem = :menuItem';
      expressionAttributeValues[':menuItem'] = menuItem;
      expressionAttributeNames['#menuItem'] = 'menuItem';
    }

    if (price) {
      if (menuItem) updateExpression += ',';
      updateExpression += ' price = :price';
      expressionAttributeValues[':price'] = price;
    }

    const updateParams = {
      TableName: 'Pota-To-Go-menu',
      Key: {
        menuId: menuId,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW',
    };

    const result = await dynamoDB.send(new UpdateCommand(updateParams));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Menu item with menuId '${menuId}' updated successfully.`,
        updatedmenu: result.Attributes,
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
