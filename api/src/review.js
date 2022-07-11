"use strict";
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} = require("@aws-sdk/lib-dynamodb");

// POST /users/{userID}/reviews
const create = async (event) => {
  console.log("EVENT: " + JSON.stringify(event));
  const userID = event.pathParameters.userID;

  const body = JSON.parse(event.body);
  console.log("BODY: " + JSON.stringify(body));

  //validate input
  if (!body.filmID)
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid input",
      }),
    };

  // build item accordingly to the domain
  const item = {
    PK: "USER#" + userID,
    SK: "FILM#" + body.filmID,
    __typename: "REVIEW",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: body?.description,
    filmID: body.filmID,
    userID: userID,
    rating: body?.rating,
  };

  console.log("ITEM " + JSON.stringify(item));

  // init the client
  const client = new DynamoDBClient();
  const doc = DynamoDBDocumentClient.from(client);

  try {
    const res = await doc.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            ConditionCheck: {
              TableName: process.env.SINGLE_TABLE_ID,
              Key: {
                PK: item.SK,
                SK: item.SK,
              },
              ConditionExpression:
                "attribute_exists(SK) AND attribute_exists(SK)",
              ReturnValuesOnConditionCheckFailure: "NONE",
            },
          },
          {
            Put: {
              TableName: process.env.SINGLE_TABLE_ID,
              Item: item,
            },
          },
        ],
      })
    );
    console.log("RES: " + JSON.stringify(res));
    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (err) {
    return {
      statusCode: 503,
      body: JSON.stringify({
        message: "Error while creating review",
        error: err,
      }),
    };
  }
};

module.exports = {
  create,
};
