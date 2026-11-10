import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Welcome wizard",
  description: "First-run wizard: workspace name and address, apps to start with, team invites (skippable), accent and type pairing — with a live preview panel and a ready screen.",
  category: "Onboarding",
  order: 20,
  tags: ["any"],
  files: [
    "onboarding-02/page.tsx",
    "onboarding-02/components/welcome-wizard.tsx",
    "onboarding-02/components/workspace-preview.tsx",
    "onboarding-02/components/data.ts",
  ],
};

export default meta;
