import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Status page website",
  description: "A status page for a webhooks API: overall banner, the active incident with its updates, scheduled maintenance, components with 90-day uptime bars (tooltip per day, arrow-key navigation), a latency chart, incident detail with postmortem, and a filterable 90-day history. EN / TR.",
  category: "Website pages",
  order: 52,
  tags: ["site"],
  files: [
    "site-status-01/page.tsx",
    "site-status-01/components/status-site.tsx",
    "site-status-01/components/uptime-bars.tsx",
    "site-status-01/components/incident-parts.tsx",
    "site-status-01/components/incident-page.tsx",
    "site-status-01/components/history-page.tsx",
    "site-status-01/components/latency-chart.tsx",
    "site-status-01/components/subscribe.tsx",
    "site-status-01/components/status-provider.tsx",
    "site-status-01/components/content.ts",
  ],
};

export default meta;
