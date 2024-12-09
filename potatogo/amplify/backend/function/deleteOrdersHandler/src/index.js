/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_POTATOGODB_ARN
	STORAGE_POTATOGODB_NAME
	STORAGE_POTATOGODB_STREAMARN
Amplify Params - DO NOT EDIT */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  try {
    const body = JSON.parse(event.body);
    const { orderId } = body;

    if (!orderId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'OrderId is required' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const params = {
      TableName: 'Pota-To-Go-orders',
      Key: { orderId },
    };

    await dynamoDB.send(new DeleteCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order deleted successfully' }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error deleting order:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to delete order', error: error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
