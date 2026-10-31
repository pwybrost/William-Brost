import { Router } from "express";
import { query } from "../../db/pool.js";
import {
  toLink,
  toProfile,
  toProject,
  toTimeline,
  type LinkRow,
  type ProfileRow,
  type ProjectLinkRow,
  type ProjectRow,
  type TimelineRow,
} from "./portfolio.mappers.js";

export const portfolioRouter = Router();

/** Everything the portfolio page needs, in one request. Public: guests can read it. */
portfolioRouter.get("/", async (_req, res) => {
  const [profile, social, projects, projectLinks, timeline] = await Promise.all([
    query<ProfileRow>("SELECT * FROM profile WHERE id = 1"),
    query<LinkRow>("SELECT * FROM social_links ORDER BY sort_order, label"),
    query<ProjectRow>("SELECT * FROM projects ORDER BY featured DESC, sort_order, created_at DESC"),
    query<ProjectLinkRow>("SELECT * FROM project_links ORDER BY sort_order"),
    query<TimelineRow>("SELECT * FROM timeline_entries ORDER BY sort_order, start_date DESC"),
  ]);

  const entries = timeline.rows.map(toTimeline);
  res.json({
    profile: toProfile(profile.rows[0]),
    socialLinks: social.rows.map(toLink),
    projects: projects.rows.map((p) => toProject(p, projectLinks.rows)),
    experience: entries.filter((e) => e.kind === "experience"),
    education: entries.filter((e) => e.kind === "education"),
  });
});
