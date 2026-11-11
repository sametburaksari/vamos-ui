import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Notification preferences",
  description:
    "Personal notification settings: an events × channels matrix grouped by area, with tri-state column toggles, locked and unavailable cells that explain themselves and an SMS column that unlocks after phone verification by code. Picking an event previews it as a push, email, SMS and in-app message; quiet hours sit on a 24-hour rail with urgent pass-through, email can be bundled into digests, notifications can be paused, and changes collect in a save bar.",
  category: "Settings & forms",
  order: 50,
  tags: ["any"],
  files: [
    "settings-05/page.tsx",
    "settings-05/components/notification-settings.tsx",
    "settings-05/components/channel-matrix.tsx",
    "settings-05/components/message-preview.tsx",
    "settings-05/components/delivery-rules.tsx",
    "settings-05/components/notify-data.ts",
    "settings-03/components/settings-frame.tsx",
    "detail-04/components/admin-shell.tsx",
  ],
};

export default meta;
