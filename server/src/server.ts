import * as dotenv from "dotenv";
import express from "express";
// Don't know yet if it's possible to use import syntax here.
// This module allows to handle async errors without having to
// use try-catch block everytime (express 5 would allow the same,
// but it's still in beta to this day (21-06-2024))
require("express-async-errors");
import session from "express-session";

import cors from "cors";
import { connectToDatabase } from "./database/database";
import { errorMiddlewares, middlewares } from "./middlewares";
import { routers } from "./routes";

dotenv.config({ path: __dirname + "/config/.env" });

// Load env vars from .env

const { ATLAS_URI, SESSION_SECRET } = process.env;
if (!ATLAS_URI) {
  console.error(
    "No ATLAS_URI environment variable has been defined in config.env"
  );
  process.exit(1);
}
if (!SESSION_SECRET) {
  console.error(
    "No SESSION_SECRET environment variable has been defined in config.env"
  );
  process.exit(1);
}

connectToDatabase(ATLAS_URI)
  .then(() => {
    const app = express();
    app.use(
      session({
        // Todo should add a store to make the session persistent even
        // when restarting the server.
        secret: SESSION_SECRET,
        name: "uniqueSessionId",
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          // Todo change to true for production
          secure: false,
          maxAge: 1000 * 60 * 60 * 24 * 7,
        },
      })
    );
    app.use(cors());
    app.use((_req, res, next) => {
      console.log("DEBUG SESSION", _req.session);
      next();
    });

    // Load middlewares
    for (const middleware of middlewares) {
      app.use(middleware);
    }

    // Load routes
    for (const router of routers) {
      app.use("/" + router[0], router[1]);
    }

    // Load error middlewares (must be after everything else)
    for (const middleware of errorMiddlewares) {
      app.use(middleware);
    }

    // Start the Express server
    app.listen(5200, () => {
      console.log(`Server running at http://localhost:5200...`);
    });
  })
  .catch((error) => console.error(error));
