import * as mongodb from "mongodb";
import { Employee } from "../models/data/employee";
import { UserInterface } from "../models/data/user";
import { BivouacInterface } from "../models/data/bivouac";
import { collectionsConfigs } from "./collections";

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

  // Init collections
  for (const collectionConfig of collectionsConfigs) {
    collectionConfig.init(db);
  }
}

// Update our existing collection with JSON schema validation so we know our documents will always match the shape of our Employee model, even if added elsewhere.
// For more information about schema validation, see this blog series: https://www.mongodb.com/blog/post/json-schema-validation--locking-down-your-model-the-smart-way
async function applySchemaValidation(db: mongodb.Db) {
  // Try applying the modification to the collection, if the collection doesn't exist, create it
  for (const collectionConfig of collectionsConfigs) {
    await db
      .command({
        collMod: collectionConfig.name,
        validator: collectionConfig.schema,
      })
      .catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === "NamespaceNotFound") {
          await db.createCollection(collectionConfig.name, {
            validator: collectionConfig.schema,
          });
        }
      });
  }
}
