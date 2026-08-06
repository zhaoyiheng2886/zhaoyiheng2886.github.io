# Astro Dual-Stream Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing Jekyll Academic Pages site with a deployable Astro 6 personal site that presents technology, memory, and research in one restrained chronological reading experience while preserving existing content and URLs.

**Architecture:** Astro generates every public route at build time. Typed content collections hold posts, research, and future life moments; small content helpers feed channel pages, tags, RSS, and the unified timeline. A custom CSS system and focused Astro components provide the visual identity, while compatibility routes redirect old Jekyll URLs.

**Tech Stack:** Astro 6, TypeScript, Markdown/MDX, Astro Content Collections, Expressive Code, Pagefind, Vitest, plain CSS, GitHub Actions, GitHub Pages.

## Global Constraints

- Default language is Chinese; technical terms and content-kind labels remain English.
- Public navigation is exactly `~/home`, `~/tech`, `~/memory`, `~/research`, and `~/about`.
- Main reading width is `45rem`; mobile remains a single column without horizontal navigation overflow.
- Color tokens are `paper #F4F5F2`, `ink #15181D`, `graphite #69707B`, `signal #5877D8`, and `line #D9DCE1`.
- Do not use gradients, glass effects, large shadows, decorative large radii, background particles, or simulated terminal typing.
- Do not depend on third-party font CDNs.
- Preserve all 12 posts, 2 research entries, referenced images, and existing article/publication permalinks.
- Do not invent personal memories, rewrite technical claims, or add comments, accounts, databases, analytics, newsletters, or a CMS.
- The editor runs locally in the browser, uploads nothing, calls no GitHub API, and downloads the generated post file.

---

## Planned File Structure

```text
astro.config.ts                         Astro integrations and site URL
package.json                            scripts and dependencies
tsconfig.json                           strict TypeScript configuration
.github/workflows/deploy.yml            GitHub Pages build and deploy
scripts/migrate-jekyll.mjs              deterministic one-time content migration
docs/migration-report.md                migration inventory and final verification evidence
src/site.config.ts                      identity, navigation, and external links
src/content.config.ts                   Astro collection loaders
src/content/schema.ts                   reusable Zod schemas
src/content/posts/*.md                  12 migrated posts
src/content/research/*.md               2 migrated research entries
src/content/moments/.gitkeep            empty real-life collection without invented data
src/lib/content.ts                      sorting, filtering, tags, and timeline assembly
src/lib/editor.ts                       pure editor/frontmatter/download helpers
src/components/SiteHeader.astro         navigation and theme control
src/components/SiteFooter.astro         footer links
src/components/Intro.astro              approved hero copy only
src/components/TimelineFeed.astro       mixed-content chronological feed
src/components/PostList.astro           channel post listing
src/components/PostMeta.astro           date, kind, reading time, and tags
src/components/ResearchList.astro       research entries
src/components/Search.astro             Pagefind UI and dev fallback
src/components/BlogEditor.astro         local Markdown editor UI
src/layouts/BaseLayout.astro             document shell, SEO, and theme bootstrap
src/layouts/PostLayout.astro             article typography and optional TOC
src/pages/index.astro                    unified home timeline
src/pages/tech/[...slug].astro           technology post routes
src/pages/memory/[...slug].astro         memory post routes
src/pages/research/index.astro           research page
src/pages/about/index.astro              Chinese biography
src/pages/en/about/index.astro           English biography
src/pages/tags/[tag].astro               tag pages
src/pages/search/index.astro             search page
src/pages/editor/index.astro             hidden editor route
src/pages/rss.xml.ts                     RSS feed
src/pages/robots.txt.ts                  crawler policy
src/pages/og/[...slug].png.ts            build-time post sharing images
src/pages/404.astro                      custom not-found page
src/pages/posts/[year]/[month]/[...slug].astro  old post redirects
src/pages/publication/[...slug].astro    old publication redirects
src/pages/cn/index.astro                 old Chinese-about redirect
src/pages/publications/index.astro       old publications redirect
src/pages/year-archive/index.astro       old archive redirect
src/pages/blog-editor/index.astro        old editor redirect
src/styles/global.css                    complete visual system and prose styles
public/images/posts/*                    migrated post images
public/images/profile.png                migrated profile image
public/files/*                           only attachments referenced by real content
tests/schema.test.ts                     frontmatter validation
tests/content.test.ts                    sorting, channel, tag, and timeline behavior
tests/migration.test.ts                  migrated-count and legacy-path checks
tests/editor.test.ts                     editor output behavior
tests/design-contract.test.ts            design-token and copy constraints
tests/routes.test.ts                     expected generated routes
scripts/verify-build.mjs                 production artifact assertions
```

### Task 1: Establish the Astro Build and Test Baseline

**Files:**
- Create: `package.json`
- Create: `astro.config.ts`
- Create: `tsconfig.json`
- Create: `src/site.config.ts`
- Create: `tests/scaffold.test.ts`

