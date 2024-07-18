import * as express from "express";
import { UserRole } from "../models/data/user";
import { CustomSession } from "../models/application/session";
import { sendError } from "../helpers/http";

export const checkAuth = () => {
  return (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { session }: { session: CustomSession } = _req;
    if (!session.userData) {
      sendError(res, "User not authenticated.", 403);
      return;
    }
    // User is authenticated, proceed to the next middleware or route handler
    next();
  };
};

export const checkRole = (role: UserRole) => {
  return (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { session }: { session: CustomSession } = _req;
    if (!session.userData) {
      sendError(res, "User not authenticated.", 403);
      return;
    }
    if (session.userData?.role !== role) {
      sendError(
        res,
        "Access denied. User does not have required permissions.",
        403
      );
      return;
    }
    // User has the required role, proceed to the next middleware or route handler
    next();
  };
};
