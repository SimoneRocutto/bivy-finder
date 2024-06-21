import * as mongodb from "mongodb";

export interface BivouacInterface {
  name: string;
  description: string;
  imageUrl: string;
  type:
    | "managed"
    | "require-keys"
    | "private"
    | "open"
    | "out-of-lombardy"
    | "incomplete"
    | "abandoned";
  material: "stone" | "wood" | "metal" | "rock";
  latLng: [number, number, number];
  _id?: mongodb.ObjectId;
}
