import fs from "node:fs";
import YAML from "yaml";
import { describe, expect, it } from "vitest";
import { siteConfig } from "../src/site.config";

describe("siteConfig", () => {
  it("defines the approved public navigation", () => {
    expect(siteConfig.navigation.map((item) => item.href)).toEqual([
      "/",
      "/tech/",
      "/memory/",
      "/research/",
      "/about/",
    ]);
  });

  it("uses the production GitHub Pages URL", () => {
    expect(siteConfig.url).toBe("https://zhaoyiheng2886.github.io");
  });
});

describe("deployment", () => {
  it("uses the official GitHub Pages artifact flow", () => {
    const workflow = YAML.parse(fs.readFileSync(".github/workflows/deploy.yml", "utf8"));
    expect(workflow.permissions).toMatchObject({ pages: "write", "id-token": "write" });
    const build = workflow.jobs.build.steps.map((step: { uses?: string; run?: string }) => step.uses ?? step.run);
    expect(build).toEqual(expect.arrayContaining([expect.stringContaining("actions/configure-pages@"), expect.stringContaining("actions/upload-pages-artifact@"), "npm ci", "npm test", "npm run check", "npm run build"]));
    expect(workflow.jobs.deploy.steps[0].uses).toContain("actions/deploy-pages@");
  });
});
