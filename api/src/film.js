"use strict";
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
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

  // init the client
  const client = new DynamoDBClient();
  const doc = DynamoDBDocumentClient.from(client);

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
        message: "Error while creating film",
        error: err,
      }),
    };
  }
};

const get = async (event) => {
  console.log("EVENT: " + JSON.stringify(event));
  const filmID = event.pathParameters.filmID;

  const client = new DynamoDBClient();
  const doc = DynamoDBDocumentClient.from(client)
  
  try {
    const res = await doc.send(new QueryCommand({
      IndexName: "GSI1SK",
      TableName: process.env.SINGLE_TABLE_ID,
      KeyConditionExpression: "#SK = :SK",
      ExpressionAttributeNames: {
        "#SK": "SK",
      },
      ExpressionAttributeValues: {
        ":SK": `FILM#${filmID}`,
      },
      Limit: 11,
      ScanIndexForward: false
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

}

module.exports = {
  create,
  get
};
