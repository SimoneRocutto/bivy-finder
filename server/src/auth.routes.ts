import * as express from "express";
import bcrypt from "bcrypt";
import session from "express-session";
import bodyParser from "body-parser";
import { collections } from "./database";
import { sendError, sendFail, sendSuccess } from "./utils/http";

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
  if (!username || !password) {
    sendFail(
      res,
      {
        ...(username ? {} : { username: "username is required" }),
        ...(password ? {} : { password: "password is required" }),
      },
      400
    );
    return;
  }

  const user = await usersCollection?.findOne({ username });

  if (!user) {
    sendFail(
      res,
      {
        username: "invalid username or password",
        password: "invalid username or password",
      },
      401
    );
  } else {
    // Compare the provided password with the hashed password stored in the database
    bcrypt.compare(password, user.password, (err: any, result: any) => {
      if (err) throw err;
      if (!result) {
        sendFail(
          res,
          {
            username: "invalid username or password",
            password: "invalid username or password",
          },
          401
        );
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
              sendError(res, "Unknown error.", 500);
              return next(err);
            }
          });
          sendSuccess(res, { user: { username: username } });
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
      sendSuccess(res, null);
    });
  });
});

// This is simply an example for checking if the user is logged in or not.
// In the future, this logic should be moved to a middleware, so that
// unauthenticated users cannot access protected routes.
authRouter.post("/check-login", bodyParser.json(), async (_req, res) => {
  const { session }: { session: session.Session & Partial<SessionCustomData> } =
    _req;
  sendSuccess(res, { userAuthenticated: !!session.userData });
});

authRouter.post("/sign-up", bodyParser.json(), async (_req, res) => {
  const usersCollection = await collections?.users;
  const { username, password } = _req.body;
  console.log(_req.body);

  if (!username || !password) {
    sendFail(
      res,
      {
        ...(username ? {} : { username: "username is required" }),
        ...(password ? {} : { password: "password is required" }),
      },
      400
    );
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
      sendSuccess(res, { user: { id: result.insertedId } }, 201);
    } else {
      sendError(res, "Failed to create a new user.", 500);
    }
  } catch (error) {
    console.error(error);
    sendError(res, "Unknown error.", 500);
  }
});
