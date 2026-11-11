import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Account locked",
  description:
    "Lockout after too many wrong passwords: a live countdown with a draining bar, the failed attempts with city and IP, and an unlock flow — emailed 6-digit code, resend timer, new password that signs out other sessions.",
  category: "Authentication",
  order: 84,
  tags: ["any", "security"],
  files: [
    "auth-locked-01/page.tsx",
    "auth-locked-01/components/locked-account.tsx",
    "auth-locked-01/components/data.ts",
    "login-02/components/password-input.tsx",
    "auth-2fa-setup-01/components/kiln-brand.tsx",
  ],
};

export default meta;
