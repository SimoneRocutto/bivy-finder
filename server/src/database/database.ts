import * as mongodb from "mongodb";
import { UserInterface } from "../models/data/user";
import { CabinInterface } from "../models/data/cabin";
import { collectionsConfigs } from "./collections";
import { ATLAS_DB } from "../server";

let _client: mongodb.MongoClient;

export const collections: {
  users?: mongodb.Collection<UserInterface>;
  cabins?: mongodb.Collection<CabinInterface>;
} = {};

export const connectToDatabase = async (uri: string) => {
  _client = new mongodb.MongoClient(uri);
  await _client.connect();

  const db = _client.db(ATLAS_DB);
  await applySchemaValidation(db);

  // Init collections
  for (const collectionConfig of collectionsConfigs) {
    collectionConfig.init(db);
  }
};

export const getClient = () => _client;

// Update our existing collection with JSON schema validation so we know our documents will always match the shape of our models.
const applySchemaValidation = async (db: mongodb.Db) => {
  // Try applying the modification to the collection, if the collection doesn't exist, create it.
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
        } else {
          console.error(error);
        }
      });
  }
};
