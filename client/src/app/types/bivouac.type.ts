import { LatLngExpression } from "leaflet";

export interface NewBivouac {
  name: string;
  description?: string;
  imageUrl?: string;
  material?: "stone" | "wood" | "metal" | "rock";
  type?:
    | "managed"
    | "require-keys"
    | "private"
    | "open"
    | "out-of-lombardy"
    | "incomplete"
    | "abandoned";
  latLng?: LatLngExpression;
}

export interface Bivouac extends NewBivouac {
  _id: string;
}
