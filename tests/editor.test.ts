import { expect, it } from "vitest";
import { createPostDocument, postFilename } from "../src/lib/editor";

it("generates schema-ready frontmatter without network metadata", () => {
  const result = createPostDocument({ title: "新的记忆", description: "一段准备发布的个人记忆。", publishDate: "2026-08-06", kind: "memory", tags: ["生活"], body: "正文" });
  expect(result).toContain("kind: memory");
  expect(result).toContain("tags:\n  - 生活");
  expect(result).toContain("\n---\n\n正文\n");
  expect(result).not.toMatch(/token|github api/i);
  expect(postFilename("新的记忆", "2026-08-06")).toBe("2026-08-06-新的记忆.md");
});
