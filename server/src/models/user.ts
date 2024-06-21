import * as mongodb from "mongodb";

export interface UserInterface {
  username: string;
  password: string;
  _id?: mongodb.ObjectId;
}
