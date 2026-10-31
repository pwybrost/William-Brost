import { Router } from "express";
import multer from "multer";
import { env } from "../../config/env.js";
import { query } from "../../db/pool.js";
import { requireAdmin } from "../../middleware/auth.js";
import { badRequest, notFound } from "../../utils/httpError.js";
import { parse, uuidParam } from "../../utils/validate.js";

export const mediaRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 1 },
});

/**
 * Detects the image type from the file's first bytes instead of trusting the
 * browser-supplied mimetype. SVG is deliberately not allowed (it can carry scripts).
 */
function sniffImageType(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "image/png";
  if (buf.toString("ascii", 0, 6) === "GIF87a" || buf.toString("ascii", 0, 6) === "GIF89a")
    return "image/gif";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP")
    return "image/webp";
  // PDFs are allowed for the resume.
  if (buf.toString("ascii", 0, 5) === "%PDF-") return "application/pdf";
  return null;
}

mediaRouter.post("/", requireAdmin, upload.single("file"), async (req, res) => {
  if (!req.file) throw badRequest("Attach a file in the `file` field");
  const mime = sniffImageType(req.file.buffer);
  if (!mime) throw badRequest("Only JPEG, PNG, GIF, WebP images and PDF files are allowed");

  const { rows } = await query<{ id: string }>(
    "INSERT INTO media (mime_type, size_bytes, data) VALUES ($1, $2, $3) RETURNING id",
    [mime, req.file.size, req.file.buffer],
  );
  res.status(201).json({ id: rows[0].id });
});

mediaRouter.get("/:id", async (req, res) => {
  const { id } = parse(uuidParam, req.params);
  const { rows } = await query<{ mime_type: string; data: Buffer }>(
    "SELECT mime_type, data FROM media WHERE id = $1",
    [id],
  );
  if (!rows[0]) throw notFound("File not found");

  // Ids are never reused, so browsers can cache them forever.
  res.setHeader("Content-Type", rows[0].mime_type);
  if (rows[0].mime_type === "application/pdf") {
    const disposition = req.query.download === "1" ? "attachment" : "inline";
    res.setHeader("Content-Disposition", `${disposition}; filename="William-Brost-Resume.pdf"`);
  }
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.send(rows[0].data);
});
