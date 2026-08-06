import { describe, expect, it } from "vitest";

import { momentSchema, postSchema, researchSchema } from "../src/content/schema";

describe("content schemas", () => {
  it("rejects a post without a description", () => {
    expect(() => postSchema.parse({ title: "x", publishDate: new Date(), kind: "tech" })).toThrow();
  });

  it("coerces dates and normalizes post strings and tags", () => {
    const post = postSchema.parse({
      title: "  A post  ",
      description: "  A description  ",
      publishDate: "2026-01-01",
      kind: "tech",
      tags: ["  AIGC  "],
    });

    expect(post).toMatchObject({
      title: "A post",
      description: "A description",
      kind: "tech",
      tags: ["AIGC"],
      draft: false,
    });
    expect(post.publishDate).toBeInstanceOf(Date);
  });

  it("requires research and moment fields while accepting explicit legacy paths", () => {
    expect(() => researchSchema.parse({ title: "Paper" })).toThrow();
    expect(() => momentSchema.parse({ title: "Moment" })).toThrow();
    expect(
      researchSchema.parse({
        title: "Paper",
        description: "Description",
        date: "2026-02-01",
        authors: ["Author"],
        venue: "Venue",
        status: "Published",
        legacyPath: "/publication/paper/",
      }).legacyPath,
    ).toBe("/publication/paper/");
  });
});
