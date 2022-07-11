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
  if (!body.filmID || !body.rating || !body.description)
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
    description: body.description,
    filmID: body.filmID,
    userID: userID,
    rating: body.rating,
  };

  console.log("ITEM " + JSON.stringify(item));

  // init the client
  const client = new DynamoDBClient();
  const doc = DynamoDBDocumentClient.from(client);

  const res = await doc.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            // insert the review
            TableName: process.env.SINGLE_TABLE_ID,
            Item: item,
          },
        },
        {
          Update: {
            //update rating and reviews count for the film
            TableName: process.env.SINGLE_TABLE_ID,
            Key: {
              PK: item.SK,
              SK: item.SK,
            },
            UpdateExpression: "ADD #ratingSum :rating, #reviewsCount :one",
            ExpressionAttributeNames: {
              "#ratingSum": "ratingSum",
              "#reviewsCount": "reviewsCount",
            },
            ExpressionAttributeValues: {
              ":rating": item.rating,
              ":one": 1,
            },
            ConditionExpression:
              "attribute_exists(PK) AND attribute_exists(SK)",
          },
        },
        {
          Update: {
            //update number of reviews made by that user
            TableName: process.env.SINGLE_TABLE_ID,
            Key: {
              PK: item.PK,
              SK: item.PK,
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
  if (res.$metadata.httpStatusCode == 200) {
    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } else {
    return {
      statusCode: 503,
      body: JSON.stringify({
        message: "Error while creating review",
      }),
    };
  }
};

module.exports = {
  create,
};
