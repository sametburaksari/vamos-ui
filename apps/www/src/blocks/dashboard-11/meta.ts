import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Project portfolio",
  description:
    "Agency delivery portfolio: a burn map that plots budget used against work done for every project, portfolio budget, spend and forecast at completion, a project list with health, burn bars and the next milestone, a side sheet to change health, tick off milestones and log risks, a milestone runway across nine weeks and a risk register you can resolve in place (all with undo).",
  category: "Dashboards",
  order: 110,
  tags: ["ops", "any"],
  files: [
    "dashboard-11/page.tsx",
    "dashboard-11/components/portfolio-dashboard.tsx",
    "dashboard-11/components/burn-map.tsx",
    "dashboard-11/components/project-list.tsx",
    "dashboard-11/components/project-sheet.tsx",
    "dashboard-11/components/runway-risks.tsx",
    "dashboard-11/components/data.ts",
    "_shared/projects.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
