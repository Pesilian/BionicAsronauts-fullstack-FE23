/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_POTATOGOORDERS_ARN
	STORAGE_POTATOGOORDERS_NAME
	STORAGE_POTATOGOORDERS_STREAMARN
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    try {
        // Retrieve the table name from environment variables
        const tableName = process.env.STORAGE_POTATOGODB_NAME;
        console.log("Table name:", tableName);

        if (!tableName) {
            throw new Error("Table name is not set in environment variables.");
        }

        const params = {
            TableName: tableName,
        };

        const result = await dynamoDB.scan(params).promise();
        console.log('DynamoDB Scan Result:', JSON.stringify(result.Items));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Enable CORS
                "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify(result.Items),
        };
    } catch (error) {
        console.error('Error fetching orders:', error);

        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", // Enable CORS
                "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify({
                message: 'Failed to fetch orders',
                error: error.message,
            }),
        };
    }
};
