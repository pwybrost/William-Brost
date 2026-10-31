import { env } from "../config/env.js";
import { query } from "./pool.js";
import { hashPassword } from "../utils/password.js";

/**
 * Makes ADMIN_EMAIL the one and only owner (admin) account.
 *
 * - If an account with that email already exists (e.g. you signed up on the site),
 *   it is promoted to admin and keeps its current password.
 * - If it doesn't exist and ADMIN_PASSWORD is set, the account is created.
 * - Every other account is set back to a regular user.
 */
export async function ensureAdmin() {
  const email = env.ADMIN_EMAIL.toLowerCase();

  const promoted = await query(`UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id`, [email]);

  if (!promoted.rowCount) {
    if (env.ADMIN_PASSWORD) {
      await query(
        `INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, 'admin')`,
        [email, await hashPassword(env.ADMIN_PASSWORD), env.ADMIN_NAME],
      );
      console.log(`[admin] created owner account: ${email}`);
    } else {
      console.warn(
        `[admin] no account for ${email} yet. Sign up with that email on the site, then restart the server ` +
          `(or set ADMIN_PASSWORD to have it created automatically).`,
      );
    }
  } else {
    console.log(`[admin] owner account ready: ${email}`);
  }

  // Only one owner: demote any other admin (e.g. the old example account).
  await query(`UPDATE users SET role = 'user' WHERE role = 'admin' AND email <> $1`, [email]);
}
