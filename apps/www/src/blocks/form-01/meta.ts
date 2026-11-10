import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Leave request",
  description: "Multi-step form: leave type cards, a date range that counts working days, handover with cover and documents, review, then an approval chain with reminders and withdraw.",
  category: "Settings & forms",
  order: 40,
  tags: ["hr"],
  files: [
    "form-01/page.tsx",
    "form-01/components/leave-request.tsx",
    "form-01/components/approval-status.tsx",
    "form-01/components/leave-sidebar.tsx",
    "form-01/components/data.ts",
    "settings-01/components/workspace-shell.tsx",
    "settings-01/components/nav.tsx",
  ],
};

export default meta;
