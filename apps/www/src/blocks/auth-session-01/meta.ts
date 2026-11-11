import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Session expired",
  description:
    "Re-authentication dialog over the running app after an idle timeout: can’t be dismissed, shows who is signed in, keeps the unsaved work, password or passkey to continue, and a switch-account escape hatch.",
  category: "Authentication",
  order: 85,
  tags: ["any", "security"],
  files: [
    "auth-session-01/page.tsx",
    "auth-session-01/components/session-expired.tsx",
    "auth-session-01/components/data.ts",
    "login-02/components/password-input.tsx",
    "auth-2fa-setup-01/components/kiln-brand.tsx",
  ],
};

export default meta;
