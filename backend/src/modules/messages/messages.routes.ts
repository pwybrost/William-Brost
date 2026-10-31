import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { query } from "../../db/pool.js";
import { requireAdmin } from "../../middleware/auth.js";
import { notFound } from "../../utils/httpError.js";
import { parse, uuidParam } from "../../utils/validate.js";
import { toMessage, type MessageRow } from "../portfolio/portfolio.mappers.js";

/** Contact form: anyone can send, only the owner can read. */
export const messagesRouter = Router();

// 5 messages per hour per IP, to keep spam out of the inbox.
const sendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "You've sent several messages already. Please try again later." },
});

const sendSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  subject: z.string().trim().max(140).default(""),
  body: z.string().trim().min(5, "Message is too short").max(5000),
  // Honeypot: hidden in the form. People leave it empty, bots usually fill it.
  website: z.string().max(200).optional(),
});

messagesRouter.post("/", sendLimiter, async (req, res) => {
  const m = parse(sendSchema, req.body);
  if (!m.website) {
    await query(
      "INSERT INTO messages (name, email, subject, body, user_id) VALUES ($1, $2, $3, $4, $5)",
      [m.name, m.email, m.subject, m.body, req.session?.sub ?? null],
    );
  }
  // Same response either way so bots can't tell they were filtered.
  res.status(201).json({ ok: true });
});

messagesRouter.get("/", requireAdmin, async (_req, res) => {
  const { rows } = await query<MessageRow>(
    "SELECT * FROM messages ORDER BY created_at DESC LIMIT 500",
  );
  res.json({ messages: rows.map(toMessage), unread: rows.filter((r) => !r.is_read).length });
});

messagesRouter.get("/unread-count", requireAdmin, async (_req, res) => {
  const { rows } = await query<{ count: string }>(
    "SELECT count(*)::text AS count FROM messages WHERE NOT is_read",
  );
  res.json({ unread: Number(rows[0].count) });
});

messagesRouter.patch("/:id", requireAdmin, async (req, res) => {
  const { id } = parse(uuidParam, req.params);
  const { isRead } = parse(z.object({ isRead: z.boolean() }), req.body);
  const { rows } = await query<MessageRow>(
    "UPDATE messages SET is_read = $1 WHERE id = $2 RETURNING *",
    [isRead, id],
  );
  if (!rows[0]) throw notFound("Message not found");
  res.json({ message: toMessage(rows[0]) });
});

messagesRouter.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = parse(uuidParam, req.params);
  const { rowCount } = await query("DELETE FROM messages WHERE id = $1", [id]);
  if (!rowCount) throw notFound("Message not found");
  res.status(204).end();
});
