import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Projects & billing dashboard",
  description: "Delivery KPIs, hours tracked per day against capacity, per-person load, project status with budget burn, and receivables aging with recent invoices.",
  category: "Dashboards",
  order: 40,
  tags: ["ops"],
  files: [
    "dashboard-04/page.tsx",
    "dashboard-04/components/work-dashboard.tsx",
    "dashboard-04/components/projects-table.tsx",
    "dashboard-04/components/data.ts",
    "shell-01/page.tsx",
    "shell-01/components/app-sidebar.tsx",
    "shell-01/components/nav.ts",
    "shell-01/components/top-bar.tsx",
  ],
};

export default meta;
