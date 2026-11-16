import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "News website",
  description:
    "A daily newspaper: top bar with date, weather and a sign-in / password-recovery dialog, masthead with mega menus that preview each section’s latest stories, a pausable trending ticker, the lead grid, a tabbed “Don’t miss” module with a More menu, section modules in five layouts, consent-aware ad slots, latest stories with numbered pagination and a sticky sidebar (follow counts, most read, comments, editor’s picks, sections). Plus a section front and a story page. EN / TR.",
  category: "Website pages",
  order: 41,
  tags: ["site", "cms"],
  files: [
    "site-news-01/page.tsx",
    "site-news-01/components/news-site.tsx",
    "site-news-01/components/home-page.tsx",
    "site-news-01/components/category-page.tsx",
    "site-news-01/components/article-page.tsx",
    "site-news-01/components/top-bar.tsx",
    "site-news-01/components/masthead.tsx",
    "site-news-01/components/house-ad.tsx",
    "site-news-01/components/content.ts",
  ],
};

export default meta;
