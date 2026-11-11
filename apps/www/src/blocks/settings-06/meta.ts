import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Integrations marketplace",
  description:
    "Connected integrations with sync health and records today, a failing one surfaced with reconnect, and a searchable directory by category. Connect asks for a key and shows the permissions requested; a side panel configures what syncs and how often, shows the sync log and access, runs a manual sync, and disconnects with undo.",
  category: "Settings & forms",
  order: 60,
  tags: ["any", "ops", "site"],
  files: [
    "settings-06/page.tsx",
    "settings-06/components/integrations-marketplace.tsx",
    "settings-06/components/integration-sheet.tsx",
    "settings-06/components/connect-dialog.tsx",
    "settings-06/components/integration-mark.tsx",
    "settings-06/components/data.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
