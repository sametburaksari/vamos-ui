import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Realtime analytics",
  description:
    "Who is on the website right now: a live visitor count that counts to each new value, visitors per minute for the last 30 minutes, orders and revenue today, a bubble map of cities that filters the activity feed, the pages being viewed, traffic sources and device share. Updates every few seconds with a pause switch.",
  category: "Dashboards",
  order: 150,
  tags: ["site", "cms"],
  files: [
    "dashboard-15/page.tsx",
    "dashboard-15/components/realtime-dashboard.tsx",
    "dashboard-15/components/live-feed.tsx",
    "dashboard-15/components/live-data.ts",
    "_shared/metrics.ts",
    "_shared/geo.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
