import { Resvg } from "@resvg/resvg-js";
import { getCollection } from "astro:content";
const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]!);
export async function getStaticPaths() {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}
export function GET({ props }: { props: { post: { data: { title: string; kind: string; publishDate: Date } } } }) {
  const { post } = props;
  const title = escapeXml(post.data.title.length > 42 ? `${post.data.title.slice(0, 42)}…` : post.data.title);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#F4F5F2"/><rect x="80" y="76" width="14" height="478" fill="#5877D8"/><text x="130" y="150" fill="#69707B" font-family="monospace" font-size="28">${post.data.kind.toUpperCase()} · ${post.data.publishDate.toISOString().slice(0, 10)}</text><text x="130" y="270" fill="#15181D" font-family="serif" font-size="54" font-weight="600">${title}</text><text x="130" y="510" fill="#15181D" font-family="monospace" font-size="28">赵以恒 / Zhao Yiheng</text></svg>`;
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  return new Response(png as unknown as BodyInit, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" } });
}
