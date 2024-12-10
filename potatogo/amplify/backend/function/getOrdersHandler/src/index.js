/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
  console.log('Full event:', JSON.stringify(event, null, 2));

  try {
    const queryParams = event.queryStringParameters || {};
    const { orderId, status, customerName, lastEvaluatedKey } = queryParams;

    console.log('Query Parameters:', { orderId, status, customerName, lastEvaluatedKey });

    // Fetch by Order ID
    if (orderId) {
      const queryParams = {
        TableName: process.env.Pota-To-Go-orders,
        KeyConditionExpression: 'orderId = :orderId',
        ExpressionAttributeValues: {
          ':orderId': orderId,
        },
      };

      const result = await dynamoDB.send(new QueryCommand(queryParams));
      return {
        statusCode: 200,
        body: JSON.stringify({ items: result.Items }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Build Scan Parameters
    let filterExpression = [];
    let expressionAttributeValues = {};

    if (status) {
      filterExpression.push('status = :status');
      expressionAttributeValues[':status'] = status;
    }

    if (customerName) {
      filterExpression.push('customerName = :customerName');
      expressionAttributeValues[':customerName'] = customerName;
    }

    const finalFilterExpression =
      filterExpression.length > 0 ? filterExpression.join(' AND ') : undefined;

    const scanParams = {
      TableName: process.env.Pota-To-Go-orders,
      FilterExpression: finalFilterExpression,
      ExpressionAttributeValues:
        Object.keys(expressionAttributeValues).length > 0
          ? expressionAttributeValues
          : undefined,
      ExclusiveStartKey: lastEvaluatedKey
        ? JSON.parse(lastEvaluatedKey)
        : undefined,
      Limit: status === 'done' ? 10 : undefined, // Limit only for 'done' orders
    };

    console.log('Scan Parameters:', scanParams);

    // Execute Scan
    const result = await dynamoDB.send(new ScanCommand(scanParams));
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: result.Items,
        lastEvaluatedKey: result.LastEvaluatedKey
          ? JSON.stringify(result.LastEvaluatedKey)
          : null,
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error occurred:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch orders', error: error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
