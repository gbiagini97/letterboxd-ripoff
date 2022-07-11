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

    switch (item.__typename) {
      case "REVIEW":
        await updateFilmAndUser(item);
        break;
    }

    console.log(JSON.stringify(item));
  }
};

async function updateFilmAndUser(review) {
  console.log("REVIEW FLOW: " + JSON.stringify(review))
  
  const client = new DynamoDBClient();
  const doc = DynamoDBDocumentClient.from(client);

  try {
    const res = await doc.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: process.env.SINGLE_TABLE_ID,
              Key: {
                PK: review.SK,
                SK: review.SK,
              },
              UpdateExpression:
                "ADD #ratingSum :rating, #reviewsCount :one",
              ExpressionAttributeNames: {
                "#ratingSum": "ratingSum",
                "#reviewsCount": "reviewsCount",
              },
              ExpressionAttributeValues: {
                ":rating": review.rating,
                ":one": 1,
              },
            },
          },
          {
            Update: {
              TableName: process.env.SINGLE_TABLE_ID,
              Key: {
                PK: review.PK,
                SK: review.PK,
              },
              UpdateExpression: "ADD #reviewsCount :one",
              ExpressionAttributeNames: {
                "#reviewsCount": "reviewsCount",
              },
              ExpressionAttributeValues: {
                ":one": 1,
              },
              ConditionExpression:
                "attribute_exists(PK) AND attribute_exists(SK)",
            },
          },
        ],
      })
    );
    console.log("RES: " + JSON.stringify(res));
  } catch (err) {
    console.log("ERR: " + JSON.stringify(err));
  }
}
