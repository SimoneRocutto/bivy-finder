import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "../database/database";
import { sendFail, sendSuccess } from "../helpers/http";
import {
  BivouacInterface,
  BivouacFormattedInterface as BivouacFormattedInterface,
} from "../models/data/bivouac";
import { uploadImageToS3 } from "../helpers/s3";
import { multerUploadImage } from "../helpers/multer";
import {
  deleteBivouacImageIfExists,
  formatBivouac,
  unformatBivouac,
} from "../helpers/data/bivouacs";
import { checkRole } from "../middlewares/route-guards";

export const bivouacRouter = express.Router();
bivouacRouter.use(express.json());

/**
 * @openapi
 * components:
 *   schemas:
 *     NewBivouac:
 *       type: object
 *       required:
 *         name
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         imageUrl:
 *           type: string
 *         type:
 *           type: string
 *           default: "managed"
 *           enum:
 *             - managed
 *             - require-keys
 *             - private
 *             - open
 *             - out-of-lombardy
 *             - incomplete
 *             - abandoned
 *         material:
 *           type: string
 *           enum:
 *             - stone
 *             - wood
 *             - metal
 *             - rock
 *         latLng:
 *           type: array
 *           items:
 *             type: number
 *           minItems: 3
 *           maxItems: 3
 *     Bivouac:
 *       allOf:
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *         - $ref: '#/components/schemas/NewBivouac'
 */

/**
 * @openapi
 * /bivouacs/:
 *   get:
 *     description: Gets all bivouacs
 *     responses:
 *       200:
 *         description: Operation successful
 *         content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Bivouac'
 */
bivouacRouter.get("/", async (_req, res) => {
  const bivouacs = (await collections?.bivouacs?.find({}).toArray()) ?? [];
  const formattedBivouacs: BivouacFormattedInterface[] = await Promise.all(
    (bivouacs as BivouacInterface[]).map(async (bivouac) => {
      return formatBivouac(bivouac);
    })
  );

  sendSuccess(res, formattedBivouacs);
});

/**
 * @openapi
 * /bivouacs/{id}:
 *   get:
 *     description: Gets a bivouac by id
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Bivouac id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Operation successful
 *         content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Bivouac'
 *       404:
 *         description: Resource not found
 */
bivouacRouter.get("/:id", async (req, res) => {
  const id = req?.params?.id;
  const query = { _id: new ObjectId(id) };
  const bivouac = await collections?.bivouacs?.findOne(query);

  if (bivouac) {
    sendSuccess(res, await formatBivouac(bivouac));
  } else {
    sendFail(res, null, 404);
  }
});

/**
 * @openapi
 * /bivouacs/:
 *   post:
 *     description: Creates a bivouac
 *     requestBody:
 *       description: Bivouac object that needs to be added to the database
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewBivouac'
 *     responses:
 *       201:
 *         description: Operation successful
 *         content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *       400:
 *         description: Operation failed
 */

bivouacRouter.post(
  "/",
  checkRole("admin"),
  multerUploadImage.single("bivouacImage"),
  async (req, res) => {
    let formattedBivouac: BivouacFormattedInterface;
    try {
      formattedBivouac = JSON.parse(req?.body?.bivouac);
    } catch (e) {
      console.error(e);
      sendFail(res, null, 400);
      return;
    }

    const bivouac = unformatBivouac(formattedBivouac)[0];
    const file = req?.file;
    if (file) {
      bivouac.imageName = await uploadImageToS3(file);
    }

    const result = await collections?.bivouacs?.insertOne(bivouac);

    if (result?.acknowledged) {
      sendSuccess(res, { id: result.insertedId }, 201);
    } else {
      sendFail(res, null, 400);
    }
  }
);

/**
 * @openapi
 * /bivouacs/{id}:
 *   put:
 *     description: Updates a bivouac
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Bivouac id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Operation successful
 *       304:
 *         description: Resource was found, but operation failed
 *       404:
 *         description: Resource not found
 */
bivouacRouter.put(
  "/:id",
  checkRole("admin"),
  multerUploadImage.single("bivouacImage"),
  async (req, res) => {
    let formattedBivouac: BivouacFormattedInterface;
    try {
      formattedBivouac = JSON.parse(req?.body?.bivouac);
    } catch (e) {
      console.error(e);
      sendFail(res, null, 400);
      return;
    }

    const id = req?.params?.id;

    // Each prop that is null gets unset. To avoid
    // removing props, simply do not pass that prop.
    const [bivouac, filteredProps] = unformatBivouac(formattedBivouac);

    // imageName === null means that the image should be deleted.
    // We'll also delete the image if a new image is uploaded (see below).
    let deleteImage = filteredProps.includes("imageName");

    const file = req?.file;
    if (file) {
      // If a new image is uploaded, delete the old one.
      deleteImage = true;
      try {
        bivouac.imageName = await uploadImageToS3(file);
      } catch (e) {
        console.error(e);
        sendFail(res, null, 400);
      }
    }

    if (deleteImage) {
      //! If this block fails we potentially uploaded an image without using it (if we are updating the image).
      //Todo Fix this.
      const errCode = await deleteBivouacImageIfExists(id);
      if (errCode) {
        sendFail(res, null, errCode);
        return;
      }
    }

    // Update object in the db.
    const query = { _id: new ObjectId(id) };
    const result = await collections?.bivouacs?.updateOne(query, [
      { $set: bivouac },
      ...(filteredProps.length < 1 ? [] : [{ $unset: filteredProps }]),
    ]);

    if (result && result.matchedCount) {
      sendSuccess(res, null, 204);
    } else if (!result?.matchedCount) {
      sendFail(res, null, 404);
    } else {
      sendFail(res, null, 304);
    }
  }
);

/**
 * @openapi
 * /bivouacs/{id}:
 *   delete:
 *     description: Deletes a bivouac
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Bivouac id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Operation successful
 *       400:
 *         description: Resource was found, but operation failed
 *       404:
 *         description: Resource not found
 */
bivouacRouter.delete("/:id", checkRole("admin"), async (req, res) => {
  const id = req?.params?.id;
  const query = { _id: new ObjectId(id) };

  const errCode = await deleteBivouacImageIfExists(id);
  if (errCode) {
    sendFail(res, null, errCode);
    return;
  }

  const result = await collections?.bivouacs?.deleteOne(query);

  if (!result) {
    // Failed to remove the bivouac.
    sendFail(res, null, 400);
    return;
  } else if (!result.deletedCount) {
    sendFail(res, null, 404);
    return;
  }

  sendSuccess(res, null, 204);
});