**Interfaces:**
- Produces: `siteConfig` with `title`, `description`, `url`, `author`, `email`, `github`, and `navigation`.
- Produces: scripts `dev`, `build`, `preview`, `check`, `test`, and `postbuild`.

- [ ] **Step 1: Create the scaffold test before configuration**

```ts
import { describe, expect, it } from "vitest";
import { siteConfig } from "../src/site.config";

describe("siteConfig", () => {
  it("defines the approved public navigation", () => {
    expect(siteConfig.navigation.map((item) => item.href)).toEqual([
      "/", "/tech/", "/memory/", "/research/", "/about/",
    ]);
  });

  it("uses the production GitHub Pages URL", () => {
    expect(siteConfig.url).toBe("https://zhaoyiheng2886.github.io");
  });
});
```

- [ ] **Step 2: Create `package.json`, install dependencies, and run the failing test**

Create these scripts and dependency floors:

```json
{
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "postbuild": "pagefind --site dist",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  },
  "dependencies": {
    "@astrojs/mdx": "^4.0.0",
    "@astrojs/rss": "^4.0.0",
    "@astrojs/sitemap": "^3.0.0",
    "@resvg/resvg-js": "^2.6.2",
    "astro": "^6.0.0",
    "astro-expressive-code": "^0.41.0",
    "dompurify": "^3.2.0",
    "marked": "^16.0.0",
    "pagefind": "^1.3.0",
    "satori": "^0.18.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.0",
    "gray-matter": "^4.0.3",
    "typescript": "^5.9.0",
    "vitest": "^3.2.0"
  }
}
```

Run `npm install`, then run `npm test -- tests/scaffold.test.ts`.

Expected: FAIL because `src/site.config.ts` does not exist.

- [ ] **Step 3: Add the minimal Astro and site configuration**

```ts
export const siteConfig = {
  title: "赵以恒 / Zhao Yiheng",
  description: "研究机器，也记录那些差一点被忘记的事。",
  url: "https://zhaoyiheng2886.github.io",
  author: "Zhao Yiheng",
  email: "yiheng007@e.ntu.edu.sg",
  github: "https://github.com/zhaoyiheng2886",
  navigation: [
    { label: "~/home", href: "/" },
    { label: "~/tech", href: "/tech/" },
    { label: "~/memory", href: "/memory/" },
    { label: "~/research", href: "/research/" },
    { label: "~/about", href: "/about/" },
  ],
} as const;
```

Configure Astro with `site: siteConfig.url`, MDX, sitemap, and Expressive Code. Use `astro check` and strict TypeScript.

- [ ] **Step 4: Verify scaffold**

Run `npm test -- tests/scaffold.test.ts && npm run check`.

Expected: 2 tests PASS and Astro type checking exits 0.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json astro.config.ts tsconfig.json src/site.config.ts tests/scaffold.test.ts
git commit -m "build: establish Astro project baseline"
```

### Task 2: Define Typed Content and Timeline Interfaces

**Files:**
- Create: `src/content/schema.ts`
- Create: `src/content.config.ts`
- Create: `src/lib/content.ts`
- Create: `tests/schema.test.ts`
- Create: `tests/content.test.ts`

**Interfaces:**
- Produces: `postSchema`, `researchSchema`, and `momentSchema`.
- Produces: `PostKind = "tech" | "memory"`.
- Produces: `TimelineEntry = { id, href, date, title, description, kind }`.
- Produces: `sortByDateDesc()`, `getPublishedPosts()`, `filterPostsByKind()`, `getTagCounts()`, and `buildTimeline()`.

- [ ] **Step 1: Write failing schema and content-helper tests**

```ts
import { describe, expect, it } from "vitest";
import { postSchema } from "../src/content/schema";
import { buildTimeline, filterPostsByKind, getPublishedPosts, getTagCounts } from "../src/lib/content";

it("rejects a post without a description", () => {
  expect(() => postSchema.parse({ title: "x", publishDate: new Date(), kind: "tech" })).toThrow();
});

it("filters and counts normalized tags", () => {
  const posts = [
    { data: { kind: "tech", tags: ["AIGC", "Diffusion"] } },
    { data: { kind: "memory", tags: ["求职"] } },
  ] as never[];
  expect(filterPostsByKind(posts, "tech")).toHaveLength(1);
  expect(getTagCounts(posts)).toEqual(new Map([["aigc", 1], ["diffusion", 1], ["求职", 1]]));
});

it("orders a mixed timeline newest first", () => {
  const entries = buildTimeline(
    [{ id: "post", data: { title: "Post", description: "D", publishDate: new Date("2026-01-01"), kind: "tech" } }] as never[],
    [{ id: "paper", data: { title: "Paper", description: "D", date: new Date("2026-02-01") } }] as never[],
    [],
  );
  expect(entries.map((entry) => entry.id)).toEqual(["paper", "post"]);
});

