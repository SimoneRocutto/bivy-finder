import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "../database/database";
import { sendFail, sendSuccess } from "../utils/http";

export const bivouacRouter = express.Router();
bivouacRouter.use(express.json());

bivouacRouter.get("/", async (_req, res) => {
  const bivouacs = await collections?.bivouacs?.find({}).toArray();
  sendSuccess(res, bivouacs);
});

bivouacRouter.get("/:id", async (req, res) => {
  const id = req?.params?.id;
  const query = { _id: new ObjectId(id) };
  const bivouac = await collections?.employees?.findOne(query);

  if (bivouac) {
    sendSuccess(res, bivouac);
  } else {
    sendFail(res, { data: null }, 404);
  }
});

bivouacRouter.post("/", async (req, res) => {
  {
    const bivouac = req.body;
    const result = await collections?.bivouacs?.insertOne(bivouac);

    if (result?.acknowledged) {
      sendSuccess(res, { data: { id: result.insertedId } }, 201);
    } else {
      res.status(500).send("Failed to create a new bivouac.");
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
    sendSuccess(res, { data: null }, 204);
  } else if (!result?.matchedCount) {
    sendFail(res, { data: null }, 404);
  } else {
    // Failed to update
    sendFail(res, { data: null }, 304);
  }
});

bivouacRouter.delete("/:id", async (req, res) => {
  const id = req?.params?.id;
  const query = { _id: new ObjectId(id) };
  const result = await collections?.bivouacs?.deleteOne(query);

  if (!result) {
    // Failed to remove the bivouac
    sendFail(res, { data: null }, 400);
  } else if (!result.deletedCount) {
    sendFail(res, { data: null }, 404);
  } else {
    sendSuccess(res, { data: null }, 204);
  }
});
