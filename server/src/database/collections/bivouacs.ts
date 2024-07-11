import { BivouacInterface } from "../../models/data/bivouac";
import { collections } from "../database";
import { CollectionConfigInterface } from "../../models/application/database";

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
        // Todo delete this
        imageUrl: {
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
        latLng: {
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
        },
      },
    },
  },
};
