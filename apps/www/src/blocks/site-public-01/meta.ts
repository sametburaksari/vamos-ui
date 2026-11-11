import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Public office site",
  description:
    "District public office: an accessibility toolbar (text size, high contrast, underlined links) that re-tunes the whole site through tokens, a task-first hero with desk waiting times, most requested tasks, dated announcements, monthly figures and an accessibility statement; a searchable services A–Z and a roadworks announcement. System fonts, AAA text contrast. Built on SiteShell (scoped accent, EN / TR, inner pages).",
  category: "Website pages",
  order: 95,
  tags: ["site"],
  files: [
    "site-public-01/page.tsx",
    "site-public-01/components/public-site.tsx",
    "site-public-01/components/a11y.tsx",
    "site-public-01/components/services-page.tsx",
    "site-public-01/components/service-finder.tsx",
    "site-public-01/components/announcement-page.tsx",
    "site-public-01/components/district-mark.tsx",
    "site-public-01/components/content.ts",
  ],
};

export default meta;
