// const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
// const {
//   DynamoDBDocumentClient,
//   UpdateCommand,
// } = require('@aws-sdk/lib-dynamodb');

// const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// exports.updateSpecials = async event => {
//   try {
//     const body = event;

//     const { specialsName, items, price } = body;

//     if (!specialsName || (!items && !price)) {
//       return {
//         statusCode: 400,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           message: 'specialsName and changes (items or price) are required',
//         }),
//       };
//     }

//     let updateExpression = 'set';
//     const expressionAttributeValues = {};
//     const expressionAttributeNames = {};

//     if (items) {
//       updateExpression += ' #items = :items';
//       expressionAttributeValues[':items'] = items;
//       expressionAttributeNames['#items'] = 'items'; // Mappar alias till det reserverade nyckelordet
//     }

//     if (price) {
//       if (items) updateExpression += ',';
//       updateExpression += ' price = :price';
//       expressionAttributeValues[':price'] = price;
//     }

//     const updateParams = {
//       TableName: 'Pota-To-Go-specials',
//       Key: {
//         specialsName: specialsName,
//       },
//       UpdateExpression: updateExpression,
//       ExpressionAttributeValues: expressionAttributeValues,
//       ExpressionAttributeNames: expressionAttributeNames, // Lägg till detta
//       ReturnValues: 'ALL_NEW',
//     };

//     const result = await dynamoDB.send(new UpdateCommand(updateParams));

//     return {
//       statusCode: 200,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         message: `Special with specialsName '${specialsName}' updated successfully.`,
//         updatedSpecial: result.Attributes,
//       }),
//     };
//   } catch (error) {
//     console.error('Error occurred:', error);

//     return {
//       statusCode: 500,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         message: 'Failed to process request',
//         error: error.message,
//       }),
//     };
//   }
// };
