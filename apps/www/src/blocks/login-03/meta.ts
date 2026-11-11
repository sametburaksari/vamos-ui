import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Sign in with product story",
  description:
    "Split-screen sign-in: the product told in three switchable chapters (orders, stock, support) with a counted-up number, trend line and overnight log; Google / Microsoft buttons, then an email-first flow with a separate password step.",
  category: "Authentication",
  order: 15,
  tags: ["any", "ops"],
  files: [
    "login-03/page.tsx",
    "login-03/components/product-story.tsx",
    "login-03/components/email-first-sign-in.tsx",
    "login-03/components/legal-footer.tsx",
    "login-03/components/data.ts",
    "login-02/components/password-input.tsx",
    "login-02/components/sso-icons.tsx",
    "auth-2fa-setup-01/components/kiln-brand.tsx",
  ],
};

export default meta;
