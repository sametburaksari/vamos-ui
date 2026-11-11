import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Sales forecast",
  description:
    "Quarter forecast for a CRM: one bar from closed-won through commit and best case to pipeline against the quota, open pipeline per stage with stalled deals, win rate with loss reasons, a rep leaderboard that scopes the page, and a deal sheet that moves stages with undo.",
  category: "Dashboards",
  order: 60,
  tags: ["crm"],
  files: [
    "dashboard-06/page.tsx",
    "dashboard-06/components/forecast-dashboard.tsx",
    "dashboard-06/components/forecast-hero.tsx",
    "dashboard-06/components/stage-lanes.tsx",
    "dashboard-06/components/win-rate.tsx",
    "dashboard-06/components/deals-table.tsx",
    "dashboard-06/components/leaderboard.tsx",
    "dashboard-06/components/data.ts",
    "dashboard-06/components/live-count.tsx",
    "_shared/deals.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
