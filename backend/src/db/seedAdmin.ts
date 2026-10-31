import { env } from "../config/env.js";
import { query } from "./pool.js";
import { hashPassword } from "../utils/password.js";

/** Promotes the ADMIN_EMAIL account and demotes every other admin. Returns true if the account exists. */
export async function syncOwnerRole(): Promise<boolean> {
  const email = env.ADMIN_EMAIL.toLowerCase();
  const promoted = await query(`UPDATE users SET role = 'admin' WHERE lower(email) = $1 RETURNING id`, [email]);
  // Only one owner: demote any other admin (e.g. the old example account).
  await query(`UPDATE users SET role = 'user' WHERE role = 'admin' AND lower(email) <> $1`, [email]);
  return Boolean(promoted.rowCount);
}

/**
 * Makes ADMIN_EMAIL the one and only owner (admin) account.
 *
 * - If an account with that email already exists (e.g. you signed up on the site),
 *   it is promoted to admin and keeps its current password.
 * - If it doesn't exist and ADMIN_PASSWORD is set, the account is created. Otherwise it becomes
 *   the owner as soon as someone signs up / signs in with that email (see auth.routes.ts).
 * - Every other account is set back to a regular user.
 */
export async function ensureAdmin() {
  const email = env.ADMIN_EMAIL.toLowerCase();
  console.log(`[admin] ADMIN_EMAIL = ${email}`);
  const exists = await syncOwnerRole();

  if (!exists) {
    if (env.ADMIN_PASSWORD) {
      await query(
        `INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, 'admin')`,
        [email, await hashPassword(env.ADMIN_PASSWORD), env.ADMIN_NAME],
      );
      console.log(`[admin] created owner account: ${email}`);
    } else {
      console.warn(
        `[admin] no account for ${email} yet. Sign up with that email on the site and it becomes the owner.`,
      );
    }
  } else {
    console.log(`[admin] owner account ready: ${email}`);
  }
}