it("removes drafts before feeds and search consumers receive posts", () => {
  const posts = [
    { id: "published", data: { draft: false } },
    { id: "draft", data: { draft: true } },
  ] as never[];
  expect(getPublishedPosts(posts).map((post) => post.id)).toEqual(["published"]);
});
```

- [ ] **Step 2: Run tests and confirm missing-module failures**

Run `npm test -- tests/schema.test.ts tests/content.test.ts`.

Expected: FAIL because the schema and helper modules do not exist.

- [ ] **Step 3: Implement schemas and pure helpers**

Use strict enums, trimmed strings, date coercion, unique normalized tags, and explicit `legacyPath`. `buildTimeline()` must map post kinds to `TECH` or `MEMORY`, research to `RESEARCH`, and moments to `MEMORY` without reading global state.

```ts
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
export type TimelineEntry = {
  id: string;
  href: string;
  date: Date;
  title: string;
  description: string;
  kind: "TECH" | "MEMORY" | "RESEARCH";
};

export const getPublishedPosts = <T extends { data: { draft?: boolean } }>(posts: T[]) =>
  posts.filter((post) => post.data.draft !== true);
export const filterPostsByKind = <T extends { data: { kind: PostKind } }>(posts: T[], kind: PostKind) =>
  posts.filter((post) => post.data.kind === kind);
```

- [ ] **Step 4: Verify content contracts**

Run `npm test -- tests/schema.test.ts tests/content.test.ts && npm run check`.

Expected: all schema/helper tests PASS and type checking exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/content/schema.ts src/lib/content.ts tests/schema.test.ts tests/content.test.ts
git commit -m "feat: define typed dual-stream content"
```

### Task 3: Migrate the 12 Posts, 2 Research Entries, and Referenced Assets

**Files:**
- Create: `scripts/migrate-jekyll.mjs`
- Create: `docs/migration-report.md`
- Create: `tests/migration.test.ts`
- Create: `src/content/posts/*.md`
- Create: `src/content/research/*.md`
- Create: `src/content/moments/.gitkeep`
- Copy: `images/posts/*` to `public/images/posts/*`
- Copy: `images/profile.png` to `public/images/profile.png`
- Copy: referenced `files/*` to `public/files/*`

**Interfaces:**
- Consumes: old `_posts`, `_publications`, `images`, and `files` directories.
- Produces: schema-valid Astro collection files with stable `legacyPath` values.

- [ ] **Step 1: Write migration assertions**

```ts
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDir = path.resolve("src/content/posts");
const researchDir = path.resolve("src/content/research");

it("migrates exactly twelve posts and two research entries", () => {
  expect(fs.readdirSync(postsDir).filter((name) => name.endsWith(".md"))).toHaveLength(12);
  expect(fs.readdirSync(researchDir).filter((name) => name.endsWith(".md"))).toHaveLength(2);
});

it("preserves every old post permalink", () => {
  const legacyPaths = fs.readdirSync(postsDir).map((name) =>
    matter.read(path.join(postsDir, name)).data.legacyPath,
  );
  expect(legacyPaths.every((value) => /^\/posts\/2026\/(03|04)\/.+\/$/.test(value))).toBe(true);
  expect(new Set(legacyPaths).size).toBe(12);
});
```

- [ ] **Step 2: Run tests and confirm empty-collection failure**

Run `npm test -- tests/migration.test.ts`.

Expected: FAIL because migrated collection directories/files do not yet exist.

- [ ] **Step 3: Implement deterministic migration**

The script must parse YAML frontmatter with `gray-matter`, preserve the Markdown body, remove the leading `YYYY-MM-DD-` from each output filename, set `kind: memory` only for filenames containing `找暑期实习`, set `kind: tech` for the other eight posts, copy each original permalink to `legacyPath`, generate a plain-text description from the first non-heading paragraph, and retain existing tags. Convert root image paths from `/images/posts/` to the same public URL. Replace empty image alt syntax `![](` with `![文章配图](` and append the affected filename and image path to `docs/migration-report.md` for later visual review.

```js
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const sourceDir = path.resolve("_posts");
const targetDir = path.resolve("src/content/posts");
fs.mkdirSync(targetDir, { recursive: true });

const descriptionFrom = (body) => body
  .split(/\n\s*\n/)
  .map((part) => part.replace(/^#+\s+/gm, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").trim())
  .find((part) => part && !part.startsWith("```"))
  ?.replace(/\s+/g, " ").slice(0, 160) || "赵以恒的个人记录。";

