import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "../database/database";
import { sendFail, sendSuccess } from "../utils/http";
import { objectFalsyFilter } from "../utils/misc";

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
  const bivouacs = await collections?.bivouacs?.find({}).toArray();
  sendSuccess(res, bivouacs);
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
bivouacRouter.put("/:id", async (req, res) => {
  const id = req?.params?.id;
  const bivouac = req.body;
  // Each prop that is null gets unset. To avoid
  // removing props, simply do not pass that prop.
  const [cleanBivouac, filteredProps] = objectFalsyFilter(bivouac);
  console.log({ bivouac, cleanBivouac, filteredProps });
  const query = { _id: new ObjectId(id) };
  const result = await collections?.bivouacs?.updateOne(query, [
    { $set: cleanBivouac },
    ...(filteredProps.length < 1 ? [] : [{ $unset: filteredProps }]),
  ]);

  if (result && result.matchedCount) {
    sendSuccess(res, null, 204);
  } else if (!result?.matchedCount) {
    sendFail(res, null, 404);
  } else {
    sendFail(res, null, 304);
  }
});

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
