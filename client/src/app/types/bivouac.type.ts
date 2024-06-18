import { LatLngExpression } from "leaflet";

export interface Bivouac {
  name: string;
  description: string;
  imageUrl: string;
  color: string;
  latLng: LatLngExpression;
}
