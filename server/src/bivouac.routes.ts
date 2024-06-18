import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "./database";

export const bivouacRouter = express.Router();
bivouacRouter.use(express.json());

bivouacRouter.get("/", async (_req, res) => {
  try {
    const bivouacs = await collections?.bivouacs?.find({}).toArray();
    res.status(200).send(bivouacs);
  } catch (error) {
    res
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
});

bivouacRouter.get("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const bivouac = await collections?.employees?.findOne(query);

    if (bivouac) {
      res.status(200).send(bivouac);
    } else {
      res.status(404).send(`Failed to find a bivouac: ID ${id}.`);
    }
  } catch (error) {
    res.status(404).send(`Failed to find a bivouac: ID ${req?.params?.id}.`);
  }
});

bivouacRouter.post("/", async (req, res) => {
  {
    try {
      const bivouac = req.body;
      const result = await collections?.bivouacs?.insertOne(bivouac);

      if (result?.acknowledged) {
        res.status(201).send(`Created a new bivouac: ID ${result.insertedId}.`);
      } else {
        res.status(500).send("Failed to create a new bivouac.");
      }
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .send(error instanceof Error ? error.message : "Unknown error.");
    }
  }
});

bivouacRouter.put("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const bivouac = req.body;
    const query = { _id: new ObjectId(id) };
    const result = await collections?.bivouacs?.updateOne(query, {
      $set: bivouac,
    });

    if (result && result.matchedCount) {
      res.status(200).send(`Updated a bivouac: ID ${id}.`);
    } else if (!result?.matchedCount) {
      res.status(404).send(`Failed to find a bivouac: ID ${id}.`);
    } else {
      res.status(304).send(`Failed to update a bivouac: ID ${id}.`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    res.status(400).send(message);
  }
});

bivouacRouter.delete("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const result = await collections?.bivouacs?.deleteOne(query);

    if (result && result.deletedCount) {
      res.status(202).send(`Removed a bivouac: ID ${id}.`);
    } else if (!result) {
      res.status(400).send(`Failed to remove a bivouac: ID ${id}.`);
    } else if (!result.deletedCount) {
      res.status(404).send(`Failed to find a bivouac: ID ${id}.`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    res.status(400).send(message);
  }
});
