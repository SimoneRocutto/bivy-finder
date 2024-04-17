import * as express from "express";
import bcrypt from "bcrypt";
import session from "express-session";
import bodyParser from "body-parser";
import { collections } from "./database";

interface SessionCustomData {
  userData?: {
    id: string;
    username: string;
  };
}

export const authRouter = express.Router();
authRouter.use(express.json());

authRouter.post("/login", bodyParser.json(), async (_req, res, next) => {
  const usersCollection = await collections?.users;
  const { username, password } = _req.body;
  const user = await usersCollection?.findOne({ username });

  if (!user) {
    res.status(401).send("Invalid username or password");
  } else {
    // Compare the provided password with the hashed password stored in the database
    bcrypt.compare(password, user.password, (err: any, result: any) => {
      if (err) throw err;
      if (!result) {
        res.status(401).send("Invalid username or password");
      } else {
        // regenerate the session, which is good practice to help
        // guard against forms of session fixation
        _req.session.regenerate(function (err) {
          if (err) next(err);
          // Store user data in session
          const {
            session,
          }: { session: session.Session & Partial<SessionCustomData> } = _req;
          session.userData = {
            id: user._id.toString(),
            username: user.username,
          };
          _req.session.save(function (err) {
            if (err) {
              res.status(400).send("Unknown error");
              return next(err);
            }
          });
          res.status(200).send("Login successful");
        });
      }
    });
  }
});

authRouter.post("/logout", bodyParser.json(), async (_req, res, next) => {
  const { session }: { session: session.Session & Partial<SessionCustomData> } =
    _req;
  session.userData = undefined;
  // I copied this code from the express-session docs, I honestly don't
  // know why we are doing this instead of _req.session.destroy.
  _req.session.save(function (err) {
    if (err) {
      next(err);
    }

    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    _req.session.regenerate(function (err) {
      if (err) {
        next(err);
      }
      res.status(200).send("Logout successful");
    });
  });
});

// This is simply an example for checking if the user is logged in or not.
// In the future, this logic should be moved to a middleware, so that
// unauthenticated users cannot access protected routes.
authRouter.post("/check-login", bodyParser.json(), async (_req, res) => {
  const { session }: { session: session.Session & Partial<SessionCustomData> } =
    _req;
  if (!session.userData) {
    console.log("user unauthenticated");
    res.status(200).send("user unauthenticated");
  } else {
    console.log("user authenticated");
    res.status(200).send("user authenticated");
  }
});

authRouter.post("/sign-up", bodyParser.json(), async (_req, res) => {
  const usersCollection = await collections?.users;
  const { username, password } = _req.body;
  console.log(_req.body);

  if (!username || !password) {
    res.status(400).send("Username or password missing.");
    return;
  }

  try {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    const result = await usersCollection?.insertOne({
      username,
      password: hash,
    });

    if (result?.acknowledged) {
      res.status(201).send(`Created a new user: ID ${result.insertedId}.`);
    } else {
      console.log({ result });
      res.status(500).send("Failed to create a new user.");
    }
  } catch (error) {
    console.error(error);
    res.status(400).contentType("text/plain").send("Unknown error.");
  }
});