for (const filename of fs.readdirSync(sourceDir).filter((name) => name.endsWith(".md"))) {
  const source = fs.readFileSync(path.join(sourceDir, filename), "utf8");
  const { data, content } = matter(source);
  const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
  const body = content.replace(/!\[\]\((\/images\/posts\/[^)]+)\)/g, "![文章配图]($1)");
  const migrated = matter.stringify(body.trimStart(), {
    title: data.title,
    description: descriptionFrom(body),
    publishDate: data.date,
    kind: filename.includes("找暑期实习") ? "memory" : "tech",
    tags: Array.isArray(data.tags) ? data.tags : [],
    draft: false,
    legacyPath: data.permalink,
  });
  fs.writeFileSync(path.join(targetDir, `${slug}.md`), migrated, "utf8");
}
```

Run `node scripts/migrate-jekyll.mjs`. Do not create a moment entry because no real memory content has been supplied beyond the four existing diaries.

- [ ] **Step 4: Verify content and assets**

Run `npm test -- tests/migration.test.ts && npm run check`.

Also run:

```bash
test "$(find src/content/posts -name '*.md' | wc -l | tr -d ' ')" = "12"
test "$(find src/content/research -name '*.md' | wc -l | tr -d ' ')" = "2"
rg -o '/images/posts/[^)]+' src/content/posts | cut -d: -f2 | sort -u
```

Expected: tests PASS, counts are 12 and 2, and every printed image path has a matching file under `public/`.

- [ ] **Step 5: Commit**

```bash
git add scripts src/content public/images public/files docs/migration-report.md tests/migration.test.ts
git commit -m "feat: migrate Jekyll content into Astro collections"
```

### Task 4: Build the Visual Foundation and Shared Layout

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/SiteHeader.astro`
- Create: `src/components/SiteFooter.astro`
- Create: `src/components/Intro.astro`
- Create: `tests/design-contract.test.ts`

**Interfaces:**
- Consumes: `siteConfig.navigation` and page-level `title`, `description`, and optional `image`.
- Produces: the HTML shell, theme bootstrapping, shared header/footer, and approved intro copy.

- [ ] **Step 1: Write the failing visual contract test**

```ts
import { expect, it } from "vitest";
import fs from "node:fs";

it("contains the approved tokens and excludes rejected decoration", () => {
  const css = fs.readFileSync("src/styles/global.css", "utf8");
  expect(css).toContain("--paper: #F4F5F2");
  expect(css).toContain("--signal: #5877D8");
  expect(css).toContain("--content-width: 45rem");
  expect(css).not.toMatch(/linear-gradient|radial-gradient|backdrop-filter/);
});

it("keeps the approved intro free of profile info chips", () => {
  const intro = fs.readFileSync("src/components/Intro.astro", "utf8");
  expect(intro).toContain("Researching machines. Remembering a life.");
  expect(intro).not.toContain("Singapore");
  expect(intro).not.toContain("info-item");
});
```

- [ ] **Step 2: Run the test and confirm missing-file failure**

Run `npm test -- tests/design-contract.test.ts`.

Expected: FAIL because the CSS and Intro component do not exist.

- [ ] **Step 3: Implement the shared visual system**

Define the five approved tokens, serif body and monospace utility stacks, visible focus states, light/dark tokens, `prefers-reduced-motion`, responsive header wrapping, prose rhythm, code overflow, and a maximum reading width of `45rem`. `Intro.astro` contains only the approved three-line copy and no AIGC/AI Security/Singapore chip row.

```css
:root {
  --paper: #F4F5F2;
  --ink: #15181D;
  --graphite: #69707B;
  --signal: #5877D8;
  --line: #D9DCE1;
  --content-width: 45rem;
  color-scheme: light dark;
  font-family: "Songti SC", "Noto Serif CJK SC", Georgia, serif;
}

body { margin: 0; background: var(--paper); color: var(--ink); }
.shell { width: min(calc(100% - 2rem), var(--content-width)); margin-inline: auto; }
.utility { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
:focus-visible { outline: 2px solid var(--signal); outline-offset: 3px; }
pre { overflow-x: auto; }
@media (prefers-color-scheme: dark) {
  :root { --paper: #15181D; --ink: #F4F5F2; --graphite: #A8AFBA; --line: #333842; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; }
}
```

```astro
<section class="intro" aria-labelledby="site-intro-title">
  <h1 id="site-intro-title">赵以恒</h1>
  <p lang="en">Researching machines. Remembering a life.</p>
  <p>研究机器，也记录那些差一点被忘记的事。</p>
</section>
```

- [ ] **Step 4: Verify shared UI**

Run `npm test -- tests/design-contract.test.ts && npm run check`.

Expected: visual contract tests PASS and type checking exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/styles src/layouts/BaseLayout.astro src/components/SiteHeader.astro src/components/SiteFooter.astro src/components/Intro.astro tests/design-contract.test.ts
git commit -m "feat: add restrained editor-inspired visual system"
```

### Task 5: Implement the Unified Timeline and Channel Pages

**Files:**
- Create: `src/components/PostMeta.astro`
- Create: `src/components/PostList.astro`
- Create: `src/components/TimelineFeed.astro`
- Create: `src/components/ResearchList.astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/tech/index.astro`
- Create: `src/pages/memory/index.astro`
- Create: `src/pages/research/index.astro`
- Create: `tests/routes.test.ts`

**Interfaces:**
- Consumes: `buildTimeline()`, `filterPostsByKind()`, and Astro collections.
- Produces: `/`, `/tech/`, `/memory/`, and `/research/`.

- [ ] **Step 1: Write failing route-source tests**

```ts
import { expect, it } from "vitest";
import fs from "node:fs";

