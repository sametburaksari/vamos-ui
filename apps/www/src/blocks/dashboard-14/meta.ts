import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "SaaS metrics",
  description:
    "Subscription revenue at a glance: ARR, net revenue retention, quick ratio and logo churn; the month's MRR bridge (new, expansion, contraction, churn) with a month picker; 12 months of movements you can click into; a retention cohort triangle in percent or accounts; and a watch list of churn risks and expansion candidates where you log a play or snooze an account, with undo.",
  category: "Dashboards",
  order: 140,
  tags: ["crm", "any"],
  files: [
    "dashboard-14/page.tsx",
    "dashboard-14/components/saas-dashboard.tsx",
    "dashboard-14/components/mrr-bridge.tsx",
    "dashboard-14/components/cohort-card.tsx",
    "dashboard-14/components/accounts-watch.tsx",
    "dashboard-14/components/data.ts",
    "_shared/metrics.ts",
    "_shared/companies.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
