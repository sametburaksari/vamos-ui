import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Workspace settings",
  description: "General settings with section nav and scroll-spy, label | control rows, validation, a save bar with ⌘S, and a danger zone with typed confirmation.",
  category: "Settings & forms",
  order: 10,
  tags: ["any"],
  files: [
    "settings-01/page.tsx",
    "settings-01/components/workspace-settings.tsx",
    "settings-01/components/data.ts",
    "settings-01/components/workspace-shell.tsx",
    "settings-01/components/nav.tsx",
  ],
};

export default meta;