for (const route of ["index.astro", "tech/index.astro", "memory/index.astro", "research/index.astro"]) {
  it(`defines src/pages/${route}`, () => {
    expect(fs.existsSync(`src/pages/${route}`)).toBe(true);
  });
}

it("uses one timeline with semantic node kinds", () => {
  const source = fs.readFileSync("src/components/TimelineFeed.astro", "utf8");
  expect(source).toContain('data-kind={entry.kind}');
});
```

- [ ] **Step 2: Run tests and confirm missing-route failures**

Run `npm test -- tests/routes.test.ts`.

Expected: FAIL for the missing pages/components.

- [ ] **Step 3: Implement pages and timeline components**

The timeline line is structural CSS. Use a round filled marker for `TECH`, a round hollow marker for `MEMORY`, and a square marker for `RESEARCH`; pair shapes with visible labels. Render all entries newest first. Channel pages use the same metadata and spacing rather than cards.

```astro
---
import type { TimelineEntry } from "../lib/content";
interface Props { entries: TimelineEntry[] }
const { entries } = Astro.props;
---
<ol class="timeline" aria-label="最近内容">
  {entries.map((entry) => (
    <li class="timeline-entry" data-kind={entry.kind}>
      <span class="timeline-marker" aria-hidden="true"></span>
      <div>
        <p class="utility timeline-meta">
          <span>{entry.kind}</span>
          <time datetime={entry.date.toISOString()}>{entry.date.toLocaleDateString("zh-CN")}</time>
        </p>
        <h2><a href={entry.href}>{entry.title}</a></h2>
        <p>{entry.description}</p>
      </div>
    </li>
  ))}
</ol>
```

```astro
---
import { getCollection } from "astro:content";
import Intro from "../components/Intro.astro";
import TimelineFeed from "../components/TimelineFeed.astro";
import BaseLayout from "../layouts/BaseLayout.astro";
import { buildTimeline, getPublishedPosts } from "../lib/content";
const posts = getPublishedPosts(await getCollection("posts"));
const research = await getCollection("research");
const moments = await getCollection("moments");
const entries = buildTimeline(posts, research, moments);
---
<BaseLayout><Intro /><TimelineFeed entries={entries} /></BaseLayout>
```

- [ ] **Step 4: Verify routes and build**

Run `npm test -- tests/routes.test.ts tests/content.test.ts && npm run build`.

Expected: tests PASS; build emits `/index.html`, `/tech/index.html`, `/memory/index.html`, and `/research/index.html`.

- [ ] **Step 5: Commit**

```bash
git add src/components/PostMeta.astro src/components/PostList.astro src/components/TimelineFeed.astro src/components/ResearchList.astro src/pages/index.astro src/pages/tech src/pages/memory src/pages/research tests/routes.test.ts
git commit -m "feat: add unified timeline and content channels"
```

### Task 6: Add Article Pages, Prose, TOC, and Legacy Redirects

**Files:**
- Create: `src/layouts/PostLayout.astro`
- Create: `src/pages/tech/[...slug].astro`
- Create: `src/pages/memory/[...slug].astro`
- Create: `src/pages/posts/[year]/[month]/[...slug].astro`
- Create: `src/pages/publication/[...slug].astro`
- Extend: `tests/routes.test.ts`

**Interfaces:**
- Consumes: post `kind`, slug, headings, and `legacyPath`.
- Produces: canonical post pages and all 14 legacy content redirects.

- [ ] **Step 1: Extend failing tests for article and redirect generators**

Add these assertions to `tests/routes.test.ts`:

```ts
const read = (file: string) => fs.readFileSync(file, "utf8");

it("creates canonical technology and memory article routes", () => {
  expect(read("src/pages/tech/[...slug].astro")).toMatch(/getStaticPaths/);
  expect(read("src/pages/tech/[...slug].astro")).toContain('"tech"');
  expect(read("src/pages/memory/[...slug].astro")).toMatch(/getStaticPaths/);
  expect(read("src/pages/memory/[...slug].astro")).toContain('"memory"');
});

it("derives compatibility routes from content legacyPath fields", () => {
  expect(read("src/pages/posts/[year]/[month]/[...slug].astro")).toContain("legacyPath");
  expect(read("src/pages/publication/[...slug].astro")).toContain("legacyPath");
});
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run `npm test -- tests/routes.test.ts`.

Expected: FAIL because article and compatibility route files are absent.

- [ ] **Step 3: Implement canonical pages and redirects**

`PostLayout.astro` renders title, description, date, reading time, tags, responsive images, and a TOC only when the Markdown renderer returns at least three level-2/3 headings. Redirect pages emit a canonical URL, `noindex`, meta refresh, and a visible fallback link.

Canonical channel route pattern:

```astro
---
import { getCollection, render } from "astro:content";
import PostLayout from "../../layouts/PostLayout.astro";

export async function getStaticPaths() {
  const posts = await getCollection("posts", ({ data }) => data.kind === "tech" && !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}
const { post } = Astro.props;
const { Content, headings } = await render(post);
---
<PostLayout post={post} headings={headings}><Content /></PostLayout>
```

