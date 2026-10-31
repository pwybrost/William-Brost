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

/**
 * Checks the role in the database rather than trusting the token, so promotions and
 * demotions take effect immediately (e.g. an account promoted to owner after signing up).
 */
export async function isAdminRequest(req: Request): Promise<boolean> {
  if (!req.session) return false;
  const { rows } = await query<{ role: string }>("SELECT role FROM users WHERE id = $1", [
    req.session.sub,
  ]);
  return rows[0]?.role === "admin";
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session) return next(unauthorized());
  next();
}

/** Only the owner account (role = admin) gets past this. */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.session) return next(unauthorized());
  if (!(await isAdminRequest(req))) return next(forbidden());
  next();
}
