import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Marketing campaigns",
  description:
    "Paid marketing performance: spend, conversions, CPA, attributed revenue and ROAS for 7, 30 or 90 days against the previous period, spend per channel with blended CPA, conversion credit by channel under four attribution models with last click as reference, and a campaign table with budget pacing against flight time, pause/resume and a validated budget edit (all with undo).",
  category: "Dashboards",
  order: 120,
  tags: ["site", "crm"],
  files: [
    "dashboard-12/page.tsx",
    "dashboard-12/components/marketing-dashboard.tsx",
    "dashboard-12/components/kpi-ledger.tsx",
    "dashboard-12/components/performance-card.tsx",
    "dashboard-12/components/attribution-card.tsx",
    "dashboard-12/components/campaign-table.tsx",
    "dashboard-12/components/data.ts",
    "_shared/metrics.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
