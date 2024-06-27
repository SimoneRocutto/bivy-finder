import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "../database/database";
import { sendFail, sendSuccess } from "../utils/http";

export const bivouacRouter = express.Router();
bivouacRouter.use(express.json());

/**
 * @openapi
 * /bivouacs/:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
bivouacRouter.get("/", async (_req, res) => {
  const bivouacs = await collections?.bivouacs?.find({}).toArray();
  sendSuccess(res, bivouacs);
});

bivouacRouter.get("/:id", async (req, res) => {
  const id = req?.params?.id;
  const query = { _id: new ObjectId(id) };
  const bivouac = await collections?.bivouacs?.findOne(query);

  if (bivouac) {
    sendSuccess(res, bivouac);
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
 *             type: object
 *             required:
 *               name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               type:
 *                 type: string
 *                 default: "managed"
 *                 enum:
 *                   - managed
 *                   - require-keys
 *                   - private
 *                   - open
 *                   - out-of-lombardy
 *                   - incomplete
 *                   - abandoned
 *               material:
 *                 type: string
 *                 enum:
 *                   - stone
 *                   - wood
 *                   - metal
 *                   - rock
 *               latLng:
 *                 type: array
 *                 items:
 *                   type: number
 *                 minItems: 3
 *                 maxItems: 3
 *     responses:
 *       201:
 *         description: Creation successful
 *         content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *       400:
 *         description: Creation failed
 */
bivouacRouter.post("/", async (req, res) => {
  {
    const bivouac = req.body;
    const result = await collections?.bivouacs?.insertOne(bivouac);

    if (result?.acknowledged) {
      sendSuccess(res, { id: result.insertedId }, 201);
    } else {
      sendFail(res, null, 400);
    }
  }
});

bivouacRouter.put("/:id", async (req, res) => {
  const id = req?.params?.id;
  const bivouac = req.body;
  const query = { _id: new ObjectId(id) };
  const result = await collections?.bivouacs?.updateOne(query, {
    $set: bivouac,
  });

  if (result && result.matchedCount) {
    sendSuccess(res, null, 204);
  } else if (!result?.matchedCount) {
    sendFail(res, null, 404);
  } else {
    // Failed to update
    sendFail(res, null, 304);
  }
});

bivouacRouter.delete("/:id", async (req, res) => {
  const id = req?.params?.id;
  const query = { _id: new ObjectId(id) };
  const result = await collections?.bivouacs?.deleteOne(query);

  if (!result) {
    // Failed to remove the bivouac
    sendFail(res, null, 400);
  } else if (!result.deletedCount) {
    sendFail(res, null, 404);
  } else {
    sendSuccess(res, null, 204);
  }
});
