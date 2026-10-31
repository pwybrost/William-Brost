import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { runMigrations } from "./db/migrate.js";
import { pool } from "./db/pool.js";
import { ensureAdmin } from "./db/seedAdmin.js";
import { cleanupOrphanMedia } from "./modules/media/media.service.js";

async function main() {
  await runMigrations();
  await ensureAdmin();
  await cleanupOrphanMedia();

  const server = createApp().listen(env.PORT, () => {
    console.log(`[api] William Brost API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`[api] ${signal} received, shutting down`);
    server.close(() => {
      pool.end().finally(() => process.exit(0));
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("[api] failed to start:", err);
  process.exit(1);
});
