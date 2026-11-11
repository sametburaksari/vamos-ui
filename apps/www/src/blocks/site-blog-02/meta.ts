import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Engineering blog site",
  description:
    "Independent engineering blog, dark by default: a plain-text masthead beside the latest post shown as code, a keyboard-first post index (/ to filter, j / k to move), topics and authors; an article whose Go / Rust / TypeScript samples all switch language together, and an archive by year and tag. Built on SiteShell (scoped amber accent, system type, EN / TR, inner pages, light mode switch).",
  category: "Website pages",
  order: 46,
  tags: ["site"],
  files: [
    "site-blog-02/page.tsx",
    "site-blog-02/components/blog-site.tsx",
    "site-blog-02/components/blog-frame.tsx",
    "site-blog-02/components/home-page.tsx",
    "site-blog-02/components/article-page.tsx",
    "site-blog-02/components/archive-page.tsx",
    "site-blog-02/components/post-index.tsx",
    "site-blog-02/components/code-sample.tsx",
    "site-blog-02/components/subscribe-form.tsx",
    "site-blog-02/components/content.ts",
  ],
};

export default meta;
