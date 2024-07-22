import { Router } from "express";
import { authRouter } from "./auth.routes";
import { bivouacRouter } from "./bivouac.routes";
import { userRouter } from "./user.routes.";

export const routers: [string, Router][] = [
  ["auth", authRouter],
  ["users", userRouter],
  ["bivouacs", bivouacRouter],
];
