import { z } from "astro/zod";

export const postSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).max(200),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  kind: z.enum(["tech", "memory"]),
  tags: z.array(z.string().trim().min(1)).default([]),
  series: z.string().trim().min(1).optional(),
  coverImage: z.string().optional(),
  draft: z.boolean().default(false),
  legacyPath: z.string().startsWith("/posts/").optional(),
});

export const researchSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  date: z.coerce.date(),
  authors: z.array(z.string().trim().min(1)),
  venue: z.string().trim().min(1),
  status: z.string().trim().min(1),
  url: z.string().url().optional(),
  pdf: z.string().optional(),
  legacyPath: z.string().startsWith("/publication/").optional(),
});

export const momentSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  date: z.coerce.date(),
  place: z.string().trim().min(1).optional(),
  relatedPost: z.string().optional(),
});

export type PostKind = "tech" | "memory";
