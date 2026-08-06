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
