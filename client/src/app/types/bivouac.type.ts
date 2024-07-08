import { LatLngExpression } from "leaflet";
import { NonNull } from "./misc.type";

export type BivouacType =
  | "managed"
  | "require-keys"
  | "private"
  | "open"
  | "out-of-lombardy"
  | "incomplete"
  | "abandoned";

export type BivouacMaterial = "stone" | "wood" | "metal" | "rock";

// Allowing nulls because we cannot send undefined values through jsons.
// Null means we want to delete the field. Undefined or key not present
// means the field will not be sent.
export interface NewBivouac {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  material?: BivouacMaterial | null;
  type?: BivouacType | null;
  latLng?: LatLngExpression | null;
}

export interface Bivouac extends NonNull<NewBivouac> {
  _id: string;
}

export const bivouacTypes: BivouacType[] = [
  "managed",
  "require-keys",
  "private",
  "open",
  "out-of-lombardy",
  "incomplete",
  "abandoned",
];

export const bivouacMaterials: BivouacMaterial[] = [
  "metal",
  "stone",
  "wood",
  "rock",
];
