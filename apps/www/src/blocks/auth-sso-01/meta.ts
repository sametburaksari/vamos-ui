import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Single sign-on lookup",
  description:
    "Find your organisation by work-email domain with a live lookup readout, or by organisation ID; recent organisations, a no-match path with a copyable note for IT, and a staged redirect to the identity provider.",
  category: "Authentication",
  order: 82,
  tags: ["any", "security"],
  files: [
    "auth-sso-01/page.tsx",
    "auth-sso-01/components/sso-finder.tsx",
    "auth-sso-01/components/how-it-works.tsx",
    "auth-sso-01/components/data.ts",
    "auth-2fa-setup-01/components/kiln-brand.tsx",
  ],
};

export default meta;
