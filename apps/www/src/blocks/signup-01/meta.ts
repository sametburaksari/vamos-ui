import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Sign up with password strength",
  description: "Trial sign-up: SSO shortcuts, name / company / work email, live password strength meter with rule checklist, terms consent and a what’s-included column.",
  category: "Authentication",
  order: 30,
  tags: ["any", "crm"],
  files: [
    "signup-01/page.tsx",
    "signup-01/components/sign-up-form.tsx",
    "signup-01/components/password-strength.tsx",
    "login-02/components/password-input.tsx",
    "login-02/components/sso-icons.tsx",
    "login-02/components/auth-frame.tsx",
  ],
};

export default meta;
