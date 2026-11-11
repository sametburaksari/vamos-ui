import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Security & sessions",
  description:
    "Account security with a posture score that updates as you fix things: authenticator app with QR enrolment and code check, passkeys, SMS disabled by policy, backup codes with regenerate; signed-in devices with unrecognised ones flagged and sign-out (one, or all others) with undo; sign-in history with a failed filter and Block IP; an IP allow list with CIDR validation and a lock-out guard.",
  category: "Settings & forms",
  order: 70,
  tags: ["any"],
  files: [
    "settings-07/page.tsx",
    "settings-07/components/security-center.tsx",
    "settings-07/components/two-factor-card.tsx",
    "settings-07/components/sessions-card.tsx",
    "settings-07/components/allow-list-card.tsx",
    "settings-07/components/data.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
