const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: "eu-north-1" });

const USERS_TABLE = "Pota-To-Go_users";

exports.handler = async (event) => {
  try {
    // Kontrollera om body är en sträng eller objekt
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    const { nickname, name, password, address, phone } = body || {};

    if (!nickname || !name || !password || !address || !phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Nickname, name, password, address, and phone are required",
        }),
      };
    }

    const getParams = {
      TableName: USERS_TABLE,
      IndexName: "Nickname-index", // Använd GSI här
      KeyConditionExpression: "Nickname = :nickname",
      ExpressionAttributeValues: {
        ":nickname": nickname,
      },
    };

    const { Item } = await dynamoDB.query(getParams).promise();

    // Låt inte flera användare ha samma nickname
    if (Item && Item.length > 0) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: "User with this nickname already exists",
        }),
      };
    }

    const putParams = {
      TableName: USERS_TABLE,
      Item: {
        Name: name,
        Nickname: nickname,
        Password: password,
        Address: address,
        Phone: phone,
        Role: null, // Vi sätter roll senare
      },
    };

    await dynamoDB.put(putParams).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "User registered successfully" }),
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to register user",
        error: error.message,
      }),
    };
  }
};
