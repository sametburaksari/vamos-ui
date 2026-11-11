import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Passkey sign-in",
  description:
    "Password-free sign-in with a passkey ceremony (waiting, verifying, cancelled, done), then the account’s passkey list: add one for this device in a dialog, rename inline, remove with confirmation and undo.",
  category: "Authentication",
  order: 81,
  tags: ["any", "security"],
  files: [
    "auth-passkey-01/page.tsx",
    "auth-passkey-01/components/passkey-flow.tsx",
    "auth-passkey-01/components/passkey-sensor.tsx",
    "auth-passkey-01/components/data.ts",
    "auth-2fa-setup-01/components/kiln-brand.tsx",
  ],
};

export default meta;
