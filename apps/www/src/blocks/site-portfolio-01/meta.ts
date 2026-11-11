import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Photographer portfolio",
  description:
    "Portfolio for an independent photographer: the name as the hero, a discipline filter over a masonry wall with a lightbox, a project index that previews each cover beside the cursor, a case story per project and an about + contact page. Built on SiteShell (scoped accent, EN / TR, inner pages).",
  category: "Website pages",
  order: 40,
  tags: ["site"],
  files: [
    "site-portfolio-01/page.tsx",
    "site-portfolio-01/components/portfolio-site.tsx",
    "site-portfolio-01/components/work-index.tsx",
    "site-portfolio-01/components/work-grid.tsx",
    "site-portfolio-01/components/project-page.tsx",
    "site-portfolio-01/components/about-page.tsx",
    "site-portfolio-01/components/content.ts",
  ],
};

export default meta;
