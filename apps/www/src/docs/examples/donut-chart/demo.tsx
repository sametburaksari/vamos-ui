import { DonutChart, type ChartConfig } from "@vamos-ui/react/charts";

const leads = [
  { source: "organic", leads: 1_284 },
  { source: "paid", leads: 862 },
  { source: "referral", leads: 431 },
  { source: "events", leads: 198 },
  { source: "partners", leads: 145 },
];

const config = {
  organic: { label: "Organic search" },
  paid: { label: "Paid ads" },
  referral: { label: "Referrals" },
  events: { label: "Events" },
  partners: { label: "Partners" },
} satisfies ChartConfig;

export default function DonutChartDemo() {
  // Hover a slice or focus a legend row: the centre shows that slice. Click a row to hide it.
  return <DonutChart title="Leads by source, Q4" data={leads} nameKey="source" valueKey="leads" config={config} centerLabel="Leads" className="w-full max-w-xl" />;
}
