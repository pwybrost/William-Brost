import { runMigrations } from "../db/migrate.js";
import { pool } from "../db/pool.js";

runMigrations()
  .then(() => console.log("[db] migrations complete"))
  .catch((err) => {
    console.error("[db] migration failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
