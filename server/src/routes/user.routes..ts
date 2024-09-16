import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "../database/database";
import { sendFail, sendSuccess } from "../helpers/http";
import { CustomSession } from "../models/application/session";

export const userRouter = express.Router();
userRouter.use(express.json());

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         username
 *       properties:
 *         username:
 *           type: string
 *         favoriteCabins:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @openapi
 * /users/self:
 *   get:
 *     description: Gets logged user data except for basic information we can get
 *       from login route.
 *     parameters:
 *     responses:
 *       200:
 *         description: Operation successful
 *         content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Operation failed
 *       404:
 *         description: Resource not found
 */
userRouter.get("/self", async (req, res) => {
  const { session }: { session: CustomSession } = req;
  const userId = session.userData?.id;
  if (!userId) {
    sendFail(res, null, 400);
  }

  const user = await collections?.users?.findOne(
    {
      _id: new ObjectId(userId),
    },
    { projection: { _id: 0, favoriteCabins: 1 } }
  );

  if (user) {
    sendSuccess(res, user, 200);
  } else {
    sendFail(res, null, 404);
  }
});
