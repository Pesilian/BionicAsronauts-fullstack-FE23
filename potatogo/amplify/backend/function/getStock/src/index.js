const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "Pota-To-Go-stock";

exports.handler = async (event) => {
  try {
    const params = {
      TableName: TABLE_NAME,
    };

    const data = await dynamoDB.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Stock retrieved successfully",
        data: data.Items,
      }),
    };
  } catch (error) {
    console.error("Error fetching stock:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to retrieve stock",
        error: error.message,
      }),
    };
  }
};
