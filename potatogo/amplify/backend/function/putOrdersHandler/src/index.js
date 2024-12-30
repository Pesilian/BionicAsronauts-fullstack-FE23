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
    if (key.startsWith("orderItem")) {
      // Handle orderItemX updates
      if (!order[key]) {
        // Add new orderItemX
        order[key] = value;
        changeLog.added[key] = value;
      } else {
        // Update existing orderItemX
        const originalItem = { ...order[key] }; // Clone for changelog
        for (const attr in value) {
          if (attr === "toppings" && typeof value[attr] === "object") {
            // Handle toppings separately
            const [mergedArray, arrayChanges] = mergeToppings(order[key][attr], value[attr]);
            order[key][attr] = mergedArray;
            if (arrayChanges.added.length || arrayChanges.removed.length) {
              changeLog.updated[`${key}.${attr}`] = arrayChanges;
            }
          } else if (value[attr] === null) {
            // Remove attribute if null
            if (order[key][attr] !== undefined) {
              delete order[key][attr];
              changeLog.removed[`${key}.${attr}`] = originalItem[attr];
            }
          } else {
            // Add or update attribute
            if (order[key][attr] !== value[attr]) {
              changeLog.updated[`${key}.${attr}`] = {
                from: order[key][attr],
                to: value[attr],
              };
              order[key][attr] = value[attr];
            }
          }
        }
      }
    } else {
      // Handle other top-level updates
      if (value === null) {
        // Remove key
        if (order[key] !== undefined) {
          changeLog.removed[key] = order[key];
          delete order[key];
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
  }
  console.log("Completed applyUpdates. Updated order:", order);
  return order;
}

// Function to handle toppings
function mergeToppings(currentArray = [], updateObject) {
  console.log("Starting mergeToppings with currentArray:", currentArray, "and updateObject:", updateObject);

  const updatedArray = Array.isArray(currentArray) ? [...currentArray] : [];
  const arrayChanges = { added: [], removed: [] };

  // Handle removals
  if (updateObject.remove) {
    updateObject.remove.forEach((item) => {
      const index = updatedArray.indexOf(item);
      if (index !== -1) {
        updatedArray.splice(index, 1);
        arrayChanges.removed.push(item);
      }
    });
  }

  // Handle additions
  if (updateObject.add) {
    updateObject.add.forEach((item) => {
      if (!updatedArray.includes(item)) {
        updatedArray.push(item); // Avoid duplicates
        arrayChanges.added.push(item);
      }
    });
  }

  console.log("Completed mergeToppings. Resulting array:", updatedArray, "with changes:", arrayChanges);
  return [updatedArray, arrayChanges];
}
