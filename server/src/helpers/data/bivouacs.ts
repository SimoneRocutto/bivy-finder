import { ObjectId } from "mongodb";
import {
  BivouacFormattedInterface,
  BivouacInterface,
  FormattedLatLng,
  StartingSpotFormattedInterface,
  StartingSpotInterface,
  UnformattedLatLng,
} from "../../models/data/bivouac";
import { deleteImageFromS3, getImageUrlFromS3 } from "../s3";
import { formatLatLng, objectFalsyFilter, unformatLatLng } from "../misc";
import { collections } from "../../database/database";

export const formatBivouac = async (
  bivouac: BivouacInterface,
  getImageUrl: boolean = true
): Promise<BivouacFormattedInterface> => {
  // Convert latLng to number
  const { latLng, startingSpots, ...rest } = bivouac;
  const parsedLatlng = formatLatLng(latLng);

  const parsedStartingSpots: StartingSpotFormattedInterface[] | undefined =
    startingSpots?.map((startingSpot) => ({
      ...startingSpot,
      // There should be no cases where formatLatLng is undefined. Even then, if this fails for a starting spot,
      // it will simply avoid being shown on the map. Nothing to worry about.
      latLng: formatLatLng(startingSpot.latLng) as FormattedLatLng,
    }));

  const formattedBivouac: BivouacFormattedInterface = {
    ...rest,
    latLng: parsedLatlng,
    ...(startingSpots ? { startingSpots: parsedStartingSpots } : undefined),
  };

  // Get image url
  if (getImageUrl && bivouac.imageName) {
    const url = await getImageUrlFromS3(bivouac.imageName);
    if (url) {
      formattedBivouac.imageUrl = url;
    }
  }
  return formattedBivouac;
};

export const unformatBivouac = (
  bivouac: BivouacFormattedInterface
): [BivouacInterface, string[]] => {
  const [{ latLng: latLngRaw, startingSpots, ...cleanBivouac }, filteredProps] =
    objectFalsyFilter(bivouac);
  const parsedStartingSpots: StartingSpotInterface[] | undefined =
    startingSpots?.map((startingSpot) => ({
      ...startingSpot,
      latLng: unformatLatLng(startingSpot.latLng) as UnformattedLatLng,
    }));
  const latLng = unformatLatLng(latLngRaw) as UnformattedLatLng;

  return [
    {
      ...cleanBivouac,
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
 * @param bivouacId
 * @returns Null if no error, otherwise error code.
 * 400 if s3 delete fails, 404 if bivouac doesn't exist.
 */
export const deleteBivouacImageIfExists = async (
  bivouacId: string
): Promise<number | null> => {
  const query = { _id: new ObjectId(bivouacId) };
  const bivouac = await collections?.bivouacs?.findOne(query);
  if (!bivouac) {
    return 404;
  }
  const { imageName } = bivouac;
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
