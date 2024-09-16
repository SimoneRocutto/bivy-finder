import * as express from "express";
import { ClientSession, ObjectId } from "mongodb";
import { collections, getClient } from "../database/database";
import { sendFail, sendSuccess } from "../helpers/http";
import {
  CabinInterface,
  CabinFormattedInterface as CabinFormattedInterface,
} from "../models/data/cabin";
import { uploadImageToS3 } from "../helpers/s3";
import { multerUploadImage } from "../helpers/multer";
import {
  deleteCabinImageIfExists,
  formatCabin,
  unformatCabin,
} from "../helpers/data/cabins";
import { checkAuth, checkRole } from "../middlewares/route-guards";
import { CustomSession } from "../models/application/session";

export const cabinRouter = express.Router();
cabinRouter.use(express.json());

/**
 * @openapi
 * components:
 *   schemas:
 *     NewCabin:
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
 *     Cabin:
 *       allOf:
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *         - $ref: '#/components/schemas/NewCabin'
 */

/**
 * @openapi
 * /cabins/:
 *   get:
 *     description: Gets all cabins
 *     responses:
 *       200:
 *         description: Operation successful
 *         content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Cabin'
 */
cabinRouter.get("/", async (_req, res) => {
  const cabins = (await collections?.cabins?.find({}).toArray()) ?? [];
  const formattedCabins: CabinFormattedInterface[] = await Promise.all(
    (cabins as CabinInterface[]).map(async (cabin) => {
      return formatCabin(cabin);
    })
  );

  sendSuccess(res, formattedCabins);
});

/**
 * @openapi
 * /cabins/{id}:
 *   get:
 *     description: Gets a cabin by id
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Cabin id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Operation successful
 *         content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Cabin'
 *       404:
 *         description: Resource not found
 */
cabinRouter.get("/:id", async (req, res) => {
  const id = req?.params?.id;
  const query = { _id: new ObjectId(id) };
  const cabin = await collections?.cabins?.findOne(query);

  if (cabin) {
    sendSuccess(res, await formatCabin(cabin));
  } else {
    sendFail(res, null, 404);
  }
});

/**
 * @openapi
 * /cabins/:
 *   post:
 *     description: Creates a cabin
 *     requestBody:
 *       description: Cabin object that needs to be added to the database
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewCabin'
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
 *       403:
 *         description: Unauthorized. Needs admin role
 */

cabinRouter.post(
  "/",
  checkRole("admin"),
  multerUploadImage.single("cabinImage"),
  async (req, res) => {
    let formattedCabin: CabinFormattedInterface;
    try {
      formattedCabin = JSON.parse(req?.body?.cabin);
    } catch (e) {
      console.error(e);
      sendFail(res, null, 400);
      return;
    }

    const cabin = unformatCabin(formattedCabin)[0];
    const file = req?.file;
    if (file) {
      cabin.imageName = await uploadImageToS3(file);
    }

    const result = await collections?.cabins?.insertOne(cabin);

    if (result?.acknowledged) {
      sendSuccess(res, { id: result.insertedId }, 201);
    } else {
      sendFail(res, null, 400);
    }
  }
);

/**
 * @openapi
 * /cabins/{id}:
 *   put:
 *     description: Updates a cabin
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Cabin id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Operation successful
 *       304:
 *         description: Resource was found, but operation failed
 *       403:
 *         description: Unauthorized. Needs admin role
 *       404:
 *         description: Resource not found
 */
