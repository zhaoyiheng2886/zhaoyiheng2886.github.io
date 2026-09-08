import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const output = (route: string) => fs.readFileSync(path.join("dist", route), "utf8");

describe("production output", () => {
  for (const route of ["index.html", "tech/index.html", "memory/index.html", "research/index.html", "about/index.html", "en/about/index.html", "search/index.html", "editor/index.html", "404.html"]) {
    it(`builds ${route}`, () => expect(fs.existsSync(path.join("dist", route))).toBe(true));
  }

  it("renders one timeline with all content kinds and approved intro", () => {
    const home = output("index.html");
    expect(home).toContain('aria-label="最近内容"');
    for (const kind of ["TECH", "MEMORY", "RESEARCH"]) expect(home).toContain(`data-kind="${kind}"`);
    expect(home).toContain("Researching machines. Remembering a life.");
    expect(home).not.toContain("Singapore");
  });

  it("builds every canonical post and legacy redirect", () => {
    for (const name of fs.readdirSync("src/content/posts").filter((file) => file.endsWith(".md"))) {
      const { data } = matter.read(path.join("src/content/posts", name));
      const slug = name.replace(/\.md$/, "");
      const canonical = `/${data.kind}/${slug}/`;
      expect(fs.existsSync(`dist${canonical}index.html`)).toBe(true);
      if (data.legacyPath) {
        const legacy = fs.readFileSync(`dist${data.legacyPath}index.html`, "utf8");
        expect(legacy).toContain('content="noindex"');
        expect(legacy).toContain(`href="${canonical}"`);
      }
    }
  });

  it("emits discovery and compatibility artifacts", () => {
    expect(fs.existsSync("dist/pagefind/pagefind.js")).toBe(true);
    const postCount = fs.readdirSync("src/content/posts").filter((file) => file.endsWith(".md")).length;
    expect(output("rss.xml").match(/<item>/g)).toHaveLength(postCount);
    expect(output("robots.txt")).toContain("https://zhaoyiheng2886.github.io/sitemap-index.xml");
    expect(output("about/index.html")).toContain('href="/en/about/"');
    expect(output("en/about/index.html")).toContain('href="/about/"');
    expect(output("cn/index.html")).toContain('href="/about/"');
    expect(output("publications/index.html")).toContain('href="/research/"');
  });

  it("emits a PNG card for every post", () => {
    const cards = fs.readdirSync("dist/og").filter((file) => file.endsWith(".png"));
    const postCount = fs.readdirSync("src/content/posts").filter((file) => file.endsWith(".md")).length;
    expect(cards).toHaveLength(postCount);
    for (const card of cards) expect([...fs.readFileSync(path.join("dist/og", card)).subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  });
});
