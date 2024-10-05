import { rateLimiterRedis } from "../server";

// Rate limit configuration is inside server.ts.
export const rateLimiter = (req: any, res: any, next: any) => {
  rateLimiterRedis
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch((_) => {
      res.status(429).send("Too Many Requests");
    });
};