cabinRouter.put(
  "/:id",
  checkRole("admin"),
  multerUploadImage.single("cabinImage"),
  async (req, res) => {
    let formattedCabin: CabinFormattedInterface;
    try {
      formattedCabin = JSON.parse(req?.body?.cabin);
    } catch (e) {
      console.error(e);
      sendFail(res, null, 400);
      return;
    }

    const id = req?.params?.id;

    // Each prop that is null gets unset. To avoid
    // removing props, simply do not pass that prop.
    const [cabin, filteredProps] = unformatCabin(formattedCabin);

    // imageName === null means that the image should be deleted.
    // We'll also delete the image if a new image is uploaded (see below).
    let deleteImage = filteredProps.includes("imageName");

    const file = req?.file;
    if (file) {
      // If a new image is uploaded, delete the old one.
      deleteImage = true;
      try {
        cabin.imageName = await uploadImageToS3(file);
      } catch (e) {
        console.error(e);
        sendFail(res, null, 400);
      }
    }

    if (deleteImage) {
      //! If this block fails we potentially uploaded an image without using it (if we are updating the image).
      //Todo Fix this.
      const errCode = await deleteCabinImageIfExists(id);
      if (errCode) {
        sendFail(res, null, errCode);
        return;
      }
    }

    // Update object in the db.
    const query = { _id: new ObjectId(id) };
    const result = await collections?.cabins?.updateOne(query, [
      { $set: cabin },
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
 * /cabins/{id}:
 *   delete:
 *     description: Deletes a cabin
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Cabin id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Operation successful
 *       400:
 *         description: Resource was found, but operation failed
 *       403:
 *         description: Unauthorized. Needs admin role
 *       404:
 *         description: Resource not found
 */
cabinRouter.delete("/:id", checkRole("admin"), async (req, res) => {
  const id = req?.params?.id;
  const query = { _id: new ObjectId(id) };

  const errCode = await deleteCabinImageIfExists(id);
  if (errCode) {
    sendFail(res, null, errCode);
    return;
  }

  const result = await collections?.cabins?.deleteOne(query);

  if (!result) {
    // Failed to remove the cabin.
    sendFail(res, null, 400);
    return;
  } else if (!result.deletedCount) {
    sendFail(res, null, 404);
    return;
  }

  sendSuccess(res, null, 204);
});

/**
 * @openapi
 * /cabins/favorite/{id}:
 *   post:
 *     description: Favorites a cabin
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Cabin id
 *         required: true
 *         schema:
 *           type: string
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
 *       403:
 *         description: Unauthorized. Needs login
 */
cabinRouter.post("/favorite/:id", checkAuth(), async (req, res) => {
  const { session }: { session: CustomSession } = req;
  const userId = session.userData?.id;
  const cabinId = req?.params?.id;

  if (!userId || !cabinId) {
    sendFail(res, null, 400);
  }

  const cabinIsFavorite = await collections.users?.findOne({
    _id: new ObjectId(userId),
    "favoriteCabins.cabinId": new ObjectId(cabinId),
  });

  if (cabinIsFavorite) {
    return sendFail(res, { message: "Cabin is already favorite." }, 400);
  }

  // Using a transaction to make sure both operation succeed together or
  // fail together.
  const client = getClient();
  const dbSession: ClientSession = client.startSession();
  try {
    await dbSession.withTransaction(async () => {
      await collections?.cabins?.updateOne(
        { _id: new ObjectId(cabinId) },
        {
          $inc: {
            favoritesCount: 1,
          },
        },
        { session: dbSession }
      );
      await collections?.users?.updateOne(
        { _id: new ObjectId(userId) },
        {
          $push: {
            favoriteCabins: {
              cabinId: new ObjectId(cabinId),
              time: new Date(),
            },
          },
        },
        { session: dbSession }
      );
    });
    sendSuccess(res, null, 201);
  } catch (e) {
    sendFail(res, null, 400);
  } finally {
    await dbSession.endSession();
    return;
  }
});

/**
 * @openapi
 * /cabins/favorite/{id}:
 *   delete:
 *     description: Unfavorites a cabin
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Cabin id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Operation successful
 *       400:
 *         description: Resource was found, but operation failed
 *       403:
 *         description: Unauthorized. Needs login
 */
cabinRouter.delete("/favorite/:id", checkAuth(), async (req, res) => {
  const { session }: { session: CustomSession } = req;
  const userId = session.userData?.id;
  const cabinId = req?.params?.id;

  if (!userId || !cabinId) {
    sendFail(res, null, 400);
  }

  const cabinIsFavorite = await collections.users?.findOne({
    _id: new ObjectId(userId),
    "favoriteCabins.cabinId": new ObjectId(cabinId),
  });

  if (!cabinIsFavorite) {
    return sendFail(res, { message: "Cabin is already not favorite." }, 400);
  }

  // Using a transaction to make sure both operation succeed together or
  // fail together.
  const client = getClient();
  const dbSession: ClientSession = client.startSession();
  try {
    await dbSession.withTransaction(async () => {
      await collections?.cabins?.updateOne(
        { _id: new ObjectId(cabinId) },
        {
          $inc: {
            favoritesCount: -1,
          },
        },
        { session: dbSession }
      );
      await collections?.users?.updateOne(
        { _id: new ObjectId(userId) },
        {
          $pull: {
            favoriteCabins: {
              cabinId: new ObjectId(cabinId),
            },
          },
        },
        { session: dbSession }
      );
    });
    sendSuccess(res, null, 204);
  } catch (e) {
    sendFail(res, null, 400);
  } finally {
    await dbSession.endSession();
    return;
  }
});
