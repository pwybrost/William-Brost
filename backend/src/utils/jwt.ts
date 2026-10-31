import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type Role = "admin" | "user";

export interface SessionPayload {
  sub: string; // user id
  role: Role;
}

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.SESSION_DAYS * 24 * 60 * 60, // seconds
  });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
    if (typeof decoded === "string" || typeof decoded.sub !== "string") return null;
    const role = decoded.role === "admin" ? "admin" : "user";
    return { sub: decoded.sub, role };
  } catch {
    return null;
  }
}
