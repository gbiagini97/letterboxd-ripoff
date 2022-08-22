require("dotenv").config();

const { HTTP_API_URL } = process.env;
const httpCall = require("../_lib/http-call");
const chance = require("chance").Chance();

const a_random_user = () => {
  return {
    name: chance.first(),
    surname: chance.last(),
  };
};

const a_registered_random_user = async () => {
  const res = await httpCall(
    HTTP_API_URL,
    "/register",
    "POST",
    a_random_user()
  );
  if (res?.userID) return res;
  return null;
};

const an_ugly_film = () => {
  return {
    name:
      "The " +
      chance.animal() +
      " in " +
      chance.city() +
      " " +
      chance.integer({ min: 1, max: 10 }),
    date: chance.date().toISOString(),
  };
};

const an_indexed_ugly_film = async () => {
  const res = await httpCall(HTTP_API_URL, "/film", "POST", an_ugly_film());
  if (res?.filmID) return res;
  return null;
};

const a_film_review = (filmID) => {
  return {
    filmID: filmID,
    description: chance.paragraph(),
    rating: chance.integer({ min: 0, max: 10 }),
  };
};

const an_indexed_film_review = async (userID, filmID) => {
  if (!filmID) {
    filmID = await an_indexed_ugly_film().then(res => res.filmID);
  }
  const review = await httpCall(
    HTTP_API_URL,
    `/users/${userID}/reviews`,
    "POST",
    a_film_review(filmID)
  );
  if (filmID) return review;
  return null;
};

const a_ton_of_reviews = async (amount, filmID) => {
  if (!filmID) {
    filmID = await an_indexed_ugly_film().then(res => res.filmID)
  }

  for (let i = 0; i != amount; i++) {
    let usr = await a_registered_random_user()
    if(usr?.userID) {
      let review = await an_indexed_film_review(usr.userID, filmID)
      //console.log(`RES ${i}: ` + JSON.stringify(review));
    }
  }
  return filmID;
};

module.exports = {
  a_random_user,
  a_registered_random_user,
  an_ugly_film,
  an_indexed_ugly_film,
  a_film_review,
  an_indexed_film_review,
  a_ton_of_reviews,
};
