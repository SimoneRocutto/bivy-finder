import { LatLngExpression } from "leaflet";

export interface Bivouac {
  name: string;
  description: string;
  imageUrl: string;
  color: string;
  material: "stone" | "wood" | "metal" | "rock";
  type:
    | "managed"
    | "require-keys"
    | "private"
    | "open"
    | "out-of-lombardy"
    | "incomplete"
    | "abandoned";
  latLng: LatLngExpression;
}
