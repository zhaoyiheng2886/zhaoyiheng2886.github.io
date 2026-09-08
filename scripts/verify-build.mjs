import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const assertFile = (relative) => {
  const target = path.join("dist", relative.replace(/^\//, ""));
  if (!fs.existsSync(target)) throw new Error(`Missing build artifact: ${relative}`);
};
const htmlAt = (route) => `${route.replace(/^\//, "").replace(/\/?$/, "/")}index.html`;

const postFiles = fs.readdirSync("src/content/posts").filter((name) => name.endsWith(".md"));
for (const name of postFiles) {
  const { data, content } = matter.read(path.join("src/content/posts", name));
  const slug = name.replace(/\.md$/, "");
  assertFile(htmlAt(`/${data.kind}/${slug}/`));
  if (data.legacyPath) assertFile(htmlAt(data.legacyPath));
  for (const match of content.matchAll(/!\[[^\]]*\]\((\/images\/posts\/[^)]+)\)/g)) assertFile(match[1]);
  assertFile(`og/${slug}.png`);
}

const researchFiles = fs.readdirSync("src/content/research").filter((name) => name.endsWith(".md"));
if (researchFiles.length !== 2) throw new Error(`Expected 2 research entries, found ${researchFiles.length}`);
for (const name of researchFiles) {
  const { data } = matter.read(path.join("src/content/research", name));
  assertFile(htmlAt(data.legacyPath));
}

for (const artifact of ["index.html", "tech/index.html", "memory/index.html", "research/index.html", "about/index.html", "en/about/index.html", "search/index.html", "editor/index.html", "rss.xml", "robots.txt", "404.html", "pagefind/pagefind.js"]) assertFile(artifact);

console.log(`Verified build artifacts: ${postFiles.length} posts, 2 research entries, compatibility routes, assets, and support pages.`);
