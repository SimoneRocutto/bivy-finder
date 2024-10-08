import { errorCatcher } from "./error-catcher";
import { rateLimiter } from "./rate-limiter";

// Add here middlewares that we have to fire on every request.
// Order matters: middlewares are loaded first to last.

// Middlewares here will be executed before routes.
export const middlewares = [rateLimiter];

// Middlewares here will be executed after routes.
export const errorMiddlewares = [errorCatcher];
