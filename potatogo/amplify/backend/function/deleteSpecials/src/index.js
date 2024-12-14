const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.deleteSpecials = async event => {
  try {
    const { specialsName } = event;

    if (!specialsName) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'specialsName is required' }),
      };
    }

    const deleteParams = {
      TableName: 'Pota-To-Go-specials',
      Key: {
        specialsName: specialsName,
      },
    };

    await dynamoDB.send(new DeleteCommand(deleteParams));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Special with specialsName '${specialsName}' deleted successfully.`,
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
