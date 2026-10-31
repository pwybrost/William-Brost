import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { HttpError } from "../utils/httpError.js";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Route not found" });
}

// Express recognises error handlers by their 4 arguments, so `_next` must stay.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }
  if (err instanceof multer.MulterError) {
    const msg = err.code === "LIMIT_FILE_SIZE" ? "Image is too large" : err.message;
    res.status(400).json({ error: msg });
    return;
  }
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "Malformed JSON body" });
    return;
  }
  // Postgres foreign-key violation, e.g. an image id that doesn't exist.
  if (typeof err === "object" && err !== null && (err as { code?: string }).code === "23503") {
    res.status(400).json({ error: "A referenced item (such as an image) does not exist" });
    return;
  }
  console.error("[error]", err);
  res.status(500).json({ error: "Something went wrong" });
}
