# letterboxd-ripoff

## 1. Project init
Initialize the repo and yarn.
Define how many and which services are we going to create for the project. Better start with fewer services and eventually split them up once they grow larger so you don't have to deal with unnecessary complexity at the beginning.
Here I've defined two Serverless services:
* `api`: will be our project entrypoint with REST routes that invoke functions;
* `stdb`: will be our persistance layer with a DynamoDB table following the single table design paradigm.

Let's bootstrap the project with the definition of some routes such as:

* home: GET /
* registerUser: POST /register
* createFilm: POST /film

In this demo we will not leverage full authZ and authN processes so that we can focus on the business logic and the ER decomposition for single table design.