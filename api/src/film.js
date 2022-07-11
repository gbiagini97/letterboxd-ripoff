"use strict";
const {
  DynamoDBClient,
  PutItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const create = async (event) => {
  const body = JSON.parse(event.body);

  console.log("BODY: " + JSON.stringify(body));

  // validate input
  if (!body.name || !body.date)
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid input",
      }),
    };

  // build item accordingly to the domain
  const item = {
    PK: "FILM#" + body.name.replace(/\W/g, "").toLowerCase(),
    SK: "FILM#" + body.name.replace(/\W/g, "").toLowerCase(),
    __typename: "FILM",
    filmID: body.name.replace(/\W/g, "").toLowerCase(),
    name: body.name,
    createdAt: body.date,
    updatedAt: new Date().toISOString(),
    ratingSum: 0,
    reviewsCount: 0,
    listsCount: 0,
  };

  const client = new DynamoDBClient();

  try {
    const res = await client.send(
      new PutItemCommand({
        TableName: process.env.SINGLE_TABLE_ID,
        Item: marshall(item),
        ConditionExpression:
          "attribute_not_exists(PK) AND attribute_not_exists(SK)",
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
        message: "Error while creating film",
        error: err,
      }),
    };
  }
};

module.exports = {
  create,
};
