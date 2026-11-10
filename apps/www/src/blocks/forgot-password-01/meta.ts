import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Forgot & reset password",
  description: "Four-step recovery in one column: request a link, inbox state with email preview, new password with strength meter, signed-out-elsewhere confirmation.",
  category: "Authentication",
  order: 40,
  tags: ["any"],
  files: [
    "forgot-password-01/page.tsx",
    "forgot-password-01/components/reset-flow.tsx",
    "signup-01/components/password-strength.tsx",
    "login-02/components/password-input.tsx",
    "login-02/components/auth-frame.tsx",
  ],
};

export default meta;
