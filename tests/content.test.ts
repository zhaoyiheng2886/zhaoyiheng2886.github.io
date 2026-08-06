import { describe, expect, it } from "vitest";

import {
  buildTimeline,
  filterPostsByKind,
  getPublishedPosts,
  getTagCounts,
  sortByDateDesc,
} from "../src/lib/content";

describe("content helpers", () => {
  it("filters posts by kind", () => {
    const posts = [
      { data: { kind: "tech" as const, tags: ["AIGC", "Diffusion"] } },
      { data: { kind: "memory" as const, tags: ["求职"] } },
    ];

    expect(filterPostsByKind(posts, "tech")).toHaveLength(1);
  });

  it("counts unique normalized tags within and across posts", () => {
    const posts = [
      { data: { kind: "tech" as const, tags: [" AIGC ", "aigc", "Diffusion"] } },
      { data: { kind: "memory" as const, tags: ["求职", " AIGC "] } },
    ];

    expect(getTagCounts(posts)).toEqual(new Map([["aigc", 2], ["diffusion", 1], ["求职", 1]]));
  });

  it("orders a mixed timeline newest first with stream labels and hrefs", () => {
    const entries = buildTimeline(
      [{ id: "post", data: { title: "Post", description: "D", publishDate: new Date("2026-01-01"), kind: "tech" as const } }],
      [{ id: "paper", data: { title: "Paper", description: "D", date: new Date("2026-02-01") } }],
      [{ id: "moment", data: { title: "Moment", description: "D", date: new Date("2025-01-01") } }],
    );

    expect(entries).toMatchObject([
      { id: "paper", href: "/research/#paper", kind: "RESEARCH" },
      { id: "post", href: "/tech/post/", kind: "TECH" },
      { id: "moment", href: "/memory/#moment", kind: "MEMORY" },
    ]);
  });

  it("sorts equal dates by id so output is deterministic", () => {
    const entries = [
      { id: "z", date: new Date("2026-01-01") },
      { id: "a", date: new Date("2026-01-01") },
    ];

    expect(sortByDateDesc(entries).map((entry) => entry.id)).toEqual(["a", "z"]);
  });

  it("uses code-unit id ordering for date ties", () => {
    const entries = [
      { id: "a", date: new Date("2026-01-01") },
      { id: "A", date: new Date("2026-01-01") },
    ];

    expect(sortByDateDesc(entries).map((entry) => entry.id)).toEqual(["A", "a"]);
  });

  it("removes drafts before feeds and search consumers receive posts", () => {
    const posts = [
      { id: "published", data: { draft: false } },
      { id: "draft", data: { draft: true } },
    ];

    expect(getPublishedPosts(posts).map((post) => post.id)).toEqual(["published"]);
  });
});
