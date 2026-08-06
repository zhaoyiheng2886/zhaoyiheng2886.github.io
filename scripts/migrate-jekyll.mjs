import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const postsSource = path.join(root, "_posts");
const researchSource = path.join(root, "_publications");
const postsTarget = path.join(root, "src/content/posts");
const researchTarget = path.join(root, "src/content/research");

const resetDir = (directory) => {
  fs.rmSync(directory, { recursive: true, force: true });
  fs.mkdirSync(directory, { recursive: true });
};

const descriptionFrom = (body) => body
  .split(/\n\s*\n/)
  .map((part) => part
    .replace(/^#+\s+.*$/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/^[-*>]\s+/, "")
    .replace(/^\d+\.\s+/, "")
    .trim())
  .find((part) => part && !part.startsWith("```"))
  ?.replace(/\s+/g, " ")
  .slice(0, 160) || "赵以恒的个人记录。";

resetDir(postsTarget);
resetDir(researchTarget);

const altFallbacks = [];
for (const filename of fs.readdirSync(postsSource).filter((name) => name.endsWith(".md")).sort()) {
  const source = matter.read(path.join(postsSource, filename));
  const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
  const body = source.content.replace(/!\[\]\((\/images\/posts\/[^)]+)\)/g, (_, imagePath) => {
    altFallbacks.push(`${slug}.md — ${imagePath}`);
    return `![文章配图](${imagePath})`;
  }).trimStart();
  const output = matter.stringify(body, {
    title: String(source.data.title).trim(),
    description: descriptionFrom(body),
    publishDate: source.data.date,
    kind: filename.includes("找暑期实习") ? "memory" : "tech",
    tags: Array.isArray(source.data.tags) ? source.data.tags : [],
    draft: false,
    legacyPath: source.data.permalink,
  });
  fs.writeFileSync(path.join(postsTarget, `${slug}.md`), output);
}

const researchMetadata = {
  "2026-03-24-siss.md": {
    description: "Scale-Induced Semantic Shift in Visual Prompt Injection Against VLMs and Web Agents.",
    authors: ["Zhao, Y-H.", "et al."],
    venue: "ACM MM 2026",
    status: "Submitted",
  },
  "2026-03-24-dherbk-for-ckd.md": {
    description: "Knowledge base of diet and toxic herbal medicines for clinical support of chronic kidney disease.",
    authors: ["Wang, H-Y.", "Yuan, C.", "Zhao, Y-H.", "et al."],
    venue: "Journal of Translational Medicine",
    status: "Accepted",
  },
};

for (const filename of fs.readdirSync(researchSource).filter((name) => name.endsWith(".md")).sort()) {
  const source = matter.read(path.join(researchSource, filename));
  const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
  const metadata = researchMetadata[filename];
  if (!metadata) throw new Error(`Missing research metadata for ${filename}`);
  fs.writeFileSync(path.join(researchTarget, `${slug}.md`), matter.stringify(source.content.trimStart(), {
    title: String(source.data.title).trim(),
    description: metadata.description,
    date: source.data.date,
    authors: metadata.authors,
    venue: metadata.venue,
    status: metadata.status,
    legacyPath: source.data.permalink,
  }));
}

fs.mkdirSync(path.join(root, "src/content/moments"), { recursive: true });
fs.writeFileSync(path.join(root, "src/content/moments/.gitkeep"), "");
fs.mkdirSync(path.join(root, "public/images"), { recursive: true });
fs.cpSync(path.join(root, "images/posts"), path.join(root, "public/images/posts"), { recursive: true });
fs.copyFileSync(path.join(root, "images/profile.png"), path.join(root, "public/images/profile.png"));
for (const icon of ["favicon.ico", "favicon.svg", "apple-touch-icon-180x180.png"]) {
  fs.copyFileSync(path.join(root, "images", icon), path.join(root, "public", icon));
}
fs.cpSync(path.join(root, "files"), path.join(root, "public/files"), { recursive: true });

const report = [
  "# Astro migration report",
  "",
  "- Posts: 12 (8 tech, 4 memory)",
  "- Research entries: 2",
  "- Moments: 0 (no additional autobiographical material supplied)",
  "",
  "## Neutral image alt fallbacks",
  "",
  ...altFallbacks.map((item) => `- ${item}`),
  "",
].join("\n");
fs.writeFileSync(path.join(root, "docs/migration-report.md"), report);

console.log("Migrated 12 posts, 2 research entries, and referenced public assets.");
