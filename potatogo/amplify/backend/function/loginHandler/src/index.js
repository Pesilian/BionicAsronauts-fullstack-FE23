const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const USERS_TABLE = "Pota-To-Go-users";

exports.handler = async (event) => {
  try {
    const { httpMethod, body, headers: requestHeaders } = event;

    // List of allowed origins
    const allowedOrigins = [
      "http://localhost:3000",
      "https://d1qddrr08bfccp.cloudfront.net",
    ];

    // Get the origin from the request
    const origin = requestHeaders.origin || "";

    // Set the correct CORS origin dynamically
    const responseHeaders = {
      "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "https://d1qddrr08bfccp.cloudfront.net",
      "Access-Control-Allow-Methods": "OPTIONS, POST",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    };

    if (httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({ message: "CORS preflight successful" }),
      };
    }

    if (httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: responseHeaders,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    const { nickname, password } = JSON.parse(body);

    if (!nickname || !password) {
      return {
        statusCode: 400,
        headers: responseHeaders,
        body: JSON.stringify({ error: "Nickname and password are required" }),
      };
    }

    const params = {
      TableName: USERS_TABLE,
      Key: { nickname },
    };

    const { Item } = await dynamoDB.get(params).promise();

    if (!Item) {
      return {
        statusCode: 404,
        headers: responseHeaders,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    if (password !== Item.password) {
      return {
        statusCode: 401,
        headers: responseHeaders,
        body: JSON.stringify({ error: "Invalid password" }),
      };
    }

    // Send full user details upon successful login
    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({
        message: "Login successful",
        role: Item.role,
        name: Item.name,
        address: Item.address,
        phone: Item.phone,
        email: Item.email,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
