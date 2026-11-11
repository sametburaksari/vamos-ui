import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Support SLA",
  description:
    "Support service levels: breached and due-next counts, a six-hour deadline horizon that plots every running SLA clock around now, a breach-watch list with live timers, bulk assign and escalate, a first-reply dialog with macros (all with undo), queue health that filters the page, agent load, ticket arrivals by weekday and hour, and CSAT against target.",
  category: "Dashboards",
  order: 100,
  tags: ["crm", "ops"],
  files: [
    "dashboard-10/page.tsx",
    "dashboard-10/components/sla-dashboard.tsx",
    "dashboard-10/components/deadline-horizon.tsx",
    "dashboard-10/components/breach-watch.tsx",
    "dashboard-10/components/queue-health.tsx",
    "dashboard-10/components/arrivals-csat.tsx",
    "dashboard-10/components/data.ts",
    "_shared/tickets.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
