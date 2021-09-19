"use strict";

import { IResolvers } from "mercurius";

import Fastify from "fastify";
import mercurius from "mercurius";
import dogs from "./data/dogs.json";
import dotenv from "dotenv";
import path from "path";

const pathToEnv = path.resolve(process.cwd(), ".env");
const pathToEnvDev = path.resolve(process.cwd(), ".env.development");

dotenv.config({
  debug: true,
  path: process.env.NODE_ENV === "production" ? pathToEnv : pathToEnvDev,
});

const { LOG_LEVEL } = process.env;

const app = Fastify({
  logger: {
    prettyPrint: true,
    level: LOG_LEVEL ?? "info",
  },
});

app.log.debug(
  `++++++++++++
%o
++++++++++++`,
  process.env
);

const schema = `
  type Dog {
    id: ID!
    name: String!
    gender: String!
  }
  input DogInput {
    name: String!
    gender: String!
  }
  type Query {
    getDogs: [Dog]
    getDogByName(name: String!): Dog
  }
  type Mutation {
    addDog(dog: DogInput!): [Dog]
  }
`;

const resolvers: IResolvers = {
  Query: {
    getDogs: async () => dogs,
    getDogByName: async (parent, { name }, context, info) => {
      return dogs?.find(
        (dog: { name: string; id: number; gender: string }) => dog.name === name
      );
    },
  },
  Mutation: {
    addDog: async (_, { dog }) => [...dogs, { id: dogs.length, ...dog }],
  },
};

app.get("/", (_, res) => {
  res.redirect("/graphiql").send();
});

app.register(mercurius, {
  schema,
  resolvers,
  graphiql: true,
});

app.listen(3000);
