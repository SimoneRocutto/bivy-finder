import { Db, Document } from "mongodb";

export interface CollectionConfigInterface {
  name: string;
  init: (db: Db) => void;
  schema: Document;
}
