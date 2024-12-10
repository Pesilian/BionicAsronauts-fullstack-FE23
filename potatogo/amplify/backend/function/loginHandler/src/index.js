const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const USERS_TABLE = "Pota-To-Go_users";

exports.handler = async (event) => {
  try {
    const { httpMethod, body } = event;

    if (httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    const { name, password } = JSON.parse(body);

    if (!name || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Name and password are required" }),
      };
    }

    const params = {
      TableName: USERS_TABLE,
      Key: { nickname: name },
    };

    const { Item } = await dynamoDB.get(params).promise();

    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    if (password !== Item.password) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid password" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Login successful", role: Item.role }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
