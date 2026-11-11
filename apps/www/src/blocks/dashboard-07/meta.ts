import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Team pulse",
  description:
    "HR overview: headcount over twelve months with hires and leavers, the split by department, eNPS with its promoter/detractor balance and comment themes, a three-week who's-out calendar with leave approvals (decline asks for a reason, both undo), and a hiring board for open roles.",
  category: "Dashboards",
  order: 70,
  tags: ["hr"],
  files: [
    "dashboard-07/page.tsx",
    "dashboard-07/components/people-dashboard.tsx",
    "dashboard-07/components/headcount-card.tsx",
    "dashboard-07/components/enps-card.tsx",
    "dashboard-07/components/leave-board.tsx",
    "dashboard-07/components/open-roles.tsx",
    "dashboard-07/components/data.ts",
    "_shared/hr.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
