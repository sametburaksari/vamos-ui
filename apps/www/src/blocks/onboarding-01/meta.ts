import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Setup checklist",
  description: "Getting-started dashboard: a staged setup guide with progress ring and time left, first-week tasks with assignees, trial status and help links.",
  category: "Onboarding",
  order: 10,
  tags: ["any"],
  files: [
    "onboarding-01/page.tsx",
    "onboarding-01/components/getting-started.tsx",
    "onboarding-01/components/setup-guide.tsx",
    "onboarding-01/components/data.ts",
    "settings-01/components/workspace-shell.tsx",
    "settings-01/components/nav.tsx",
  ],
};

export default meta;
