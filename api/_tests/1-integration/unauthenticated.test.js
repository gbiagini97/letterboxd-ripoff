require("dotenv").config();

const { HTTP_API_URL } = process.env;
const httpCall = require("../../_lib/http-call");
const given = require("../given");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("An random user stumbles on my letterboxd ripoff", () => {
  jest.setTimeout(100000);

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
    } else {
      throw Error("Could not register random user in given")
    }
  });

  it("Can see a film landing page", async () => {
    const randomUser = await given.a_registered_random_user()
    //console.log(JSON.stringify(randomUser))
    
    const review = await given.an_indexed_film_review(randomUser.userID)
    //console.log(JSON.stringify(review))

    if(randomUser && review) {
      const res = await httpCall(
        HTTP_API_URL,
        `/film/${review.filmID}`,
        "GET",
        null
      )

      //console.log(JSON.stringify(res))

      expect(res.filter(item => item.__typename === "FILM").length).toBe(1)
      expect(res.filter(item => item.__typename === "REVIEW").length).toBeGreaterThanOrEqual(1)
      
      for(const item of res) {
        switch(item.__typename) {
          case "FILM":
            expect(item).toMatchObject({
              PK: review.SK,
              SK: review.SK,
              __typename: "FILM",
              filmID: review.filmID,
              name: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              ratingSum: expect.any(Number),
              reviewsCount: expect.any(Number),
              listsCount: expect.any(Number),
            })
            break;

          case "REVIEW":
            expect(item).toMatchObject({
              PK: review.PK,
              SK: review.SK,
              __typename: "REVIEW",
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              description: review.description,
              filmID: review.filmID,
              userID: review.userID,
              rating: review.rating, 
            })

            break;
        }
      }
    } else {
      throw Error("Could not register a random user or make a review")
    }
  })

  it("Can retrieve paginated film data", async () => {
    const filmID = await given.a_ton_of_reviews(15)
    //console.log(JSON.stringify(film))

    if(filmID) {
      const res = await httpCall(
        HTTP_API_URL,
        `/film/${filmID}`,
        "GET",
        null
      )

      //console.log(JSON.stringify(res))

      // wait for dynamo triggers 
      await sleep(2000)

      expect(res.filter(item => item.__typename === "FILM").length).toBe(1)
      expect(res.filter(item => item.__typename === "REVIEW").length).toBe(10)



    } else {
      throw Error("Could not register a random user or make a ton of reviews")
    }
  })
});
