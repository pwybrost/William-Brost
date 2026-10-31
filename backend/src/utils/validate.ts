import { z } from "zod";
import { badRequest } from "./httpError.js";

/** Parses `data` with `schema`, throwing a 400 with field errors on failure. */
export function parse<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw badRequest("Invalid input", result.error.flatten().fieldErrors);
  }
  return result.data;
}

export const uuidParam = z.object({ id: z.string().uuid() });

/** http(s) URLs only, so stored links can't become `javascript:` XSS vectors. */
export const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .url("Must be a valid URL")
  .refine((u) => /^https?:\/\//i.test(u), "URL must start with http:// or https://");

/** Same as httpUrl but also accepts an empty string (field left blank). */
export const optionalHttpUrl = z.union([z.literal(""), httpUrl]);

export const linkSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(60),
  url: httpUrl,
});
