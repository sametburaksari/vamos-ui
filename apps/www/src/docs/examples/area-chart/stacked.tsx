import { AreaChart, type ChartConfig } from "@vamos-ui/react/charts";

const sessions = [
  { week: "Sep 7", organic: 4210, paid: 1860, social: 920, email: 640 },
  { week: "Sep 14", organic: 4480, paid: 2010, social: 870, email: 710 },
  { week: "Sep 21", organic: 4390, paid: 2240, social: 1040, email: 690 },
  { week: "Sep 28", organic: 4720, paid: 2120, social: 1180, email: 820 },
  { week: "Oct 5", organic: 5010, paid: 1980, social: 1090, email: 760 },
  { week: "Oct 12", organic: 5260, paid: 2310, social: 1260, email: 880 },
  { week: "Oct 19", organic: 5490, paid: 2450, social: 1210, email: 940 },
];

const config = {
  organic: { label: "Organic" },
  paid: { label: "Paid" },
  social: { label: "Social" },
  email: { label: "Email" },
} satisfies ChartConfig;

export default function AreaChartStacked() {
  // The tooltip adds a total row when stacked.
  return <AreaChart title="Sessions by channel" data={sessions} x="week" config={config} stack="stacked" fill="solid" height="md" className="w-full" />;
}
