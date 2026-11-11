import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Project overview",
  description:
    "A client project at a glance, with a switcher across the portfolio: completion against time used, budget burn, due date and open tasks; a schedule line from start to due with today and numbered milestones you can close; weekly spend against an even plan with the budget line and a forecast at completion; tasks with filters and undoable completion; the team's booked hours against capacity, risks by impact, files and an activity feed fed by status updates you post from a dialog.",
  category: "Detail pages",
  order: 100,
  tags: ["ops", "any"],
  files: [
    "detail-10/page.tsx",
    "detail-10/components/project-overview.tsx",
    "detail-10/components/milestone-rail.tsx",
    "detail-10/components/budget-card.tsx",
    "detail-10/components/task-panel.tsx",
    "detail-10/components/data.ts",
    "_shared/projects.ts",
    "_shared/people.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
