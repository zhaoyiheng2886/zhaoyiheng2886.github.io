import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getPublishedPosts } from "../lib/content";
import { siteConfig } from "../site.config";
export async function GET(context: { site?: URL }) {
  const posts = getPublishedPosts(await getCollection("posts"));
  return rss({ title: siteConfig.title, description: siteConfig.description, site: context.site!, items: posts.map((post) => ({ title: post.data.title, description: post.data.description, pubDate: post.data.publishDate, link: `/${post.data.kind}/${post.id}/` })) });
}
