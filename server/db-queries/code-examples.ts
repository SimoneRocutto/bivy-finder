import { Collection } from "mongodb";

export const removePropFromCollection = async (
  collection: Collection<any>,
  prop: string
) => {
  await collection?.updateMany({}, { $unset: { [prop]: 1 } });
  console.log(`Property ${prop} removed from all documents in the collection!`);
};

/**
 *
 * @param collection
 * @param sourceProp
 * @param newProp
 * @param testing If true, no changes will be made; only a log will be printed.
 */
const duplicateCollectionProp = async (
  collection: Collection,
  sourceProp: string,
  newProp: string,
  testing = false
) => {
  const aggregationPipeline = [
    // Only include cabins with a description
    {
      $match: {
        [sourceProp]: { $exists: true },
      },
    },
    // Create new field with external links, taking the description as the only link
    {
      $addFields: {
        [newProp]: "$" + sourceProp,
      },
    },
  ];

  if (testing) {
    const results = await collection?.aggregate(aggregationPipeline).toArray();

    // Peek into the aggregated results
    console.log("Aggregated Results:", results);
    return;
  }

  await collection
    ?.aggregate([
      ...aggregationPipeline,
      {
        $merge: {
          into: collection.collectionName,
          on: "_id",
          whenMatched: "merge",
          whenNotMatched: "discard",
        },
      },
    ])
    .toArray(); // toArray is used to execute the pipeline
};
