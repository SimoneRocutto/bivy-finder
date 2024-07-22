import * as mongodb from "mongodb";

export type UserRole = "admin";

export interface UserInterface {
  username: string;
  password: string;
  role?: UserRole;
  _id?: mongodb.ObjectId;
  favoriteBivouacs?: { bivouacId: mongodb.ObjectId; time: Date }[];
}
