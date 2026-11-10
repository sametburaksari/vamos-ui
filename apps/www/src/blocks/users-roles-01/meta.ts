import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Users & roles",
  description: "Members Data Table with role and status badges, bulk suspend/remove with undo, an invite dialog with email validation, and a resource × action permission matrix per role.",
  category: "Settings & forms",
  order: 30,
  tags: ["any"],
  files: [
    "users-roles-01/page.tsx",
    "users-roles-01/components/users-roles.tsx",
    "users-roles-01/components/members-table.tsx",
    "users-roles-01/components/roles-panel.tsx",
    "users-roles-01/components/permission-matrix.tsx",
    "users-roles-01/components/invite-dialog.tsx",
    "users-roles-01/components/data.ts",
    "settings-01/components/workspace-shell.tsx",
    "settings-01/components/nav.tsx",
  ],
};

export default meta;
