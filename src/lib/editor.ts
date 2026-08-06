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
  return ["---", `title: ${yamlString(input.title)}`, `description: ${yamlString(input.description)}`, `publishDate: ${input.publishDate}`, `kind: ${input.kind}`, "tags:", tags, "draft: false", "---", "", input.body.trim(), ""].join("\n");
}

export function postFilename(title: string, date: string): string {
  const ascii = title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
  return `${date}-${ascii || encodeURIComponent(title.trim()).replace(/%/g, "")}.md`;
}

export function downloadPost(filename: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
