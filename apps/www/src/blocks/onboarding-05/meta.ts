import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Product tour",
  description:
    "Guided product tour on a live commerce overview: spotlight steps over the shell search, today's stats, the order queue, low stock and the create button; a Tours card with per-tour progress, resume and replay; arrow keys and Esc, and a second task tour that walks through packing an order.",
  category: "Onboarding",
  order: 50,
  tags: ["any", "ops"],
  files: [
    "onboarding-05/page.tsx",
    "onboarding-05/components/store-tour.tsx",
    "onboarding-05/components/tour-panel.tsx",
    "onboarding-05/components/data.ts",
    "detail-04/components/admin-shell.tsx",
  ],
};

export default meta;
