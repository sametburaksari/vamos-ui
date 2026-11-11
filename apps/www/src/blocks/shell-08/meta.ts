import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Multi-workspace shell",
  description:
    "For agencies and partner programmes: a strip of workspaces (your agency, each client portal, each partner portal) with ⌘1–5 to switch, the open workspace's own menu beside it, and a banner while staff look inside a portal, with a “view as client” switch that hides agency-only notes. Shown with an agency overview, a client portal with approvals and invoices, and a partner portal with tier progress and deal registration.",
  category: "App shells",
  order: 80,
  tags: ["crm", "ops", "any"],
  files: [
    "shell-08/page.tsx",
    "shell-08/components/workspace-rail.tsx",
    "shell-08/components/agency-home.tsx",
    "shell-08/components/client-portal.tsx",
    "shell-08/components/partner-portal.tsx",
    "shell-08/data.ts",
  ],
};

export default meta;
