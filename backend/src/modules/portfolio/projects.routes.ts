import { Router } from "express";
import type pg from "pg";
import { z } from "zod";
import { query, withTransaction } from "../../db/pool.js";
import { requireAdmin } from "../../middleware/auth.js";
import { notFound } from "../../utils/httpError.js";
import { linkSchema, parse, uuidParam } from "../../utils/validate.js";
import { deleteMediaIfUnused } from "../media/media.service.js";
import { toProject, type ProjectLinkRow, type ProjectRow } from "./portfolio.mappers.js";

export const projectsRouter = Router();

const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  summary: z.string().trim().max(280).default(""),
  description: z.string().trim().max(20000).default(""),
  techStack: z.array(z.string().trim().min(1).max(40)).max(40).default([]),
  coverMediaId: z.string().uuid().nullable().default(null),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(-10000).max(10000).default(0),
  // Optional: a project can have zero links, or as many as needed.
  links: z.array(linkSchema).max(20).default([]),
});

type ProjectInput = z.infer<typeof projectSchema>;

async function replaceLinks(db: pg.PoolClient, projectId: string, links: ProjectInput["links"]) {
  await db.query("DELETE FROM project_links WHERE project_id = $1", [projectId]);
  const rows: ProjectLinkRow[] = [];
  for (const [i, l] of links.entries()) {
    const r = await db.query<ProjectLinkRow>(
      `INSERT INTO project_links (project_id, label, url, sort_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [projectId, l.label, l.url, i],
    );
    rows.push(r.rows[0]);
  }
  return rows;
}

projectsRouter.get("/:id", async (req, res) => {
  const { id } = parse(uuidParam, req.params);
  const project = await query<ProjectRow>("SELECT * FROM projects WHERE id = $1", [id]);
  if (!project.rows[0]) throw notFound("Project not found");
  const links = await query<ProjectLinkRow>(
    "SELECT * FROM project_links WHERE project_id = $1 ORDER BY sort_order",
    [id],
  );
  res.json({ project: toProject(project.rows[0], links.rows) });
});

projectsRouter.post("/", requireAdmin, async (req, res) => {
  const p = parse(projectSchema, req.body);
  const project = await withTransaction(async (db) => {
    const { rows } = await db.query<ProjectRow>(
      `INSERT INTO projects (title, summary, description, tech_stack, cover_media_id, featured, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [p.title, p.summary, p.description, p.techStack, p.coverMediaId, p.featured, p.sortOrder],
    );
    const links = await replaceLinks(db, rows[0].id, p.links);
    return toProject(rows[0], links);
  });
  res.status(201).json({ project });
});

projectsRouter.put("/:id", requireAdmin, async (req, res) => {
  const { id } = parse(uuidParam, req.params);
  const p = parse(projectSchema, req.body);

  const project = await withTransaction(async (db) => {
    const before = await db.query<ProjectRow>("SELECT * FROM projects WHERE id = $1 FOR UPDATE", [
      id,
    ]);
    if (!before.rows[0]) throw notFound("Project not found");

    const { rows } = await db.query<ProjectRow>(
      `UPDATE projects SET
         title = $2, summary = $3, description = $4, tech_stack = $5,
         cover_media_id = $6, featured = $7, sort_order = $8, updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id, p.title, p.summary, p.description, p.techStack, p.coverMediaId, p.featured, p.sortOrder],
    );
    const links = await replaceLinks(db, id, p.links);
    await deleteMediaIfUnused(db, [before.rows[0].cover_media_id]);
    return toProject(rows[0], links);
  });

  res.json({ project });
});

projectsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = parse(uuidParam, req.params);
  await withTransaction(async (db) => {
    const { rows } = await db.query<ProjectRow>("DELETE FROM projects WHERE id = $1 RETURNING *", [
      id,
    ]);
    if (!rows[0]) throw notFound("Project not found");
    await deleteMediaIfUnused(db, [rows[0].cover_media_id]);
  });
  res.status(204).end();
});
