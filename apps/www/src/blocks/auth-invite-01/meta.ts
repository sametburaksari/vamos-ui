import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Accept team invite",
  description:
    "Invitation with inviter, personal note, role, teammates, access and expiry beside two ways to join: create a password with live rules, or sign in with an existing account. Decline with confirmation and a welcome screen with first steps.",
  category: "Authentication",
  order: 83,
  tags: ["any", "hr"],
  files: [
    "auth-invite-01/page.tsx",
    "auth-invite-01/components/invite-accept.tsx",
    "auth-invite-01/components/data.ts",
    "login-02/components/password-input.tsx",
    "auth-2fa-setup-01/components/kiln-brand.tsx",
  ],
};

export default meta;
