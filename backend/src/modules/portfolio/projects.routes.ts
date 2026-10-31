import { Router } from "express";
import type { PoolClient } from "pg";
import { z } from "zod";
import { query, withTransaction } from "../../db/pool.js";
import { isAdminRequest, requireAdmin } from "../../middleware/auth.js";
import { notFound } from "../../utils/httpError.js";
import { linkSchema, parse, uuidParam } from "../../utils/validate.js";
import { deleteMediaIfUnused } from "../media/media.service.js";
import {
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  toProject,
  type ProjectImageRow,
  type ProjectLinkRow,
  type ProjectRow,
} from "./portfolio.mappers.js";

export const projectsRouter = Router();

const imageSchema = z.object({
  mediaId: z.string().uuid(),
  caption: z.string().trim().max(200).default(""),
});

const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  summary: z.string().trim().max(280).default(""),
  description: z.string().trim().max(20000).default(""),
  techStack: z.array(z.string().trim().min(1).max(40)).max(40).default([]),
  coverMediaId: z.string().uuid().nullable().default(null),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(-10000).max(10000).default(0),
  category: z.enum(PROJECT_CATEGORIES).default("website"),
  role: z.string().trim().max(80).default(""),
  year: z.string().trim().max(20).default(""),
  status: z.enum(PROJECT_STATUSES).default("completed"),
  published: z.boolean().default(true),
  // Case-study sections (all optional).
  problem: z.string().trim().max(10000).default(""),
  process: z.string().trim().max(10000).default(""),
  outcome: z.string().trim().max(10000).default(""),
  // Optional: a project can have zero links / images, or as many as needed.
  links: z.array(linkSchema).max(20).default([]),
  images: z.array(imageSchema).max(40).default([]),
});

type ProjectInput = z.infer<typeof projectSchema>;

async function replaceLinks(db: PoolClient, projectId: string, links: ProjectInput["links"]) {
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

/** Replaces the gallery; returns the new rows and the media ids that were dropped. */
async function replaceImages(db: PoolClient, projectId: string, images: ProjectInput["images"]) {
  const old = await db.query<ProjectImageRow>(
    "DELETE FROM project_images WHERE project_id = $1 RETURNING *",
    [projectId],
  );
  const rows: ProjectImageRow[] = [];
  for (const [i, img] of images.entries()) {
    const r = await db.query<ProjectImageRow>(
      `INSERT INTO project_images (project_id, media_id, caption, sort_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [projectId, img.mediaId, img.caption, i],
    );
    rows.push(r.rows[0]);
  }
  return { rows, removedMediaIds: old.rows.map((r) => r.media_id) };
}

const columnValues = (p: ProjectInput) => [
  p.title,
  p.summary,
  p.description,
  p.techStack,
  p.coverMediaId,
  p.featured,
  p.sortOrder,
  p.category,
  p.role,
  p.year,
  p.status,
  p.published,
  p.problem,
  p.process,
  p.outcome,
];

projectsRouter.get("/:id", async (req, res) => {
  const { id } = parse(uuidParam, req.params);
  const project = await query<ProjectRow>("SELECT * FROM projects WHERE id = $1", [id]);
  const row = project.rows[0];
  // Drafts look like they don't exist to everyone except the owner.
  if (!row || (!row.published && !(await isAdminRequest(req)))) throw notFound("Project not found");

  const [links, images] = await Promise.all([
    query<ProjectLinkRow>("SELECT * FROM project_links WHERE project_id = $1 ORDER BY sort_order", [id]),
    query<ProjectImageRow>("SELECT * FROM project_images WHERE project_id = $1 ORDER BY sort_order", [id]),
  ]);
  res.json({ project: toProject(row, links.rows, images.rows) });
});

projectsRouter.post("/", requireAdmin, async (req, res) => {
  const p = parse(projectSchema, req.body);
  const project = await withTransaction(async (db) => {
    const { rows } = await db.query<ProjectRow>(
      `INSERT INTO projects
         (title, summary, description, tech_stack, cover_media_id, featured, sort_order,
          category, role, year, status, published, problem, process, outcome)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      columnValues(p),
    );
    const links = await replaceLinks(db, rows[0].id, p.links);
    const images = await replaceImages(db, rows[0].id, p.images);
    return toProject(rows[0], links, images.rows);
  });
  res.status(201).json({ project });
});

projectsRouter.put("/:id", requireAdmin, async (req, res) => {
  const { id } = parse(uuidParam, req.params);
  const p = parse(projectSchema, req.body);

  const project = await withTransaction(async (db) => {
    const before = await db.query<ProjectRow>("SELECT * FROM projects WHERE id = $1 FOR UPDATE", [id]);
    if (!before.rows[0]) throw notFound("Project not found");

    const { rows } = await db.query<ProjectRow>(
      `UPDATE projects SET
         title = $1, summary = $2, description = $3, tech_stack = $4, cover_media_id = $5,
         featured = $6, sort_order = $7, category = $8, role = $9, year = $10, status = $11,
         published = $12, problem = $13, process = $14, outcome = $15, updated_at = now()
       WHERE id = $16 RETURNING *`,
      [...columnValues(p), id],
    );
    const links = await replaceLinks(db, id, p.links);
    const images = await replaceImages(db, id, p.images);
    await deleteMediaIfUnused(db, [before.rows[0].cover_media_id, ...images.removedMediaIds]);
    return toProject(rows[0], links, images.rows);
  });

  res.json({ project });
});

projectsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = parse(uuidParam, req.params);
  await withTransaction(async (db) => {
    const gallery = await db.query<ProjectImageRow>(
      "SELECT * FROM project_images WHERE project_id = $1",
      [id],
    );
    const { rows } = await db.query<ProjectRow>("DELETE FROM projects WHERE id = $1 RETURNING *", [id]);
    if (!rows[0]) throw notFound("Project not found");
    await deleteMediaIfUnused(db, [rows[0].cover_media_id, ...gallery.rows.map((g) => g.media_id)]);
  });
  res.status(204).end();
});
