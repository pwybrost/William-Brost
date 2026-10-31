import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { loadSession } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { mediaRouter } from "./modules/media/media.routes.js";
import { portfolioRouter } from "./modules/portfolio/portfolio.routes.js";
import { profileRouter } from "./modules/portfolio/profile.routes.js";
import { projectsRouter } from "./modules/portfolio/projects.routes.js";
import { timelineRouter } from "./modules/portfolio/timeline.routes.js";

export function createApp() {
  const app = express();

  if (env.TRUST_PROXY) app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true, // allow the session cookie
    }),
  );
  app.use(express.json({ limit: "200kb" }));
  app.use(cookieParser());
  app.use(loadSession);

  app.get("/api/health", async (_req, res) => {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/media", mediaRouter);
  app.use("/api/portfolio", portfolioRouter);
  app.use("/api", profileRouter); // PUT /api/profile, PUT /api/social-links
  app.use("/api/projects", projectsRouter);
  app.use("/api/timeline", timelineRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
