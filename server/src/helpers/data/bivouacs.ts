import { Decimal128, ObjectId } from "mongodb";
import {
  BivouacFormattedInterface,
  BivouacInterface,
} from "../../models/data/bivouac";
import { deleteImageFromS3, getImageUrlFromS3 } from "../s3";
import { objectFalsyFilter } from "../misc";
import { collections } from "../../database/database";

export const formatBivouac = async (
  bivouac: BivouacInterface,
  getImageUrl: boolean = true
): Promise<BivouacFormattedInterface> => {
  // Convert latLng to number
  const { latLng } = bivouac;
  const parsedLatlng: [number, number, number | null] | undefined = latLng?.map(
    (item) => (item ? Number(item?.toString()) : item)
  ) as [number, number, number | null] | undefined;
  const formattedBivouac: BivouacFormattedInterface = {
    ...bivouac,
    latLng: parsedLatlng,
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
  const [{ latLng: latLngRaw, ...cleanBivouac }, filteredProps] =
    objectFalsyFilter(bivouac);
  const latLng: [Decimal128, Decimal128, Decimal128] | undefined =
    latLngRaw?.map((item) =>
      typeof item === "number" ? new Decimal128(item.toString()) : item
    ) as [Decimal128, Decimal128, Decimal128] | undefined;
  return [
    {
      ...cleanBivouac,
      ...(latLng ? { latLng } : undefined),
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
