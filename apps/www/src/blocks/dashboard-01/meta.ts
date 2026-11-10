import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Site dashboard",
  description: "KPIs with sparklines, traffic chart, quick draft, recent posts and an activity feed — inside the multi-app shell.",
  category: "Dashboards",
  order: 10,
  tags: ["cms"],
  files: ["dashboard-01/page.tsx", "dashboard-01/components/dashboard.tsx", "dashboard-01/components/traffic-chart.tsx", "dashboard-01/components/sparkline.tsx", "shell-01/page.tsx", "shell-01/components/app-sidebar.tsx", "shell-01/components/nav.ts", "shell-01/components/top-bar.tsx"],
};

export default meta;
