import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Two-step verification",
  description: "Second factor after sign-in: authenticator or SMS code with Input OTP (auto-submit, verifying, wrong-code states), resend countdown, recovery code and trust-this-browser.",
  category: "Authentication",
  order: 50,
  tags: ["any"],
  files: ["otp-01/page.tsx", "otp-01/components/two-factor-form.tsx", "login-02/components/auth-frame.tsx"],
};

export default meta;
