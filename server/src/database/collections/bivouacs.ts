import { BivouacInterface } from "../../models/data/bivouac";
import { collections } from "../database";
import { CollectionConfigInterface } from "../../models/application/database";

const currencySchema = {
  bsonType: "string",
  description: "is one of 'EUR', 'USD'",
  enum: ["EUR", "USD"],
};
const latLngSchema = {
  bsonType: "array",
  description: "must be an array of 3 doubles",
  minItems: 3,
  maxItems: 3,
  items: [
    {
      bsonType: "decimal",
    },
    {
      bsonType: "decimal",
    },
    {
      bsonType: ["decimal", "null"],
    },
  ],
};
export const bivouacsConfig: CollectionConfigInterface = {
  name: "bivouacs",
  init: (db) => {
    const bivouacsCollection = db.collection<BivouacInterface>("bivouacs");
    collections.bivouacs = bivouacsCollection;
  },
  schema: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name"],
      additionalProperties: false,
      properties: {
        _id: {},
        name: {
          bsonType: "string",
          description: "is required and is a string",
          minLength: 1,
        },
        description: {
          bsonType: "string",
          description: "is a string",
        },
        imageName: {
          bsonType: "string",
          description: "is a string",
        },
        type: {
          bsonType: "string",
          description:
            "is one of 'managed', 'require-keys', 'private', 'open', 'out-of-lombardy', 'incomplete', 'abandoned'",
          enum: [
            "managed",
            "require-keys",
            "private",
            "open",
            "out-of-lombardy",
            "incomplete",
            "abandoned",
          ],
        },
        material: {
          bsonType: "string",
          description: "is one of 'stone', 'wood', 'metal', 'rock'",
          enum: ["stone", "wood", "metal", "rock"],
        },
        latLng: latLngSchema,
        externalLinks: {
          bsonType: "array",
          description: "must be an array of strings",
          items: {
            bsonType: "string",
          },
        },
        favoritesCount: {
          bsonType: "int",
          description: "is an integer",
        },
        startingSpots: {
          bsonType: "array",
          description: "must be an array of starting spots",
          // Arbitrary limit to avoid unbounded array. I doubt anyone will add more than 50.
          maxItems: 50,
          items: {
            bsonType: "object",
            required: ["latLng"],
            additionalProperties: false,
            properties: {
              latLng: latLngSchema,
              description: {
                bsonType: "string",
                description: "is a string",
              },
              timeToDestination: {
                bsonType: "int",
                description:
                  "is an integer. Number of milliseconds to arrive to destination by foot, starting from this starting spot",
              },
              transport: {
                bsonType: "object",
                additionalProperties: false,
                properties: {
                  car: {
                    bsonType: "object",
                    additionalProperties: false,
                    properties: {
                      description: {
                        bsonType: "string",
                        description: "is a string",
                      },
                      cost: {
                        bsonType: "object",
                        required: ["value", "per"],
                        additionalProperties: false,
                        properties: {
                          value: {
                            bsonType: "int",
                            description: "is an integer",
                          },
                          currency: currencySchema,
                          per: {
                            bsonType: "string",
                            description:
                              "is one of 'hour', 'day', 'week', 'month', 'forever'",
                            enum: ["hour", "day", "week", "month", "forever"],
                          },
                        },
                      },
                    },
                  },
                  public: {
                    bsonType: "array",
                    description: "must be an array of public transports",
                    items: {
                      bsonType: "object",
                      additionalProperties: false,
                      required: ["name"],
                      properties: {
                        name: {
                          bsonType: "string",
                          description: "is a string",
                        },
                        description: {
                          bsonType: "string",
                          description: "is a string",
                        },
                        cost: {
                          bsonType: "object",
                          additionalProperties: false,
                          required: ["value"],
                          properties: {
                            value: {
                              bsonType: "int",
                              description: "is an integer",
                            },
                            currency: currencySchema,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
