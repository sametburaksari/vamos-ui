import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "API keys & webhooks",
  description:
    "Developer settings: API keys with live/test filter, 14-day traffic bars, owner and expiry; a create dialog with a resource × read/write scope grid and a secret shown once behind a “stored it” check; roll, edit and revoke with typed confirmation and undo. Webhook endpoints with a 24-hour health strip and pause switch, and a delivery log with failed filter, payload/headers/response sheet and optimistic redelivery.",
  category: "Settings & forms",
  order: 40,
  tags: ["any", "ops"],
  files: [
    "settings-04/page.tsx",
    "settings-04/components/developer-settings.tsx",
    "settings-04/components/api-keys.tsx",
    "settings-04/components/webhooks.tsx",
    "settings-04/components/developer-data.ts",
    "settings-03/components/settings-frame.tsx",
    "detail-04/components/admin-shell.tsx",
  ],
};

export default meta;
