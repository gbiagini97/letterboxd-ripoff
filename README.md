# letterboxd-ripoff

## 1. Project init
Initialized the repo and yarn.
Defined how many and which services we need for the project. 
Better start with fewer services and eventually split them up once they grow larger so you don't have to deal with unnecessary complexity at the beginning.
I've defined two Serverless services:
* `api`: will be our project entrypoint with REST routes that invoke functions;
* `stdb`: will be our persistance layer with a DynamoDB table following the single table design paradigm.

Bootstrapped the project with the definition of some routes such as:

* home: GET /
* registerUser: POST /register
* createFilm: POST /film

In this demo we'll not leverage full authZ and authN processes so that we can focus on the business logic and the ER decomposition for single table design.

---

## 2. Create functions and tests
In this section we setup up the testing configuration for the functions we've defined in the previous phase.

### Testing config
After installing `jest` we create the `jest.config.js` file.
For the sake of the demo we will only focus on integration tests.
We will also create a small lib for performing http calls towards our api gateway.
In order to make tests work we need to define some scripts that export useful resources as environment variables.

## Function definition
Functions are defined with the help of the following shorthands:
* Route associations via serverless framework events;
* IAM roles via serverless iam role statement;
* Dependency management via serverless webpack
* Environment variables resolved via Cloudformation outputs (cross-stack)

---

## 3. CI/CD setup
I used Github Actions to perform CI/CD with two workflows `ci` and `deploy`.
Added jest's github-action reporter to get the tests output printed in workflows.
