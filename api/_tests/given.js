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

module.exports = {
  a_random_user,
  a_registered_random_user,
  an_ugly_film,
  an_indexed_ugly_film,
};
