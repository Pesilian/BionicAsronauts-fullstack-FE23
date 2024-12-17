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

// DynamoDB Client
const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Use environment variable for the table name
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  console.log('Full event:', JSON.stringify(event, null, 2));

  try {
    const queryParams = event.queryStringParameters || {};
    const { orderId, orderStatus, customerName, lastEvaluatedKey } = queryParams;

    console.log('Query Parameters:', { orderId, orderStatus, customerName, lastEvaluatedKey });

    let result;

    // Fetch by Order ID
    if (orderId) {
      const query = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'orderId = :orderId',
        ExpressionAttributeValues: {
          ':orderId': orderId,
        },
      };

      result = await dynamoDB.send(new QueryCommand(query));
    } else {
      // Build Scan Parameters for customerName/orderStatus filters
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
        TableName: TABLE_NAME,
        FilterExpression: filterExpression.length > 0 ? filterExpression.join(' AND ') : undefined,
        ExpressionAttributeValues:
          Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
        ExpressionAttributeNames:
          Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined, // Pagination
        Limit: 10, // Items per page
      };

      console.log('Scan Parameters:', scanParams);

      result = await dynamoDB.send(new ScanCommand(scanParams));
    }

    // Create the response object
    const data = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        items: result.Items || [],
        lastEvaluatedKey: result.LastEvaluatedKey || null,
      },
    };

    return {JSON.stringify(data) }; // Stringify the entire response
  } catch (error) {
    console.error('Error occurred:', error);

    const errorResponse = {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: {
        message: 'Failed to fetch orders',
        error: error.message,
      },
    };

    return { body: JSON.stringify(errorResponse) }; // Stringify the error response
  }
};
