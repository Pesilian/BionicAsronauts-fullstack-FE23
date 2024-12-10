const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const USERS_TABLE = "Pota-To-Go-users";

exports.handler = async (event) => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));

    // Ensure the body is parsed correctly
    const { nickname, name, password, address, phone } = JSON.parse(event.body);

    // Log the parsed body to verify
    console.log("Parsed body:", { nickname, name, password, address, phone });

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
      Key: {
        nickname: nickname,
      },
    };

    const existingUser = await dynamoDB.send(new GetCommand(getParams));

    console.log("Existing user:", existingUser);

    if (existingUser.Item) {
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
        nickname: nickname,
        name: name,
        password: password,
        address: address,
        phone: phone,
        role: null,
      },
    };

    await dynamoDB.send(new PutCommand(putParams));

    console.log("User successfully added:", putParams.Item);

    return {
      statusCode: 200,
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
