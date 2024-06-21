import { Router } from "express";
import { employeeRouter } from "./employee.routes";
import { authRouter } from "./auth.routes";
import { bivouacRouter } from "./bivouac.routes";

export const routers: [string, Router][] = [
  ["employees", employeeRouter],
  ["auth", authRouter],
  ["bivouacs", bivouacRouter],
];
