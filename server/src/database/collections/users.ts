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
        role: {
          bsonType: "string",
          description:
            "is either 'admin' or null. May add extra values in the future",
          enum: ["admin"],
        },
        favoriteCabins: {
          bsonType: "array",
          description: "must be an array of objects",
          items: {
            bsonType: "object",
            required: ["cabinId"],
            properties: {
              cabinId: {
                bsonType: "objectId",
                description:
                  "is required and is an objectId referencing a cabin",
              },
              time: {
                bsonType: "date",
                description: "is required and is a date",
              },
            },
          },
        },
      },
    },
  },
};
