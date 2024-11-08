import { Decimal128, ObjectId } from "mongodb";

// Declaring types like this makes it possible to iterate of possible values.
export const cabinTypes = [
  "managed",
  "require-keys",
  "private",
  "open",
  "out-of-lombardy",
  "incomplete",
  "abandoned",
];
export type CabinType = (typeof cabinTypes)[number];

export const cabinMaterials = ["stone", "wood", "metal", "rock"];
type CabinMaterial = (typeof cabinMaterials)[number];

export const costPers = ["hour", "day", "week", "month", "forever"];
type CostPer = (typeof costPers)[number];

export const currencies = ["EUR", "USD"];
type Currency = (typeof currencies)[number];

export type UnformattedLatLng = [Decimal128, Decimal128, Decimal128 | null];

export type FormattedLatLng = [number, number, number | null];

export type PublicTransport = {
  name: string;
  description?: string;
  cost?: {
    value: number;
    currency: Currency;
  };
};

export interface StartingSpotInterface {
  description?: string;
  timeToDestination?: number;
  transport?: {
    car?: {
      description?: string;
      cost?: {
        value: number;
        currency: Currency;
        per: CostPer;
      };
    };
    public?: PublicTransport[];
  };
  latLng: UnformattedLatLng;
}

export interface StartingSpotFormattedInterface
  extends Omit<StartingSpotInterface, "latLng"> {
  latLng: FormattedLatLng;
}

export interface CabinInterface {
  name: string;
  description?: string;
  imageName?: string;
  type?: CabinType;
  material?: CabinMaterial;
  latLng?: UnformattedLatLng;
  favoritesCount?: number;
  startingSpots?: StartingSpotInterface[];
  _id?: ObjectId;
}

export interface CabinFormattedInterface
  extends Omit<CabinInterface, "latLng" | "startingSpots"> {
  imageUrl?: string;
  latLng?: FormattedLatLng;
  startingSpots?: StartingSpotFormattedInterface[];
}
