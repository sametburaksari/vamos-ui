import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Magazine website",
  description:
    "A quarterly of essays on cities and design: issue masthead with contents, lead story, latest essays with topic chips, most read, editor’s letter and newsletter; an essay page with a reading-progress bar and footnotes that become side notes on wide screens; and an archive filtered by topic, writer or search. EN / TR.",
  category: "Website pages",
  order: 41,
  tags: ["site"],
  files: [
    "site-blog-01/page.tsx",
    "site-blog-01/components/blog-site.tsx",
    "site-blog-01/components/home-page.tsx",
    "site-blog-01/components/article-page.tsx",
    "site-blog-01/components/article-body.tsx",
    "site-blog-01/components/archive-page.tsx",
    "site-blog-01/components/newsletter.tsx",
    "site-blog-01/components/content.ts",
  ],
};

export default meta;
