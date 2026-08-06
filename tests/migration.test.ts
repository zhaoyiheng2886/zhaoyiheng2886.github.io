import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const postsDir = path.resolve("src/content/posts");
const researchDir = path.resolve("src/content/research");
const publicDir = path.resolve("public");

const markdownFiles = (directory: string) =>
  fs.readdirSync(directory).filter((name) => name.endsWith(".md")).sort();

describe("Jekyll content migration", () => {
  it("migrates exactly twelve posts and two research entries", () => {
    expect(markdownFiles(postsDir)).toHaveLength(12);
    expect(markdownFiles(researchDir)).toHaveLength(2);
  });

  it("preserves every old post permalink and classifies only internship diaries as memories", () => {
    const posts = markdownFiles(postsDir).map((name) => ({
      name,
      data: matter.read(path.join(postsDir, name)).data,
    }));

    const legacyPaths = posts.map(({ data }) => data.legacyPath);
    expect(legacyPaths.every((value) => /^\/posts\/2026\/(03|04)\/.+\/$/.test(value))).toBe(true);
    expect(new Set(legacyPaths).size).toBe(12);
    expect(new Set(posts.filter(({ data }) => data.kind === "memory").map(({ name }) => name))).toEqual(new Set([
      "找暑期实习-day21.md",
      "找暑期实习-day22.md",
      "找暑期实习-day23-24.md",
      "开帖记录一下找暑期实习-day20.md",
    ]));
    expect(posts.filter(({ data }) => data.kind === "tech")).toHaveLength(8);
  });

  it("keeps migrated prose and gives image references accessible alt text", () => {
    for (const name of markdownFiles(postsDir)) {
      const body = matter.read(path.join(postsDir, name)).content;
      expect(body.trim().length).toBeGreaterThan(0);
      expect(body).not.toMatch(/!\[\]\(\/images\/posts\//);
    }
  });

  it("keeps every migrated post image and the profile image available from public", () => {
    const imagePaths = markdownFiles(postsDir).flatMap((name) => {
      const body = matter.read(path.join(postsDir, name)).content;
      return [...body.matchAll(/!\[[^\]]*\]\((\/images\/posts\/[^)]+)\)/g)].map((match) => match[1]);
    });

    expect(imagePaths).not.toHaveLength(0);
    for (const imagePath of imagePaths) {
      expect(fs.existsSync(path.join(publicDir, imagePath))).toBe(true);
    }
    expect(fs.existsSync(path.join(publicDir, "images/profile.png"))).toBe(true);
  });
});
