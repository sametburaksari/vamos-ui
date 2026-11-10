import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Workspace & app chooser",
  description: "After sign-in: searchable workspace list with role, members, plan and last visit, a pending invitation to accept, then an app picker (Site, CRM, People, Work) for the chosen workspace.",
  category: "Authentication",
  order: 70,
  tags: ["any"],
  files: [
    "select-workspace-01/page.tsx",
    "select-workspace-01/components/workspace-chooser.tsx",
    "select-workspace-01/components/data.ts",
    "login-02/components/auth-frame.tsx",
  ],
};

export default meta;
