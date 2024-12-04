import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const addToSpecials = async event => {
  try {
    const { name, items, price } = event;

    console.log(event);

    if (!name || !items || !price) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Name, items, and price are required',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const specialsId = Math.floor(Math.random() * 1000000).toString();

    const putParams = {
      TableName: 'Pota-To-Go-specials',
      Item: {
        specialsName: name,
        specialsId,
        items,
        price,
        updatedAt: new Date().toISOString(),
      },
    };

    await dynamoDB.send(new PutCommand(putParams));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Special added successfully',
        specialsName: name,
        specialsId,
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
