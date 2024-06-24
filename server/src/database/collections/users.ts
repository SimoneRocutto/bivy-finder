import { collections } from "../database";
import { UserInterface } from "../../models/data/user";
import { CollectionConfigInterface } from "../../models/application/database";

export const usersConfig: CollectionConfigInterface = {
  name: "users",
  init: (db) => {
    const usersCollection = db.collection<UserInterface>("users");
    usersCollection?.createIndex({ username: 1 }, { unique: true });
    collections.users = usersCollection;
  },
  schema: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "password"],
      additionalProperties: false,
      properties: {
        _id: {},
        username: {
          bsonType: "string",
          description: "is required and is a string",
        },
        password: {
          bsonType: "string",
          description: "is required and is a string",
          minLength: 5,
        },
      },
    },
  },
};
