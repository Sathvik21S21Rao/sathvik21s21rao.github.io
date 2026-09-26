import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string().refine((t) => !t.includes("`"), {
      message:
        "title is plain text, not markdown — backticks will render literally, not as code formatting",
    }),
    date: z.coerce.date(),
    blurb: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    updated: z.coerce.date().optional(),
    cover: z
      .object({
        src: z.string(),
        srcDark: z.string().optional(),
        alt: z.string(),
      })
      .optional(),
    // Side track: an optional tangent branching off another post. One level
    // deep only — see the ponytail note in wikilinks.ts, which validates it.
    parent: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    name: z.string(),
    blurb: z.string(),
    order: z.number().default(0),
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    year: z.number().optional(),
    image: z.object({ src: z.string(), alt: z.string() }).optional(),
  }),
});

export const collections = { blog, projects };
