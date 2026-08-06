import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";

import { siteConfig } from "./src/site.config";

export default defineConfig({
  site: siteConfig.url,
  integrations: [expressiveCode(), mdx(), sitemap()],
});
