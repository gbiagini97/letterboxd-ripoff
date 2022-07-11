require("dotenv").config();

const { HTTP_API_URL } = process.env;
const httpCall = require("../../_lib/http-call");
const given = require("../given");

describe("An random user stumbles on my letterboxd ripoff", () => {
  it("Can retrieve the homepage data", async () => {
    const res = await httpCall(HTTP_API_URL, "/", "GET", null);

    //console.log(JSON.stringify(res));

    expect(res).toMatchObject({
      message: expect.any(String),
      endpoint: expect.any(String),
    });
  });

  it("Can register to the website by providing name and surname", async () => {
    const randomUser = given.a_random_user();
    const res = await httpCall(HTTP_API_URL, "/register", "POST", randomUser);

    //console.log(JSON.stringify(res))

    const userID =
      randomUser.name.replace(/\W/g, "").toLowerCase() +
      "-" +
      randomUser.surname.replace(/\W/g, "").toLowerCase();

    expect(res).toMatchObject({
      PK: `USER#${userID}`,
      SK: `USER#${userID}`,
      __typename: "USER",
      userID: `${userID}`,
      name: randomUser.name,
      surname: randomUser.surname,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      reviewsCount: 0,
      listsCount: 0,
    });
  });

  it("Can see another user's profile", async () => {
    const registerdRandomUser = await given.a_registered_random_user();
    if (registerdRandomUser) {
      const res = await httpCall(
        HTTP_API_URL,
        `/users/${registerdRandomUser.userID}`,
        "GET",
        null
      );

      //console.log(JSON.stringify(res));

      for (const item of res) {
        if (item.__typename === "USER") {
          expect(item).toMatchObject({
            PK: `USER#${registerdRandomUser.userID}`,
            SK: `USER#${registerdRandomUser.userID}`,
            __typename: "USER",
            userID: registerdRandomUser.userID,
            name: registerdRandomUser.name,
            surname: registerdRandomUser.surname,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            reviewsCount: expect.any(Number),
            listsCount: expect.any(Number),
          });
        }
      }
    }
  });
});
