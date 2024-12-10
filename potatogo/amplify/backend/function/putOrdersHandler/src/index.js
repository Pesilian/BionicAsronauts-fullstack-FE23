/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  try {
    const body = JSON.parse(event.body);
    const { orderId, status, customerName } = body;

    if (!orderId || !status) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'OrderId and Status are required' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const params = {
      TableName: 'Pota-To-Go-orders',
      Key: { orderId },
      UpdateExpression: 'SET status = :status',
      ExpressionAttributeValues: {
        ':status': status,
      },
    };

    if (customerName) {
      params.UpdateExpression += ', customerName = :customerName';
      params.ExpressionAttributeValues[':customerName'] = customerName;
    }

    await dynamoDB.send(new UpdateCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order updated successfully' }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error updating order:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update order', error: error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};

