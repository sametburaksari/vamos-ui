import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Store dashboard",
  description: "E-commerce KPIs, revenue with a 7/30/90-day switch and previous-period comparison, sales by channel, recent orders, top products with weekly trends and the checkout funnel.",
  category: "Dashboards",
  order: 50,
  tags: ["site"],
  files: [
    "dashboard-05/page.tsx",
    "dashboard-05/components/store-dashboard.tsx",
    "dashboard-05/components/revenue-card.tsx",
    "dashboard-05/components/data.ts",
    "shell-01/page.tsx",
    "shell-01/components/app-sidebar.tsx",
    "shell-01/components/nav.ts",
    "shell-01/components/top-bar.tsx",
  ],
};

export default meta;
