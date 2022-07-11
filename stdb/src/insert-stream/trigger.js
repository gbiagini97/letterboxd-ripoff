"use strict";
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

module.exports.handler = async (event) => {
  console.log("EVENT: " + JSON.stringify(event));

  for (const record of event.Records) {
    const item = unmarshall(record.dynamodb.NewImage);
    console.log(JSON.stringify(item));

    switch (item.__typename) {
      case "REVIEW":
        await updateFilmAndUser(item);
        break;
    }
  }
};

async function updateFilmAndUser(review) {
  console.log("REVIEW FLOW: " + JSON.stringify(review));

  const client = new DynamoDBClient();
  const doc = DynamoDBDocumentClient.from(client);

  const res = await doc.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            //update last update date for the film
            TableName: process.env.SINGLE_TABLE_ID,
            Key: {
              PK: review.SK,
              SK: review.SK,
            },
            UpdateExpression: "SET #updatedAt = :updatedAt",
            ExpressionAttributeNames: {
              "#updatedAt": "updatedAt",
            },
            ExpressionAttributeValues: {
              ":updatedAt": new Date().toISOString(),
            },
            ConditionExpression:
              "attribute_exists(PK) AND attribute_exists(SK)",
          },
        },
        {
          Update: {
            //update last update date for the user
            TableName: process.env.SINGLE_TABLE_ID,
            Key: {
              PK: review.PK,
              SK: review.PK,
            },
            UpdateExpression: "SET #updatedAt = :updatedAt",
            ExpressionAttributeNames: {
              "#updatedAt": "updatedAt",
            },
            ExpressionAttributeValues: {
              ":updatedAt": new Date().toISOString(),
            },
            ConditionExpression:
              "attribute_exists(PK) AND attribute_exists(SK)",
          },
        },
      ],
    })
  );
  console.log("RES: " + JSON.stringify(res));
}
