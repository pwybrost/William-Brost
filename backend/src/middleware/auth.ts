import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { verifySession, type SessionPayload } from "../utils/jwt.js";
import { forbidden, unauthorized } from "../utils/httpError.js";
import { query } from "../db/pool.js";

export const SESSION_COOKIE = "wb_session";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      session?: SessionPayload;
    }
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAMESITE,
  path: "/",
  maxAge: env.SESSION_DAYS * 24 * 60 * 60 * 1000,
} as const;

/** Reads the session cookie if present. Never blocks the request (guests are allowed). */
export function loadSession(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token === "string") {
    const session = verifySession(token);
    if (session) req.session = session;
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session) return next(unauthorized());
  next();
}

/**
 * Only the owner account (role = admin) gets past this. The role is re-checked in the
 * database so a demoted account loses access immediately, not when its token expires.
 */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.session) return next(unauthorized());
  const { rows } = await query<{ role: string }>("SELECT role FROM users WHERE id = $1", [
    req.session.sub,
  ]);
  if (rows[0]?.role !== "admin") return next(forbidden());
  next();
}
