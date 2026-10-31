import "dotenv/config";
import { z } from "zod";

const bool = z
  .enum(["true", "false"])
  .default("false")
  .transform((v) => v === "true");

/** `KEY=` in a .env file gives an empty string; treat that as "not set". */
const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required (your Neon connection string)"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  SESSION_DAYS: z.coerce.number().int().positive().default(7),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  COOKIE_SECURE: bool,
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
  TRUST_PROXY: bool,
  // The owner account. Defaults to William's email so the site works even if .env omits it.
  ADMIN_EMAIL: z.preprocess(emptyToUndefined, z.string().email().default("pwybrost@addu.edu.ph")),
  // Only used to CREATE the owner account if it doesn't exist yet. An existing account keeps its password.
  ADMIN_PASSWORD: z.preprocess(
    emptyToUndefined,
    z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters").optional(),
  ),
  ADMIN_NAME: z.string().default("William Brost"),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(5),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean),
  isProd: parsed.data.NODE_ENV === "production",
};
