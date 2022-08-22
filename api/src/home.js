"use strict";

module.exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v3.0! Your function executed successfully!",
        endpoint: "/"
      },
      null,
      2
    ),
  };
};
