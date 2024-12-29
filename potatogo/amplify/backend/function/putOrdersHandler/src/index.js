// Import AWS SDK v3 modules
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

// Lambda handler
exports.handler = async (event) => {
  try {
    console.log("Event received:", event);

    const { orderId, updates, remove } = JSON.parse(event.body);
    console.log("Parsed input:", { orderId, updates, remove });

    const tableName = "Pota-To-Go-orders"; 

    if (!orderId || (!updates && !remove)) {
      console.error("Validation failed: Missing orderId, updates, or remove.");
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Missing orderId, updates, or remove keys." }),
      };
    }

    // Fetch current order
    const currentOrder = await dynamoDB.send(
      new GetCommand({
        TableName: tableName,
        Key: { orderId },
      })
    );
    console.log("Fetched order from DynamoDB:", currentOrder);

    if (!currentOrder.Item) {
      console.error("Order not found for orderId:", orderId);
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Order not found." }),
      };
    }

    // Track changes
    const changeLog = { added: {}, removed: {}, updated: {} };

    // Apply updates to the current order
    if (updates) {
      console.log("Applying updates:", updates);
      applyUpdates(currentOrder.Item, updates, changeLog);
      console.log("Order after updates:", currentOrder.Item);
    }

    // Handle removal of fields
    if (Array.isArray(remove)) {
      console.log("Handling removals:", remove);
      remove.forEach((key) => {
        if (currentOrder.Item[key] !== undefined) {
          changeLog.removed[key] = currentOrder.Item[key];
          delete currentOrder.Item[key];
        }
      });
      console.log("Order after removals:", currentOrder.Item);
    }

    // Add modifiedAt timestamp
    const modifiedAt = new Date().toISOString();
    currentOrder.Item.modifiedAt = modifiedAt;

    // Save updated order back to DynamoDB
    console.log("Saving updated order to DynamoDB:", currentOrder.Item);
    await dynamoDB.send(
      new PutCommand({
        TableName: tableName,
        Item: currentOrder.Item,
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Order updated successfully.",
        changes: changeLog,
        modifiedAt,
      }),
    };
  } catch (error) {
    console.error("Error during Lambda execution:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Internal Server Error." }),
    };
  }
};

// Function to apply updates
function applyUpdates(order, updates, changeLog) {
  console.log("Starting applyUpdates with:", updates);
  for (const [key, value] of Object.entries(updates)) {
    if (key === "remove") continue;

    if (value === "" && key === "orderNote") {
      // Set empty string instead of null for orderNote
      if (order[key] !== "") {
        changeLog.updated[key] = { from: order[key], to: "" };
      }
      order[key] = "";
    } else if (value === null) {
      // Remove key
      if (order[key] !== undefined) {
        changeLog.removed[key] = order[key];
      }
      delete order[key];
    } else if (Array.isArray(value) && Array.isArray(order[key])) {
      // Update array
      const [mergedArray, arrayChanges] = mergeArrays(order[key], value);
      order[key] = mergedArray;
      if (arrayChanges.added.length > 0 || arrayChanges.removed.length > 0 || arrayChanges.updated.length > 0) {
        changeLog.updated[key] = arrayChanges;
      }
    } else if (typeof value === "object" && typeof order[key] === "object") {
      // Recursive update for nested objects
      const nestedChanges = {};
      order[key] = applyUpdates(order[key], value, nestedChanges);
      if (Object.keys(nestedChanges.added).length > 0 || Object.keys(nestedChanges.removed).length > 0 || Object.keys(nestedChanges.updated).length > 0) {
        changeLog.updated[key] = nestedChanges;
      }
    } else {
      // Add or update key
      if (order[key] === undefined) {
        changeLog.added[key] = value;
      } else if (order[key] !== value) {
        changeLog.updated[key] = { from: order[key], to: value };
      }
      order[key] = value;
    }
  }
  console.log("Completed applyUpdates. Updated order:", order);
  return order;
}

// Function to handle arrays
function mergeArrays(currentArray, updatesArray) {
  console.log("Starting mergeArrays with currentArray:", currentArray, "and updatesArray:", updatesArray);
  const updatedArray = [...currentArray];
  const arrayChanges = { added: [], removed: [], updated: [] };

  updatesArray.forEach((item) => {
    if (item.remove) {
      // Remove item
      const index = updatedArray.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        arrayChanges.removed.push(updatedArray[index]);
        updatedArray.splice(index, 1);
      }
    } else {
      // Add or update item
      const index = updatedArray.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        const originalItem = updatedArray[index];
        updatedArray[index] = { ...updatedArray[index], ...item };
        arrayChanges.updated.push({
          id: item.id,
          from: originalItem,
          to: updatedArray[index],
        });
      } else {
        updatedArray.push(item);
        arrayChanges.added.push(item);
      }
    }
  });

  console.log("Completed mergeArrays. Resulting array:", updatedArray, "with changes:", arrayChanges);
  return [updatedArray, arrayChanges];
}
