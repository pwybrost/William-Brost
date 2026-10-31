import { Router } from "express";
import { z } from "zod";
import { query } from "../../db/pool.js";
import { requireAdmin } from "../../middleware/auth.js";
import { notFound } from "../../utils/httpError.js";
import { parse, uuidParam } from "../../utils/validate.js";
import { toTimeline, type TimelineRow } from "./portfolio.mappers.js";

/** Work experience and education entries. */
export const timelineRouter = Router();

const entrySchema = z.object({
  kind: z.enum(["experience", "education"]),
  title: z.string().trim().min(1, "Title is required").max(120),
  organization: z.string().trim().max(120).default(""),
  location: z.string().trim().max(80).default(""),
  startDate: z.string().trim().max(30).default(""), // free text, e.g. "Jun 2025"
  endDate: z.string().trim().max(30).default(""), // e.g. "Present"
  description: z.string().trim().max(5000).default(""),
  sortOrder: z.number().int().min(-10000).max(10000).default(0),
});

const values = (e: z.infer<typeof entrySchema>) => [
  e.kind,
  e.title,
  e.organization,
  e.location,
  e.startDate,
  e.endDate,
  e.description,
  e.sortOrder,
];

timelineRouter.post("/", requireAdmin, async (req, res) => {
  const e = parse(entrySchema, req.body);
  const { rows } = await query<TimelineRow>(
    `INSERT INTO timeline_entries
       (kind, title, organization, location, start_date, end_date, description, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    values(e),
  );
  res.status(201).json({ entry: toTimeline(rows[0]) });
});

timelineRouter.put("/:id", requireAdmin, async (req, res) => {
  const { id } = parse(uuidParam, req.params);
  const e = parse(entrySchema, req.body);
  const { rows } = await query<TimelineRow>(
    `UPDATE timeline_entries SET
       kind = $1, title = $2, organization = $3, location = $4,
       start_date = $5, end_date = $6, description = $7, sort_order = $8
     WHERE id = $9 RETURNING *`,
    [...values(e), id],
  );
  if (!rows[0]) throw notFound("Entry not found");
  res.json({ entry: toTimeline(rows[0]) });
});

timelineRouter.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = parse(uuidParam, req.params);
  const { rowCount } = await query("DELETE FROM timeline_entries WHERE id = $1", [id]);
  if (!rowCount) throw notFound("Entry not found");
  res.status(204).end();
});
