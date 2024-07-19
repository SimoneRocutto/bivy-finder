import { Router } from "express";
import { authRouter } from "./auth.routes";
import { bivouacRouter } from "./bivouac.routes";

export const routers: [string, Router][] = [
  ["auth", authRouter],
  ["bivouacs", bivouacRouter],
];
