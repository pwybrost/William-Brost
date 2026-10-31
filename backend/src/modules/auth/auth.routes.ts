import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { env } from "../../config/env.js";
import { query } from "../../db/pool.js";
import { syncOwnerRole } from "../../db/seedAdmin.js";
import { SESSION_COOKIE, requireAuth, sessionCookieOptions } from "../../middleware/auth.js";
import { conflict, unauthorized } from "../../utils/httpError.js";
import { signSession, type Role } from "../../utils/jwt.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { parse } from "../../utils/validate.js";

export const authRouter = Router();

// Slow down password guessing: 20 attempts per 15 minutes per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts, try again in a few minutes" },
});

const email = z.string().trim().toLowerCase().email("Enter a valid email").max(254);

const signupSchema = z.object({
  displayName: z.string().trim().min(1, "Name is required").max(60),
  email,
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(128),
});

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  password_hash: string;
}

const isOwnerEmail = (e: string) => e.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();

const toUser = (u: UserRow) => ({
  id: u.id,
  email: u.email,
  displayName: u.display_name,
  role: u.role,
  // Lets the frontend explain why the owner tools are missing. Never reveals ADMIN_EMAIL itself.
  ownerEmailMatches: isOwnerEmail(u.email),
});

/**
 * If this is the ADMIN_EMAIL account and it isn't the owner yet, promote it now,
 * so a server restart isn't needed after signing up or changing ADMIN_EMAIL.
 */
async function withOwnerRole(u: UserRow): Promise<UserRow> {
  if (u.role === "admin" || !isOwnerEmail(u.email)) return u;
  await syncOwnerRole();
  return { ...u, role: "admin" };
}

authRouter.post("/signup", authLimiter, async (req, res) => {
  const input = parse(signupSchema, req.body);
  const hash = await hashPassword(input.password);

  // New accounts are always regular users. The owner account comes from ADMIN_EMAIL.
  const { rows } = await query<UserRow>(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, $3, 'user')
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email, display_name, role, password_hash`,
    [input.email, hash, input.displayName],
  );
  if (!rows[0]) throw conflict("An account with that email already exists");
  const user = await withOwnerRole(rows[0]);

  res.cookie(SESSION_COOKIE, signSession({ sub: user.id, role: user.role }), sessionCookieOptions);
  res.status(201).json({ user: toUser(user) });
});

authRouter.post("/login", authLimiter, async (req, res) => {
  const input = parse(loginSchema, req.body);
  const { rows } = await query<UserRow>(
    "SELECT id, email, display_name, role, password_hash FROM users WHERE email = $1",
    [input.email],
  );
  // Same message for unknown email and wrong password, so emails can't be probed.
  if (!rows[0] || !(await verifyPassword(input.password, rows[0].password_hash))) {
    throw unauthorized("Wrong email or password");
  }
  const user = await withOwnerRole(rows[0]);

  res.cookie(SESSION_COOKIE, signSession({ sub: user.id, role: user.role }), sessionCookieOptions);
  res.json({ user: toUser(user) });
});

authRouter.post("/logout", (_req, res) => {
  const { maxAge: _maxAge, ...clearOptions } = sessionCookieOptions;
  res.clearCookie(SESSION_COOKIE, clearOptions);
  res.status(204).end();
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const { rows } = await query<UserRow>(
    "SELECT id, email, display_name, role, password_hash FROM users WHERE id = $1",
    [req.session!.sub],
  );
  if (!rows[0]) throw unauthorized("Account no longer exists");
  res.json({ user: toUser(await withOwnerRole(rows[0])) });
});
