import { Decimal128, ObjectId } from "mongodb";

type BivouacType =
  | "managed"
  | "require-keys"
  | "private"
  | "open"
  | "out-of-lombardy"
  | "incomplete"
  | "abandoned";

type BivouacMaterial = "stone" | "wood" | "metal" | "rock";

type CostPer = "hour" | "day" | "week" | "month" | "forever";

type Currency = "EUR" | "USD";

export type UnformattedLatLng = [Decimal128, Decimal128, Decimal128 | null];

export type FormattedLatLng = [number, number, number | null];

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
    public?: {
      name: string;
      description?: string;
      cost?: {
        value: number;
        currency: Currency;
      };
    }[];
  };
  latLng: UnformattedLatLng;
}

export interface StartingSpotFormattedInterface
  extends Omit<StartingSpotInterface, "latLng"> {
  latLng: FormattedLatLng;
}

export interface BivouacInterface {
  name: string;
  description?: string;
  imageName?: string;
  type?: BivouacType;
  material?: BivouacMaterial;
  latLng?: UnformattedLatLng;
  favoritesCount?: number;
  startingSpots?: StartingSpotInterface[];
  _id?: ObjectId;
}

export interface BivouacFormattedInterface
  extends Omit<BivouacInterface, "latLng" | "startingSpots"> {
  imageUrl?: string;
  latLng?: FormattedLatLng;
  startingSpots?: StartingSpotFormattedInterface[];
}
