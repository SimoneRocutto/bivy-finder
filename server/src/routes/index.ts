import { Router } from "express";
import { authRouter } from "./auth.routes";
import { cabinRouter } from "./cabin.routes";
import { userRouter } from "./user.routes.";

export const routers: [string, Router][] = [
  ["auth", authRouter],
  ["users", userRouter],
  ["cabins", cabinRouter],
];
