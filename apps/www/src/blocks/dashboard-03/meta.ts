import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "People dashboard",
  description: "Headcount and attrition KPIs, headcount by department, employment mix, a two-week leave calendar, birthdays and work anniversaries, and open positions.",
  category: "Dashboards",
  order: 30,
  tags: ["hr"],
  files: [
    "dashboard-03/page.tsx",
    "dashboard-03/components/people-dashboard.tsx",
    "dashboard-03/components/leave-strip.tsx",
    "dashboard-03/components/data.ts",
    "shell-01/page.tsx",
    "shell-01/components/app-sidebar.tsx",
    "shell-01/components/nav.ts",
    "shell-01/components/top-bar.tsx",
  ],
};

export default meta;
