import { Decimal128, ObjectId } from "mongodb";

export interface BivouacInterface {
  name: string;
  description?: string;
  imageName?: string;
  type?:
    | "managed"
    | "require-keys"
    | "private"
    | "open"
    | "out-of-lombardy"
    | "incomplete"
    | "abandoned";
  material?: "stone" | "wood" | "metal" | "rock";
  latLng?: [Decimal128, Decimal128, Decimal128 | null];
  favoritesCount?: number;
  _id?: ObjectId;
}

export interface BivouacFormattedInterface
  extends Omit<BivouacInterface, "latLng"> {
  imageUrl?: string;
  latLng?: [number, number, number | null];
}
