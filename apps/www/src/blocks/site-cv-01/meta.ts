import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Personal site and CV",
  description:
    "One-page personal site for an engineer — sticky identity column, experience timeline, projects, writing, skills and contact — plus a printable CV page. “Download PDF” prints a print-perfect A4 sheet; printing any page prints only the CV. Built on SiteShell (scoped accent, EN / TR, inner pages).",
  category: "Website pages",
  order: 41,
  tags: ["site"],
  files: [
    "site-cv-01/page.tsx",
    "site-cv-01/components/cv-site.tsx",
    "site-cv-01/components/cv-sheet.tsx",
    "site-cv-01/components/cv-page.tsx",
    "site-cv-01/components/print-button.tsx",
    "site-cv-01/components/content.ts",
  ],
};

export default meta;