Legacy post route pattern:

```astro
---
import { getCollection } from "astro:content";
export async function getStaticPaths() {
  const posts = await getCollection("posts", ({ data }) => !data.draft && Boolean(data.legacyPath));
  return posts.map((post) => {
    const [year, month, ...slug] = post.data.legacyPath!.replace(/^\/posts\//, "").replace(/\/$/, "").split("/");
    return {
      params: { year, month, slug: slug.join("/") },
      props: { destination: `/${post.data.kind}/${post.id}/` },
    };
  });
}
const { destination } = Astro.props;
---
<html><head><meta name="robots" content="noindex" /><meta http-equiv="refresh" content={`0;url=${destination}`} /></head>
<body><a href={destination}>文章已迁移，点击继续阅读。</a></body></html>
```

- [ ] **Step 4: Verify every legacy output path**

Run `npm test -- tests/routes.test.ts && npm run build`, then run a Node assertion that reads each content file's `legacyPath` and verifies `dist/<legacyPath>/index.html` exists.

Expected: all 12 old post paths and 2 old publication paths exist in `dist/`.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/PostLayout.astro src/pages/tech src/pages/memory src/pages/posts src/pages/publication tests/routes.test.ts
git commit -m "feat: add article pages and legacy redirects"
```

### Task 7: Add About, Tags, Search, RSS, and 404

**Files:**
- Create: `src/pages/about/index.astro`
- Create: `src/pages/en/about/index.astro`
- Create: `src/pages/tags/index.astro`
- Create: `src/pages/tags/[tag].astro`
- Create: `src/components/Search.astro`
- Create: `src/pages/search/index.astro`
- Create: `src/pages/rss.xml.ts`
- Create: `src/pages/robots.txt.ts`
- Create: `src/pages/og/[...slug].png.ts`
- Create: `src/pages/404.astro`
- Create: `src/pages/cn/index.astro`
- Create: `src/pages/publications/index.astro`
- Create: `src/pages/year-archive/index.astro`
- Extend: `tests/routes.test.ts`

**Interfaces:**
- Consumes: migrated About copy, `getTagCounts()`, published posts, and `siteConfig`.
- Produces: bilingual biography, tag navigation, static search, RSS, 404, and non-content compatibility redirects.

- [ ] **Step 1: Add failing assertions for support routes**

Add these assertions to `tests/routes.test.ts`:

```ts
it("provides bilingual biographies with reciprocal links", () => {
  const zh = read("src/pages/about/index.astro");
  const en = read("src/pages/en/about/index.astro");
  expect(zh).toContain('/en/about/');
  expect(en).toContain('/about/');
});

it("exposes search fallback, RSS, robots, OG, and 404 sources", () => {
  expect(read("src/components/Search.astro")).toContain("搜索索引将在生产构建后生成。");
  expect(read("src/pages/rss.xml.ts")).toContain("getPublishedPosts");
  expect(fs.existsSync("src/pages/robots.txt.ts")).toBe(true);
  expect(fs.existsSync("src/pages/og/[...slug].png.ts")).toBe(true);
  expect(fs.existsSync("src/pages/404.astro")).toBe(true);
});

