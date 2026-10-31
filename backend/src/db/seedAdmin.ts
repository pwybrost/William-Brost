import { env } from "../config/env.js";
import { query } from "./pool.js";
import { hashPassword } from "../utils/password.js";

/**
 * Makes sure the owner account from ADMIN_EMAIL / ADMIN_PASSWORD exists with the admin role.
 * If someone registered that email as a normal user first, the owner takes it back here.
 */
export async function ensureAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.warn("[admin] ADMIN_EMAIL / ADMIN_PASSWORD not set: no owner account, editing is disabled.");
    return;
  }

  const email = env.ADMIN_EMAIL.toLowerCase();
  const hash = await hashPassword(env.ADMIN_PASSWORD);

  await query(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email)
     DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'`,
    [email, hash, env.ADMIN_NAME],
  );

  // Only one owner: demote any other admin (e.g. after ADMIN_EMAIL changed).
  await query(`UPDATE users SET role = 'user' WHERE role = 'admin' AND email <> $1`, [email]);

  console.log(`[admin] owner account ready: ${email}`);
}
