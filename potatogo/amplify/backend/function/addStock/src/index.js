const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "Pota-To-Go-stock";

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const { name, price, quantity } = body;

    if (!name || !price || !quantity) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "All fields are required: name, price, quantity",
        }),
      };
    }

    // Kontrollera om ett objekt med samma namn redan finns
    const scanParams = {
      TableName: TABLE_NAME,
      FilterExpression: "#n = :name",
      ExpressionAttributeNames: {
        "#n": "name",
      },
      ExpressionAttributeValues: {
        ":name": name,
      },
    };

    const existingItems = await dynamoDB.scan(scanParams).promise();

    if (existingItems.Items && existingItems.Items.length > 0) {
      // Om ett objekt med samma namn finns, uppdatera kvantiteten
      const existingItem = existingItems.Items[0];

      const updateParams = {
        TableName: TABLE_NAME,
        Key: { id: existingItem.id },
        UpdateExpression: "SET quantity = quantity + :quantity",
        ExpressionAttributeValues: {
          ":quantity": quantity,
        },
        ReturnValues: "UPDATED_NEW",
      };

      const updatedItem = await dynamoDB.update(updateParams).promise();

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Quantity updated successfully",
          updatedItem,
        }),
      };
    } else {
      // Om inget objekt med samma namn finns, lägg till nytt objekt
      const params = {
        TableName: TABLE_NAME,
        Item: {
          id: AWS.util.uuid.v4(), // Generera ett unikt id
          name,
          price,
          quantity,
        },
      };

      await dynamoDB.put(params).promise();

      return {
        statusCode: 201,
        body: JSON.stringify({ message: "Item added successfully" }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to add or update item",
        error: error.message,
      }),
    };
  }
};
