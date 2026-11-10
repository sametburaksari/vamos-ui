import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Sign in with SSO",
  description: "Centred sign-in card: Google, Microsoft, GitHub and SAML SSO above email + password, show/hide toggle, remember me, attempt-limit error.",
  category: "Authentication",
  order: 20,
  tags: ["any"],
  files: [
    "login-02/page.tsx",
    "login-02/components/sign-in-form.tsx",
    "login-02/components/password-input.tsx",
    "login-02/components/sso-icons.tsx",
    "login-02/components/auth-frame.tsx",
  ],
};

export default meta;
