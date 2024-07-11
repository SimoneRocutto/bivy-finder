import * as dotenv from "dotenv";
import { connectToDatabase } from "../src/database/database";

console.log("starting");

dotenv.config({ path: __dirname + "/../src/config/.env" });

console.log("Reading env");
const { ATLAS_URI } = process.env;

if (!ATLAS_URI) {
  console.log("Missing ATLAS_URI environment variable");
  process.exit();
}

console.log("Connecting to db...");
connectToDatabase(ATLAS_URI)
  .then(async () => {
    console.log("Connected!");

    // Write code to execute here

    console.log("Done");
    process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
