import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { AWS_BUCKET_DIRECTORY, AWS_BUCKET_NAME, s3 } from "../server";
import { randomImageName } from "./misc";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getImageUrlFromS3 = async (
  key: string,
  expiresIn: number = 3600
) => {
  const getObjectParams = {
    Bucket: AWS_BUCKET_NAME,
    Key: AWS_BUCKET_DIRECTORY + key,
  };
  const command = new GetObjectCommand(getObjectParams);
  return await getSignedUrl(s3, command, { expiresIn });
};

export const uploadImageToS3 = async (
  file: Express.Multer.File,
  imageName: string = randomImageName()
): Promise<string> => {
  await s3.send(
    new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: AWS_BUCKET_DIRECTORY + imageName,
      Body: file.buffer, // Body which will contain the image in buffer format
      ContentType: file.mimetype, // Necessary to define the image content-type to view the photo in the browser with the link
    })
  );
  return imageName;
};

export const deleteImageFromS3 = async (key: string) =>
  await s3.send(
    new DeleteObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: AWS_BUCKET_DIRECTORY + key,
    })
  );
