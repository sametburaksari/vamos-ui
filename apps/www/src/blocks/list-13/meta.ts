import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Tasks: list, board, calendar",
  description:
    "One task set, three views that share search, project and “assigned to me” filters: a due-date list (overdue, today, next 7 days, later, done) with one-click complete and undo, a status board with drag, keyboard moves and WIP limits, and a month calendar where dragging a task reschedules it and clicking a day creates one. A details sheet edits status, priority, assignee and due date in place; the chosen view is remembered.",
  category: "List pages",
  order: 130,
  tags: ["ops", "any"],
  files: [
    "list-13/page.tsx",
    "list-13/components/tasks-view.tsx",
    "list-13/components/task-views.tsx",
    "list-13/components/task-dialogs.tsx",
    "list-13/components/task-parts.tsx",
    "list-13/components/tasks-data.ts",
    "_shared/projects.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
