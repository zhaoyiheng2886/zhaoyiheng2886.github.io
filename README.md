# zhaoyiheng2886.github.io

赵以恒的个人主页：技术文章、人生记录与研究工作，基于 Astro 构建。

## 本地开发

```bash
npm ci
npm run dev
```

完整检查：

```bash
npm test
npm run check
npm run build
node scripts/verify-build.mjs
```

文章位于 `src/content/posts/`，研究条目位于 `src/content/research/`。隐藏的本地 Markdown 编辑器位于 `/editor/`；它只生成下载文件，不保存 Token，也不调用 GitHub API。

推送到 `master` 后，GitHub Actions 会构建 `dist/` 并部署到 GitHub Pages。原 Jekyll 文章地址通过静态兼容页跳转到新的 `/tech/` 或 `/memory/` 地址。
