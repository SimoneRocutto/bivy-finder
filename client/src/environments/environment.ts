import { Environment } from "../app/types/environment.type";

const base = "http://localhost:4200";

export const environment: Environment = {
  baseUrl: base,
  apiUrl: base + "/api",
};
