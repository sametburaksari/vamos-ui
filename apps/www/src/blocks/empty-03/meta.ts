import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "First run with templates",
  description:
    "A Projects app on its first day: pick a template (phases drawn to scale, tasks and roles), name it and choose a client; or import a CSV/Excel file with column matching; or load sample data that is marked everywhere and removed in one click (with confirm and undo). Once something exists the list takes over.",
  category: "Empty & error states",
  order: 30,
  tags: ["ops", "any"],
  files: [
    "empty-03/page.tsx",
    "empty-03/components/projects-app.tsx",
    "empty-03/components/first-run.tsx",
    "empty-03/components/data.ts",
    "_shared/projects.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
