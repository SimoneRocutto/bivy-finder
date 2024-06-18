import * as mongodb from "mongodb";
import { Employee } from "./employee";
import { UserInterface } from "./user";
import { BivouacInterface } from "./models/bivouac";

export const collections: {
  employees?: mongodb.Collection<Employee>;
  users?: mongodb.Collection<UserInterface>;
  bivouacs?: mongodb.Collection<BivouacInterface>;
} = {};

export async function connectToDatabase(uri: string) {
  const client = new mongodb.MongoClient(uri);
  await client.connect();

  const db = client.db("meanStackExample");
  await applySchemaValidation(db);

  const employeesCollection = db.collection<Employee>("employees");
  collections.employees = employeesCollection;
  const usersCollection = db.collection<UserInterface>("users");
  usersCollection?.createIndex({ username: 1 }, { unique: true });
  collections.users = usersCollection;
  const bivouacsCollection = db.collection<BivouacInterface>("bivouacs");
  collections.bivouacs = bivouacsCollection;
}

// Update our existing collection with JSON schema validation so we know our documents will always match the shape of our Employee model, even if added elsewhere.
// For more information about schema validation, see this blog series: https://www.mongodb.com/blog/post/json-schema-validation--locking-down-your-model-the-smart-way
async function applySchemaValidation(db: mongodb.Db) {
  const jsonSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "position", "level"],
      additionalProperties: false,
      properties: {
        _id: {},
        name: {
          bsonType: "string",
          description: "'name' is required and is a string",
        },
        position: {
          bsonType: "string",
          description: "'position' is required and is a string",
          minLength: 5,
        },
        level: {
          bsonType: "string",
          description:
            "'level' is required and is one of 'junior', 'mid', or 'senior'",
          enum: ["junior", "mid", "senior"],
        },
      },
    },
  };

  const usersSchema = {
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
  };

  const bivouacsSchema = {
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
        imageUrl: {
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
          items: {
            bsonType: "double",
          },
        },
      },
    },
  };

  // Try applying the modification to the collection, if the collection doesn't exist, create it
  await db
    .command({
      collMod: "employees",
      validator: jsonSchema,
    })
    .catch(async (error: mongodb.MongoServerError) => {
      if (error.codeName === "NamespaceNotFound") {
        await db.createCollection("employees", { validator: jsonSchema });
      }
    });

  await db
    .command({
      collMod: "users",
      validator: usersSchema,
    })
    .catch(async (error: mongodb.MongoServerError) => {
      if (error.codeName === "NamespaceNotFound") {
        await db.createCollection("users", { validator: usersSchema });
      }
    });

  await db
    .command({
      collMod: "bivouacs",
      validator: bivouacsSchema,
    })
    .catch(async (error: mongodb.MongoServerError) => {
      if (error.codeName === "NamespaceNotFound") {
        await db.createCollection("bivouacs", { validator: bivouacsSchema });
      }
    });
}
