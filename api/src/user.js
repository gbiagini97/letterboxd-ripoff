"use strict";
const {
  DynamoDBClient,
} = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, PutCommand } = require("@aws-sdk/lib-dynamodb"); 

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
  const doc = DynamoDBDocumentClient.from(client)

  try {
    const res = await doc.send(
      new PutCommand({
        TableName: process.env.SINGLE_TABLE_ID,
        Item: item,
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

const get = async (event) => {
  console.log("EVENT: " + JSON.stringify(event));
  const userID = event.pathParameters.userID;

  const client = new DynamoDBClient();
  const doc = DynamoDBDocumentClient.from(client)
  
  try {
    const res = await doc.send(new QueryCommand({
      TableName: process.env.SINGLE_TABLE_ID,
      KeyConditionExpression: "#PK = :PK",
      ExpressionAttributeNames: {
        "#PK": "PK",
      },
      ExpressionAttributeValues: {
        ":PK": `USER#${userID}`,
      },
      Limit: 11,
    }))
    console.log(JSON.stringify(res))

    return {
      statusCode: 200,
      body: JSON.stringify(res.Items),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Error while retrieving user and latest activity",
        error: err,
      }),
    };
  }
};


module.exports = {
  register,
  get
};
