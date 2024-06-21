import { errorCatcher } from "./error-catcher";

// Order matters: middlewares are loaded first to last.
export const middlewares = [];

export const errorMiddlewares = [errorCatcher];
