import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import { postSchema, researchSchema } from "./content/schema";

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: postSchema,
});

const research = defineCollection({
  loader: glob({ base: "./src/content/research", pattern: "**/*.{md,mdx}" }),
  schema: researchSchema,
});

export const collections = { posts, research };
