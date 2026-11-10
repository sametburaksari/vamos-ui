import { DonutChart, type ChartConfig } from "@vamos-ui/react/charts";

const contracts = [
  { type: "full", people: 168 },
  { type: "part", people: 41 },
  { type: "contractor", people: 27 },
  { type: "intern", people: 12 },
];

const config = {
  full: { label: "Full-time" },
  part: { label: "Part-time" },
  contractor: { label: "Contractors" },
  intern: { label: "Interns" },
} satisfies ChartConfig;

export default function DonutChartHalf() {
  return <DonutChart title="Contract types" data={contracts} nameKey="type" valueKey="people" config={config} variant="half" size="lg" legend="bottom" centerLabel="People" className="w-full max-w-sm" />;
}
