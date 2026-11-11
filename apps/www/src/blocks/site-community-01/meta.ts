import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Community forum site",
  description:
    "Forum home for a makers' community: a compact header with live counters, a topic list with activity (participants, replies, views, a 14-day sparkline per topic, latest / hot / top / unanswered), category, meetup and top-helper panels; all topics with a category rail and paging; a solved thread with likes, quoting and a reply box. System fonts, compact. Built on SiteShell (scoped accent, EN / TR, inner pages).",
  category: "Website pages",
  order: 97,
  tags: ["site"],
  files: [
    "site-community-01/page.tsx",
    "site-community-01/components/community-site.tsx",
    "site-community-01/components/topic-list.tsx",
    "site-community-01/components/thread-page.tsx",
    "site-community-01/components/thread-posts.tsx",
    "site-community-01/components/circle-mark.tsx",
    "site-community-01/components/content.ts",
  ],
};

export default meta;
