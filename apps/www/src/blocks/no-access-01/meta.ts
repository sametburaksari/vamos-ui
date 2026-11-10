import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "No permission",
  description:
    "Access denied inside the shell: says which roles can see the page and which one you have, lists the admins, and lets you request access with a reason.",
  category: "Empty & error states",
  order: 60,
  tags: ["any", "ops"],
  files: [
    "no-access-01/page.tsx",
    "no-access-01/components/no-access.tsx",
    "shell-01/page.tsx",
    "shell-01/components/app-sidebar.tsx",
    "shell-01/components/nav.ts",
    "shell-01/components/top-bar.tsx",
  ],
};

export default meta;
