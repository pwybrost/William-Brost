import { Router } from "express";
import { query } from "../../db/pool.js";
import { isAdminRequest } from "../../middleware/auth.js";
import {
  toLink,
  toProduct,
  toProfile,
  toProject,
  toTimeline,
  type LinkRow,
  type ProductRow,
  type ProfileRow,
  type ProjectImageRow,
  type ProjectLinkRow,
  type ProjectRow,
  type TimelineRow,
} from "./portfolio.mappers.js";

export const portfolioRouter = Router();

/**
 * Everything the portfolio page needs, in one request. Public: guests can read it.
 * Draft (unpublished) projects and products are only included for the owner.
 */
portfolioRouter.get("/", async (req, res) => {
  const admin = await isAdminRequest(req);

  const [profile, social, projects, projectLinks, projectImages, timeline, products] = await Promise.all([
    query<ProfileRow>("SELECT * FROM profile WHERE id = 1"),
    query<LinkRow>("SELECT * FROM social_links ORDER BY sort_order, label"),
    query<ProjectRow>(
      `SELECT * FROM projects WHERE published OR $1
       ORDER BY featured DESC, sort_order, created_at DESC`,
      [admin],
    ),
    query<ProjectLinkRow>("SELECT * FROM project_links ORDER BY sort_order"),
    query<ProjectImageRow>("SELECT * FROM project_images ORDER BY sort_order"),
    query<TimelineRow>("SELECT * FROM timeline_entries ORDER BY sort_order, start_date DESC"),
    query<ProductRow>(
      "SELECT * FROM products WHERE published OR $1 ORDER BY sort_order, created_at DESC",
      [admin],
    ),
  ]);

  const entries = timeline.rows.map(toTimeline);
  res.json({
    profile: toProfile(profile.rows[0]),
    socialLinks: social.rows.map(toLink),
    projects: projects.rows.map((p) => toProject(p, projectLinks.rows, projectImages.rows)),
    experience: entries.filter((e) => e.kind === "experience"),
    education: entries.filter((e) => e.kind === "education"),
    achievements: entries.filter((e) => e.kind === "achievement"),
    products: products.rows.map(toProduct),
  });
});
