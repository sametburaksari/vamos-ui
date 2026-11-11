import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Plan & billing",
  description:
    "Subscription billing: the current plan with a day-by-day cycle ruler and seat marks, a change-plan dialog with monthly/yearly pricing and prorated credit, usage meters that show the included limit and a month-end projection, the next invoice estimate with overage and VAT, the card on file and billing details with edit dialogs, and invoice history with year filter, bulk ZIP download and a line-item sheet.",
  category: "Settings & forms",
  order: 30,
  tags: ["any", "ops"],
  files: [
    "settings-03/page.tsx",
    "settings-03/components/billing-settings.tsx",
    "settings-03/components/plan-panel.tsx",
    "settings-03/components/usage-meters.tsx",
    "settings-03/components/invoice-table.tsx",
    "settings-03/components/payment-panel.tsx",
    "settings-03/components/billing-data.ts",
    "settings-03/components/settings-frame.tsx",
    "detail-04/components/admin-shell.tsx",
  ],
};

export default meta;
