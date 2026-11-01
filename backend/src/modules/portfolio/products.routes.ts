import { Router } from "express";
import { z } from "zod";
import { withTransaction } from "../../db/pool.js";
import { requireAdmin } from "../../middleware/auth.js";
import { notFound } from "../../utils/httpError.js";
import { optionalHttpUrl, parse, uuidParam } from "../../utils/validate.js";
import { deleteMediaIfUnused } from "../media/media.service.js";
import { PRODUCT_STATUSES, toProduct, type ProductRow } from "./portfolio.mappers.js";

/** Products shown under the bio on the home page. Reading happens via GET /api/portfolio. */
export const productsRouter = Router();

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  tagline: z.string().trim().max(280).default(""),
  price: z.string().trim().max(40).default(""), // free text, e.g. "₱1,200" or "Free"
  url: optionalHttpUrl.default(""),
  mediaId: z.string().uuid().nullable().default(null),
  status: z.enum(PRODUCT_STATUSES).default("available"),
  published: z.boolean().default(true),
  sortOrder: z.number().int().min(-10000).max(10000).default(0),
});

type ProductInput = z.infer<typeof productSchema>;

const values = (p: ProductInput) => [
  p.name,
  p.tagline,
  p.price,
  p.url,
  p.mediaId,
  p.status,
  p.published,
  p.sortOrder,
];

productsRouter.post("/", requireAdmin, async (req, res) => {
  const p = parse(productSchema, req.body);
  const product = await withTransaction(async (db) => {
    const { rows } = await db.query<ProductRow>(
      `INSERT INTO products (name, tagline, price, url, media_id, status, published, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      values(p),
    );
    return rows[0];
  });
  res.status(201).json({ product: toProduct(product) });
});

productsRouter.put("/:id", requireAdmin, async (req, res) => {
  const { id } = parse(uuidParam, req.params);
  const p = parse(productSchema, req.body);
  const product = await withTransaction(async (db) => {
    const before = await db.query<ProductRow>("SELECT * FROM products WHERE id = $1 FOR UPDATE", [id]);
    if (!before.rows[0]) throw notFound("Product not found");
    const { rows } = await db.query<ProductRow>(
      `UPDATE products SET name = $1, tagline = $2, price = $3, url = $4, media_id = $5,
         status = $6, published = $7, sort_order = $8
       WHERE id = $9 RETURNING *`,
      [...values(p), id],
    );
    await deleteMediaIfUnused(db, [before.rows[0].media_id]);
    return rows[0];
  });
  res.json({ product: toProduct(product) });
});

productsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = parse(uuidParam, req.params);
  await withTransaction(async (db) => {
    const { rows } = await db.query<ProductRow>("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
    if (!rows[0]) throw notFound("Product not found");
    await deleteMediaIfUnused(db, [rows[0].media_id]);
  });
  res.status(204).end();
});
