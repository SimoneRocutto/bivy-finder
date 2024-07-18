import { Session } from "express-session";
import { UserRole } from "../data/user";

export interface SessionCustomData {
  userData?: {
    id: string;
    username: string;
    role?: UserRole;
  };
}

export type CustomSession = Session & Partial<SessionCustomData>;
