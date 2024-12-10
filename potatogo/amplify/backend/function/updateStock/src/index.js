const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "Pota-To-Go-stock";

exports.handler = async (event) => {
  try {
    // Läs in data från event.body
    const { id, updates } = JSON.parse(event.body);

    // Kontrollera att både id och updates skickades in
    if (!id || !updates || Object.keys(updates).length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Item ID and at least one update field are required.",
        }),
      };
    }

    const updateKeys = Object.keys(updates);
    const updateExpression = `SET ${updateKeys
      .map((key, i) => `#${key} = :value${i}`)
      .join(", ")}`;
    const expressionAttributeNames = updateKeys.reduce((acc, key) => {
      acc[`#${key}`] = key;
      return acc;
    }, {});
    const expressionAttributeValues = updateKeys.reduce((acc, key, i) => {
      acc[`:value${i}`] = updates[key];
      return acc;
    }, {});

    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    };

    // Utför uppdateringen
    const result = await dynamoDB.update(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Item updated successfully.",
        updatedAttributes: result.Attributes,
      }),
    };
  } catch (error) {
    console.error("Error updating item:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to update item.",
        error: error.message,
      }),
    };
  }
};
