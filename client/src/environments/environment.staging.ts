import { Environment } from "../app/types/environment.type";

const base = "http://localhost:80";
export const environment: Environment = {
  baseUrl: base,
  apiUrl: base + "/api",
  production: true,
};
