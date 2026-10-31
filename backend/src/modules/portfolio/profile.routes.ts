import { Router } from "express";
import { z } from "zod";
import { withTransaction } from "../../db/pool.js";
import { requireAdmin } from "../../middleware/auth.js";
import { linkSchema, optionalHttpUrl, parse } from "../../utils/validate.js";
import { deleteMediaIfUnused } from "../media/media.service.js";
import { toLink, toProfile, type LinkRow, type ProfileRow } from "./portfolio.mappers.js";

export const profileRouter = Router();

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(80),
  headline: z.string().trim().max(140).default(""),
  bio: z.string().trim().max(5000).default(""),
  location: z.string().trim().max(80).default(""),
  contactEmail: z.union([z.literal(""), z.string().trim().email()]).default(""),
  resumeUrl: optionalHttpUrl.default(""),
  skills: z.array(z.string().trim().min(1).max(40)).max(60).default([]),
  availability: z.string().trim().max(60).default(""), // e.g. "Open to internships"
  avatarMediaId: z.string().uuid().nullable().default(null),
  coverMediaId: z.string().uuid().nullable().default(null),
});

profileRouter.put("/profile", requireAdmin, async (req, res) => {
  const p = parse(profileSchema, req.body);

  const updated = await withTransaction(async (db) => {
    const before = await db.query<ProfileRow>("SELECT * FROM profile WHERE id = 1 FOR UPDATE");
    const { rows } = await db.query<ProfileRow>(
      `UPDATE profile SET
         full_name = $1, headline = $2, bio = $3, location = $4, contact_email = $5,
         resume_url = $6, skills = $7, avatar_media_id = $8, cover_media_id = $9,
         availability = $10, updated_at = now()
       WHERE id = 1
       RETURNING *`,
      [
        p.fullName,
        p.headline,
        p.bio,
        p.location,
        p.contactEmail,
        p.resumeUrl,
        [...new Set(p.skills)],
        p.avatarMediaId,
        p.coverMediaId,
        p.availability,
      ],
    );
    // Drop replaced pictures so old uploads don't pile up in the database.
    const old = before.rows[0];
    await deleteMediaIfUnused(db, [old.avatar_media_id, old.cover_media_id]);
    return rows[0];
  });

  res.json({ profile: toProfile(updated) });
});

const socialLinksSchema = z.object({ links: z.array(linkSchema).max(30) });

/** Replaces the whole list of account links (GitHub, LinkedIn, ...) in the given order. */
profileRouter.put("/social-links", requireAdmin, async (req, res) => {
  const { links } = parse(socialLinksSchema, req.body);

  const rows = await withTransaction(async (db) => {
    await db.query("DELETE FROM social_links");
    const out: LinkRow[] = [];
    for (const [i, l] of links.entries()) {
      const r = await db.query<LinkRow>(
        "INSERT INTO social_links (label, url, sort_order) VALUES ($1, $2, $3) RETURNING *",
        [l.label, l.url, i],
      );
      out.push(r.rows[0]);
    }
    return out;
  });

  res.json({ socialLinks: rows.map(toLink) });
});
