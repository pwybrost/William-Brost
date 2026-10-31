import { pool } from "./pool.js";
import { migrations } from "./migrations.js";

/** Applies any migrations that haven't run yet. Safe to call on every startup. */
export async function runMigrations() {
  const client = await pool.connect();
  try {
    // Advisory lock so two containers starting at once don't migrate concurrently.
    await client.query("SELECT pg_advisory_lock(727274)");
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id         TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const { rows } = await client.query<{ id: string }>("SELECT id FROM schema_migrations");
    const applied = new Set(rows.map((r) => r.id));

    for (const m of migrations) {
      if (applied.has(m.id)) continue;
      console.log(`[db] applying migration ${m.id}`);
      await client.query("BEGIN");
      try {
        await client.query(m.sql);
        await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [m.id]);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(727274)").catch(() => {});
    client.release();
  }
}
