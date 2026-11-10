import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Sales dashboard",
  description: "Pipeline KPIs, a stage funnel with deal value, rep leaderboard, deals closing this month with filters and a dated activity feed — inside the multi-app shell.",
  category: "Dashboards",
  order: 20,
  tags: ["crm"],
  files: [
    "dashboard-02/page.tsx",
    "dashboard-02/components/sales-dashboard.tsx",
    "dashboard-02/components/deals-table.tsx",
    "dashboard-02/components/data.tsx",
    "shell-01/page.tsx",
    "shell-01/components/app-sidebar.tsx",
    "shell-01/components/nav.ts",
    "shell-01/components/top-bar.tsx",
  ],
};

export default meta;
