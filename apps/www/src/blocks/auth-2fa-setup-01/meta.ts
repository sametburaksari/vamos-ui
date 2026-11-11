import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Two-step verification setup",
  description:
    "TOTP enrolment in three steps: scan a QR code (or type the grouped setup key), verify a 6-digit code against the live 30-second window, then save one-time backup codes before turning it on.",
  category: "Authentication",
  order: 80,
  tags: ["any", "security"],
  files: [
    "auth-2fa-setup-01/page.tsx",
    "auth-2fa-setup-01/components/two-factor-setup.tsx",
    "auth-2fa-setup-01/components/data.ts",
    "auth-2fa-setup-01/components/kiln-brand.tsx",
    "auth-2fa-setup-01/components/cancel-link.tsx",
  ],
};

export default meta;
