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

exports.handler = async event => {
  console.log('Full event:', JSON.stringify(event, null, 2));

  try {
    const queryParams = event.queryStringParameters || {};
    const { orderId, orderStatus, customerName, lastEvaluatedKey } =
      queryParams;

    console.log('Query Parameters:', {
      orderId,
      orderStatus,
      customerName,
      lastEvaluatedKey,
    });

    if (orderId) {
      const queryParams = {
        TableName: 'Pota-To-Go-orders',
        KeyConditionExpression: 'orderId = :orderId',
        ExpressionAttributeValues: {
          ':orderId': orderId,
        },
      };

      const result = await dynamoDB.send(new QueryCommand(queryParams));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          items: result.Items,
          lastEvaluatedKey: result.LastEvaluatedKey || null,
        },
      };
    }

    const filterExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (orderStatus) {
      filterExpression.push('#orderStatusAlias = :orderStatus');
      expressionAttributeValues[':orderStatus'] = orderStatus;
      expressionAttributeNames['#orderStatusAlias'] = 'orderStatus';
    }

    if (customerName) {
      filterExpression.push('customerName = :customerName');
      expressionAttributeValues[':customerName'] = customerName;
    }

    const scanParams = {
      TableName: 'Pota-To-Go-orders',
      FilterExpression:
        filterExpression.length > 0
          ? filterExpression.join(' AND ')
          : undefined,
      ExpressionAttributeValues:
        Object.keys(expressionAttributeValues).length > 0
          ? expressionAttributeValues
          : undefined,
      ExpressionAttributeNames:
        Object.keys(expressionAttributeNames).length > 0
          ? expressionAttributeNames
          : undefined,
      ExclusiveStartKey: lastEvaluatedKey
        ? JSON.parse(lastEvaluatedKey)
        : undefined,
      Limit: 50,
    };

    console.log('Scan Parameters:', scanParams);

    const result = await dynamoDB.send(new ScanCommand(scanParams));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        items: result.Items,
        lastEvaluatedKey: result.LastEvaluatedKey || null,
      },
    };
  } catch (error) {
    console.error('Error occurred:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to fetch orders',
        error: error.message,
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
