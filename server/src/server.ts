import * as dotenv from "dotenv";
import express from "express";
import session from "express-session";

import cors from "cors";
import { connectToDatabase } from "./database";
import { employeeRouter } from "./employee.routes";
import { authRouter } from "./auth.routes";

dotenv.config({ path: __dirname + "/.env" });

// load env vars from .env

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
    const a_middleware_function = function (req: any, res: any, next: any) {
      // Perform some operations
      next(); // Call next() so Express will call the next middleware function in the chain.
    };
    app.use(a_middleware_function);
    app.use("/employees", employeeRouter);
    app.use("/auth", authRouter);

    // start the Express server
    app.listen(5200, () => {
      console.log(`Server running at http://localhost:5200...`);
    });
  })
  .catch((error) => console.error(error));
