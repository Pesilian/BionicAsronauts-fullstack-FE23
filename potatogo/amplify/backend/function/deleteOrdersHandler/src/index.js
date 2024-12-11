/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    // Extract the `id` from the pathParameters
    const { id } = event.pathParameters;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Order ID is required" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    const params = {
      TableName: 'Pota-To-Go-orders',
      Key: { orderId: id },
    };

    await dynamoDB.send(new DeleteCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Order ${id} deleted successfully` }),
      headers: { "Content-Type": "application/json" },
    };
  } catch (error) {
    console.error("Error deleting order:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to delete order",
        error: error.message,
      }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
