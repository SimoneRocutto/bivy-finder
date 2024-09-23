import * as dotenv from "dotenv";
import express from "express";
import { S3Client } from "@aws-sdk/client-s3";
// Don't know yet if it's possible to use import syntax here.
// This module allows to handle async errors without having to
// use try-catch block everytime (express 5 would allow the same,
// but it's still in beta to this day (21-06-2024))
require("express-async-errors");
import session from "express-session";

import cors from "cors";
import * as redis from "redis";
import RedisStore from "connect-redis";
import { connectToDatabase } from "./database/database";
import { errorMiddlewares, middlewares } from "./middlewares";
import { routers } from "./routes";
import { sendError } from "./helpers/http";
const { specs, swaggerUi } = require("./config/swagger");

dotenv.config({ path: __dirname + "/config/.env" });

// Load env vars from .env

export const {
  ATLAS_URI,
  ATLAS_DB,
  SESSION_SECRET,
  PORT,
  AWS_ACCESS_KEY_ID,
  AWS_ACCESS_KEY_SECRET,
  AWS_DEFAULT_REGION,
  AWS_BUCKET_NAME,
  AWS_BUCKET_DIRECTORY,
  REDIS_URL,
  CLIENT_URL,
  ENVIRONMENT,
} = process.env;
if (!ATLAS_URI || !ATLAS_DB) {
  console.error(
    "ATLAS_URI or ATLAS_DB environment variable missing from config/.env"
  );
  process.exit(1);
}
if (!SESSION_SECRET) {
  console.error(
    "No SESSION_SECRET environment variable has been defined in config/.env"
  );
  process.exit(1);
}
if (
  !AWS_ACCESS_KEY_ID ||
  !AWS_ACCESS_KEY_SECRET ||
  !AWS_DEFAULT_REGION ||
  !AWS_BUCKET_NAME ||
  !AWS_BUCKET_DIRECTORY
) {
  console.error(
    "AWS_ACCESS_KEY_ID, AWS_ACCESS_KEY_SECRET, AWS_DEFAULT_REGION, AWS_BUCKET_NAME or AWS_BUCKET_DIRECTORY environment variable missing from config/.env"
  );
  process.exit(1);
}

if (!REDIS_URL) {
  console.error("REDIS_URL environment variable missing from config/.env");
}

// Todo move this to a config file if possible
// Now creating the S3 instance which will be used in uploading photo to s3 bucket.
export const s3 = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_ACCESS_KEY_SECRET,
  },
  region: process.env.AWS_DEFAULT_REGION,
});

connectToDatabase(ATLAS_URI)
  .then(async () => {
    const app = express();

    // Redis config
    const redisClient = redis.createClient({
      url: REDIS_URL,
    });
    redisClient.on("error", function (err) {
      console.log("Could not establish a connection with redis. " + err);
    });
    redisClient.on("connect", function (err) {
      console.log("Connected to redis successfully");
    });
    const redisStore = new RedisStore({ client: redisClient });
    await redisClient.connect();

    app.use(
      session({
        // Using Redis makes the session persistent event when restarting the server.
        store: redisStore,
        secret: SESSION_SECRET,
        name: "uniqueSessionId",
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          // Todo change to true for production
          secure: ENVIRONMENT === "production" ? true : false,
          sameSite: "strict",
          maxAge: 1000 * 60 * 60 * 24 * 7,
        },
      })
    );
    app.use(
      cors({
        origin: CLIENT_URL ?? "",
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );
    app.use((_req, res, next) => {
      console.log("DEBUG SESSION", _req.session);
      next();
    });

    // Load middlewares
    for (const middleware of middlewares) {
      app.use(middleware);
    }

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

    // Load routes
    for (const router of routers) {
      app.use("/" + router[0], router[1]);
    }

    // Load error middlewares (must be after everything else)
    for (const middleware of errorMiddlewares) {
      app.use(middleware);
    }

    app.use("/", (req, res) => {
      sendError(res, "Api route not found", 404);
    });

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}...`);
    });
  })
  .catch((error) => console.error(error));
