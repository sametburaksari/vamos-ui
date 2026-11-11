import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Launch checklist",
  description:
    "Store launch checklist: a segmented progress rail where each segment jumps to its task, tasks grouped by area and finished inline (address, VAT, IBAN payouts, DNS check, products, invites, alerts), skippable optional steps, owners per task and a go-live check that unlocks when the required work is done.",
  category: "Onboarding",
  order: 30,
  tags: ["any", "ops"],
  files: [
    "onboarding-03/page.tsx",
    "onboarding-03/components/launch-checklist.tsx",
    "onboarding-03/components/launch-rail.tsx",
    "onboarding-03/components/task-forms.tsx",
    "onboarding-03/components/data.ts",
    "detail-04/components/admin-shell.tsx",
  ],
};

export default meta;
