import { LatLngExpression } from "leaflet";
import { NonNull } from "./misc.type";
import { FormArray, FormControl, FormGroup } from "@angular/forms";

export type BivouacType =
  | "managed"
  | "require-keys"
  | "private"
  | "open"
  | "out-of-lombardy"
  | "incomplete"
  | "abandoned";

export type BivouacMaterial = "stone" | "wood" | "metal" | "rock";

export type CostPer = "hour" | "day" | "week" | "month" | "forever";

export type Currency = "EUR" | "USD";

export interface CarTransport {
  description?: string | null;
  cost?: {
    value: number;
    currency: Currency;
    per?: CostPer | null;
  };
}

export interface PublicTransport {
  name: string;
  description?: string | null;
  cost?: {
    value: number;
    currency: Currency;
  };
}

export interface StartingSpot {
  description?: string | null;
  timeToDestination?: number;
  transport?: {
    car?: CarTransport;
    public?: PublicTransport[];
  };
  latLng?: LatLngExpression | null;
}

// Allowing nulls because we cannot send undefined values through jsons.
// Null means we want to delete the field. Undefined or key not present
// means the field will not be sent.
export interface NewBivouac {
  name: string;
  description?: string | null;
  imageName?: string | null;
  material?: BivouacMaterial | null;
  type?: BivouacType | null;
  latLng?: LatLngExpression | null;
  externalLinks?: string[] | null;
  startingSpots?: StartingSpot[];
}

export interface Bivouac extends NonNull<NewBivouac> {
  _id: string;
  imageUrl?: string;
  favoritesCount?: number;
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

export type LatLngFormGroup = FormGroup<{
  latitude: FormControl<number | null>;
  longitude: FormControl<number | null>;
  altitude: FormControl<number | null>;
}>;

export type CarFormGroup = FormGroup<{
  description: FormControl<string | null>;
  currency: FormControl<Currency | null>;
  cost: FormControl<number | null>;
  costPer: FormControl<CostPer | null>;
}>;

export type PublicTransportFormGroup = FormGroup<{
  name: FormControl<string | null>;
  description: FormControl<string | null>;
  currency: FormControl<Currency | null>;
  cost: FormControl<number | null>;
}>;

export type StartingSpotFormGroup = FormGroup<{
  description: FormControl<string | null>;
  days: FormControl<number | null>;
  hours: FormControl<number | null>;
  minutes: FormControl<number | null>;
  latLng: LatLngFormGroup;
  car?: CarFormGroup;
  public: FormArray<PublicTransportFormGroup>;
}>;
