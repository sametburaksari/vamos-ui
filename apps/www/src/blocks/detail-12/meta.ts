import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Partner",
  description:
    "Reseller record for a partner programme: a tier ladder with what is missing for the next tier and KPI count-ups, deal registrations to filter, select and approve or reject in bulk or in a review sheet (reject needs a note, channel conflicts flagged, undo), market development funds as one allocation bar with claims to approve and a new-claim dialog that checks the remaining budget, certified people with expiry and renewal reminders, and tier benefits.",
  category: "Detail pages",
  order: 120,
  tags: ["crm", "ops"],
  files: [
    "detail-12/page.tsx",
    "detail-12/components/partner-view.tsx",
    "detail-12/components/tier-ladder.tsx",
    "detail-12/components/registrations-panel.tsx",
    "detail-12/components/mdf-panel.tsx",
    "detail-12/components/certifications-panel.tsx",
    "detail-12/components/partner-data.ts",
    "_shared/partners.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
