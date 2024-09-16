import { ObjectId } from "mongodb";
import {
  CabinFormattedInterface,
  CabinInterface,
  FormattedLatLng,
  StartingSpotFormattedInterface,
  StartingSpotInterface,
  UnformattedLatLng,
} from "../../models/data/cabin";
import { deleteImageFromS3, getImageUrlFromS3 } from "../s3";
import { formatLatLng, objectFalsyFilter, unformatLatLng } from "../misc";
import { collections } from "../../database/database";

export const formatCabin = async (
  cabin: CabinInterface,
  getImageUrl: boolean = true
): Promise<CabinFormattedInterface> => {
  // Convert latLng to number
  const { latLng, startingSpots, ...rest } = cabin;
  const parsedLatlng = formatLatLng(latLng);

  const parsedStartingSpots: StartingSpotFormattedInterface[] | undefined =
    startingSpots?.map((startingSpot) => ({
      ...startingSpot,
      // There should be no cases where formatLatLng is undefined. Even then, if this fails for a starting spot,
      // it will simply avoid being shown on the map. Nothing to worry about.
      latLng: formatLatLng(startingSpot.latLng) as FormattedLatLng,
    }));

  const formattedCabin: CabinFormattedInterface = {
    ...rest,
    latLng: parsedLatlng,
    ...(startingSpots ? { startingSpots: parsedStartingSpots } : undefined),
  };

  // Get image url
  if (getImageUrl && cabin.imageName) {
    const url = await getImageUrlFromS3(cabin.imageName);
    if (url) {
      formattedCabin.imageUrl = url;
    }
  }
  return formattedCabin;
};

export const unformatCabin = (
  cabin: CabinFormattedInterface
): [CabinInterface, string[]] => {
  const [{ latLng: latLngRaw, startingSpots, ...cleanCabin }, filteredProps] =
    objectFalsyFilter(cabin);
  const parsedStartingSpots: StartingSpotInterface[] | undefined =
    startingSpots?.map((startingSpot) => ({
      ...startingSpot,
      latLng: unformatLatLng(startingSpot.latLng) as UnformattedLatLng,
    }));
  const latLng = unformatLatLng(latLngRaw) as UnformattedLatLng;

  return [
    {
      ...cleanCabin,
      ...(latLng ? { latLng } : undefined),
      ...(parsedStartingSpots
        ? { startingSpots: parsedStartingSpots }
        : undefined),
    },
    filteredProps,
  ];
};

/**
 *
 * @param cabinId
 * @returns Null if no error, otherwise error code.
 * 400 if s3 delete fails, 404 if cabin doesn't exist.
 */
export const deleteCabinImageIfExists = async (
  cabinId: string
): Promise<number | null> => {
  const query = { _id: new ObjectId(cabinId) };
  const cabin = await collections?.cabins?.findOne(query);
  if (!cabin) {
    return 404;
  }
  const { imageName } = cabin;
  if (imageName) {
    try {
      await deleteImageFromS3(imageName);
    } catch (e) {
      console.error(e);
      return 400;
    }
  }
  return null;
};
