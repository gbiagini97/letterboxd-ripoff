require("dotenv").config();

const { HTTP_API_URL } = process.env;
const httpCall = require("../../_lib/http-call");
const given = require("../given");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Given an authenticated user", () => {
  let user, film;

  beforeAll(async () => {
    user = await given.a_registered_random_user();
    film = await given.an_indexed_ugly_film();
  });

  it("Can make a film review", async () => {
    //console.log("FILM " + JSON.stringify(film))

    const res = await httpCall(
      HTTP_API_URL,
      `/users/${user.userID}/reviews`,
      "POST",
      given.a_film_review(film.filmID)
    );

    //console.log(JSON.stringify(res));

    expect(res).toMatchObject({
      PK: `USER#${user.userID}`,
      SK: `FILM#${film.filmID}`,
      __typename: "REVIEW",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      description: expect.any(String),
      filmID: `${film.filmID}`,
      userID: `${user.userID}`,
      rating: expect.any(Number),
    });
  });
});


