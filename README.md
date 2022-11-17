<p align="center" width="100%"><img align="center" src="./doc/Analysis.png?raw=true" /></p>

## Description

Analytics is an API that allows you to connect with a web3 signature and get analytics of blockchain interaction by user and contract.

## Framework and language

-   [Node.js](https://nodejs.org/dist/latest-v18.x/docs/api/) v18.12.1
-   [Typescript](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html) v4.9.3
-   [Nest](https://expressjs.com/en/starter/installing.html) v4.18.1
-   [Mongoose](https://mongoosejs.com/docs/guide.html) v6.5.0
-   [Jest](https://docs.nestjs.com/) v28.1.1
-   [multer]() v1.4.5-lts.1
-   [swagger]() v6.2.1

## Installation

```bash
$ yarn
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod

# prebuild project
$ yarn prebuild

# build project
$ yarn build

# debug mode
$ yarn start:debug

# auto lint code
$ yarn lint

# auto format code
$ yarn format
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Documentation

The **documentation** is generated using [swagger](https://swagger.io/docs/specification/basic-structure/) on this project
![Documentation](./doc/Swagger.png?raw=true 'Documentation')

## Authentication

The **authentication** worked by web3 signature and registration by mail with [SendGrid](https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs)

## Storage

The **storage** system use [AWS S3](https://docs.aws.amazon.com/s3/index.html) on a bucket with the use of [AWS SDK](https://www.npmjs.com/package/aws-sdk)

## Test

The **test** system use [jest]()
