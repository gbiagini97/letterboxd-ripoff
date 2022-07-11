"use strict";
const {
  DynamoDBClient,
  PutItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const register = async (event) => {
  const body = JSON.parse(event.body);

  console.log("BODY: " + JSON.stringify(body));

  // validate input
  if (!body.name || !body.surname)
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid input",
      }),
    };

  // build item accordingly to the domain
  const item = {
    PK:
      "USER#" +
      body.name.replace(/\W/g, "").toLowerCase() +
      "-" +
      body.surname.replace(/\W/g, "").toLowerCase(),
    SK:
      "USER#" +
      body.name.replace(/\W/g, "").toLowerCase() +
      "-" +
      body.surname.replace(/\W/g, "").toLowerCase(),
    __typename: "USER",
    userID:
      body.name.replace(/\W/g, "").toLowerCase() +
      "-" +
      body.surname.replace(/\W/g, "").toLowerCase(),
    name: body.name,
    surname: body.surname,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewsCount: 0,
    listsCount: 0,
  };

  // init the client
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
        message: "Error while registering user",
        error: err,
      }),
    };
  }
};


module.exports = {
  register,
};