it("maps compatibility pages to exact replacements", () => {
  expect(read("src/pages/cn/index.astro")).toContain('/about/');
  expect(read("src/pages/publications/index.astro")).toContain('/research/');
  expect(read("src/pages/year-archive/index.astro")).toContain('destination: "/"');
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run `npm test -- tests/routes.test.ts`.

Expected: FAIL because support routes are missing.

- [ ] **Step 3: Implement support routes**

Migrate the current Chinese and English biography facts without adding claims. Configure Pagefind to index post/article content during `postbuild`. The development search message is `搜索索引将在生产构建后生成。` RSS contains all published tech and memory posts. `robots.txt` references the generated sitemap. The OG endpoint renders the title, kind, date, and site name with Satori and Resvg at build time, using only bundled/system fonts and the approved color tokens.

```ts
// src/pages/rss.xml.ts
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getPublishedPosts } from "../lib/content";
import { siteConfig } from "../site.config";

export async function GET(context) {
  const posts = getPublishedPosts(await getCollection("posts"));
  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `/${post.data.kind}/${post.id}/`,
    })),
  });
}
```

```ts
// src/pages/robots.txt.ts
import { siteConfig } from "../site.config";
export function GET() {
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${siteConfig.url}/sitemap-index.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

`src/pages/og/[...slug].png.ts` must expose `getStaticPaths()` over published posts, call `satori()` with a fixed `1200 × 630` tree using `#F4F5F2`, `#15181D`, and `#5877D8`, then return `new Response(new Resvg(svg).render().asPng(), { headers: { "Content-Type": "image/png" } })`.

- [ ] **Step 4: Verify production artifacts**

Run `npm run build && npm run postbuild`.

Expected: build succeeds; `dist/pagefind/`, `dist/rss.xml`, `dist/robots.txt`, generated OG PNGs, both About pages, tag pages, and `dist/404.html` exist.

- [ ] **Step 5: Commit**

```bash
git add src/components/Search.astro src/pages/about src/pages/en src/pages/tags src/pages/search src/pages/rss.xml.ts src/pages/robots.txt.ts src/pages/og src/pages/404.astro src/pages/cn src/pages/publications src/pages/year-archive tests/routes.test.ts
git commit -m "feat: add discovery, biography, and support pages"
```

### Task 8: Port the Local Markdown Editor

**Files:**
- Create: `src/lib/editor.ts`
- Create: `src/components/BlogEditor.astro`
- Create: `src/pages/editor/index.astro`
- Create: `src/pages/blog-editor/index.astro`
- Create: `tests/editor.test.ts`

**Interfaces:**
- Produces: `createPostDocument(input: EditorInput): string`.
- Produces: `downloadPost(filename: string, content: string): void`.
- Produces: hidden `/editor/` tool and `/blog-editor/` redirect.

- [ ] **Step 1: Write failing pure-function tests**

```ts
import { expect, it } from "vitest";
import { createPostDocument } from "../src/lib/editor";

it("generates schema-valid frontmatter without network metadata", () => {
  const result = createPostDocument({
    title: "新的记忆",
    description: "一段准备发布的个人记忆。",
    publishDate: "2026-08-06",
    kind: "memory",
    tags: ["生活"],
    body: "正文",
  });
  expect(result).toContain("kind: memory");
  expect(result).toContain("tags:\n  - 生活");
  expect(result).toContain("\n---\n\n正文\n");
  expect(result).not.toMatch(/token|github api/i);
});
```

- [ ] **Step 2: Run test and confirm missing-module failure**

Run `npm test -- tests/editor.test.ts`.

Expected: FAIL because `src/lib/editor.ts` does not exist.

- [ ] **Step 3: Implement editor helpers and UI**

Use `marked` plus DOMPurify for local preview. Validate required fields before enabling download. Generate filenames as `YYYY-MM-DD-<ascii-or-percent-safe-slug>.md`. Do not use `fetch`, storage APIs, analytics, or GitHub API calls.

```ts
export type EditorInput = {
  title: string;
  description: string;
  publishDate: string;
  kind: "tech" | "memory";
  tags: string[];
  body: string;
};

const yamlString = (value: string) => JSON.stringify(value.trim());

export function createPostDocument(input: EditorInput): string {
  if (!input.title.trim() || !input.description.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(input.publishDate)) {
    throw new Error("标题、摘要和有效日期不能为空。");
  }
  const tags = input.tags.map((tag) => tag.trim()).filter(Boolean).map((tag) => `  - ${tag}`).join("\n");
  return [
    "---",
    `title: ${yamlString(input.title)}`,
    `description: ${yamlString(input.description)}`,
    `publishDate: ${input.publishDate}`,
    `kind: ${input.kind}`,
    "tags:",
    tags,
    "draft: false",
    "---",
    "",
    input.body.trim(),
    "",
  ].join("\n");
}
```

In `BlogEditor.astro`, import `marked` and DOMPurify inside the client script, update the preview with `DOMPurify.sanitize(await marked.parse(body))`, create a Blob from `createPostDocument()`, click an object-URL download anchor, and immediately revoke the URL.

- [ ] **Step 4: Verify editor**

Run `npm test -- tests/editor.test.ts && npm run check && npm run build`.

Expected: editor tests PASS and both `/editor/` and `/blog-editor/` outputs exist.

- [ ] **Step 5: Commit**

```bash
git add src/lib/editor.ts src/components/BlogEditor.astro src/pages/editor src/pages/blog-editor tests/editor.test.ts
git commit -m "feat: port the local Markdown editor"
```

### Task 9: Deploy with GitHub Actions and Remove Jekyll-Only Sources

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `.gitignore`
- Replace: `README.md`
- Delete: `_config.yml`, `Gemfile`, `Dockerfile`, `docker-compose.yaml`, Jekyll `_layouts`, `_includes`, `_sass`, unused collections, example pages, old compiled assets, and notebook generators.

**Interfaces:**
- Produces: a Pages artifact built from `dist/` on pushes to `master`.
- Preserves: Git history as the recovery path for every deleted Jekyll source.

- [ ] **Step 1: Add failing deployment-contract tests**

Extend `tests/scaffold.test.ts` with:

```ts
import fs from "node:fs";

it("defines the official GitHub Pages artifact flow", () => {
  const workflow = fs.readFileSync(".github/workflows/deploy.yml", "utf8");
  for (const expected of [
    "actions/configure-pages",
    "actions/upload-pages-artifact",
    "actions/deploy-pages",
    "actions/setup-node",
    "npm ci",
    "npm run build",
  ]) expect(workflow).toContain(expected);
});

it("removes Jekyll-only entry points after migration", () => {
  for (const file of ["_config.yml", "Gemfile", "Dockerfile", "docker-compose.yaml"]) {
    expect(fs.existsSync(file)).toBe(false);
  }
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run `npm test -- tests/scaffold.test.ts`.

Expected: FAIL because the workflow is absent and Jekyll files remain.

- [ ] **Step 3: Add workflow, documentation, and recoverable cleanup**

Use GitHub's Pages permissions (`pages: write`, `id-token: write`) and concurrency group `pages`. Update README with local commands, content locations, editor URL, deployment behavior, and legacy redirect policy. After the Astro build contains all real content, remove these Jekyll-only paths: `_config.yml`, `_config_docker.yml`, `Gemfile`, `Dockerfile`, `docker-compose.yaml`, `_data`, `_drafts`, `_includes`, `_layouts`, `_pages`, `_portfolio`, `_posts`, `_publications`, `_sass`, `_talks`, `_teaching`, `assets`, `markdown_generator`, `scripts/cv_markdown_to_json.py`, `scripts/update_cv_json.sh`, `talkmap`, `talkmap.py`, and `talkmap_out.ipynb`. Keep the new `scripts/migrate-jekyll.mjs` and `scripts/verify-build.mjs`.

```yaml
name: Deploy Astro site to Pages
on:
  push:
    branches: [master]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - uses: actions/configure-pages@v5
      - run: npm ci
      - run: npm test
      - run: npm run check
      - run: npm run build
      - run: npm run postbuild
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Verify clean replacement**

Run `npm test && npm run check && npm run build && npm run postbuild`.

Expected: all tests PASS, checks/build exit 0, and no Jekyll build dependency is required.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "build: replace Jekyll deployment with Astro Pages"
```

### Task 10: Full Verification and Visual QA

**Files:**
- Modify: `docs/migration-report.md`
- Create: `scripts/verify-build.mjs`
- Modify only if verification finds defects: affected source/test files.

**Interfaces:**
- Produces: evidence that content, routes, design, accessibility basics, and deployment artifacts meet the approved specification.

- [ ] **Step 1: Run the complete automated gate**

Run:

```bash
npm test
npm run check
npm run build
npm run postbuild
```

Expected: zero test failures, zero Astro errors, successful production build, and generated Pagefind index.

- [ ] **Step 2: Run artifact assertions**

Create `scripts/verify-build.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const assertFile = (relative) => {
  const target = path.join("dist", relative.replace(/^\//, ""));
  if (!fs.existsSync(target)) throw new Error(`Missing build artifact: ${relative}`);
};
const htmlAt = (route) => `${route.replace(/^\//, "")}index.html`;

const postFiles = fs.readdirSync("src/content/posts").filter((name) => name.endsWith(".md"));
if (postFiles.length !== 12) throw new Error(`Expected 12 posts, found ${postFiles.length}`);
for (const name of postFiles) {
  const source = fs.readFileSync(path.join("src/content/posts", name), "utf8");
  const { data, content } = matter(source);
  const slug = name.replace(/\.md$/, "");
  assertFile(htmlAt(`/${data.kind}/${slug}/`));
  assertFile(htmlAt(data.legacyPath));
  for (const match of content.matchAll(/!\[[^\]]*\]\((\/images\/posts\/[^)]+)\)/g)) {
    assertFile(match[1]);
  }
}

const researchFiles = fs.readdirSync("src/content/research").filter((name) => name.endsWith(".md"));
if (researchFiles.length !== 2) throw new Error(`Expected 2 research entries, found ${researchFiles.length}`);
for (const name of researchFiles) {
  const { data } = matter.read(path.join("src/content/research", name));
  assertFile(htmlAt(data.legacyPath));
}

for (const artifact of [
  "index.html", "tech/index.html", "memory/index.html", "research/index.html",
  "about/index.html", "en/about/index.html", "search/index.html", "editor/index.html",
  "rss.xml", "robots.txt", "404.html", "pagefind/pagefind.js",
]) assertFile(artifact);

console.log("Verified build artifacts: 12 posts, 2 research entries, compatibility routes, assets, and support pages.");
```

Run `node scripts/verify-build.mjs`.

Expected: prints the exact verification summary and exits 0.

- [ ] **Step 3: Perform browser QA**

Start `npm run preview` and inspect the home page, one long technical article, one memory post, research, search, editor, and 404 at desktop width and 360px. Check light/dark themes, keyboard focus, menu wrapping, code-block overflow, timeline marker shapes, `prefers-reduced-motion`, and browser console errors.

- [ ] **Step 4: Record evidence and fix only observed defects**

Write `docs/migration-report.md` with content counts, route checks, commands and exit results, pages inspected, and any neutral image-alt fallbacks. For every defect, add or tighten a test before implementing the fix, then rerun the relevant focused and full gates.

- [ ] **Step 5: Commit final verified state**

```bash
git add docs/migration-report.md tests src public .github README.md package.json package-lock.json
git commit -m "test: verify Astro migration and responsive experience"
```

Do not push or enable GitHub Pages without explicit user approval. The implementation is complete locally when this final commit is clean and all recorded gates pass.
