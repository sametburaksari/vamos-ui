import { DonutChart, type ChartConfig } from "@vamos-ui/react/charts";

const countries = [
  { country: "TR", visits: 18_420 },
  { country: "DE", visits: 9_310 },
  { country: "US", visits: 7_860 },
  { country: "GB", visits: 4_120 },
  { country: "NL", visits: 2_480 },
  { country: "FR", visits: 1_910 },
  { country: "AZ", visits: 1_240 },
  { country: "SE", visits: 690 },
];

const config = {
  TR: { label: "Türkiye" },
  DE: { label: "Germany" },
  US: { label: "United States" },
  GB: { label: "United Kingdom" },
  NL: { label: "Netherlands" },
  FR: { label: "France" },
  AZ: { label: "Azerbaijan" },
  SE: { label: "Sweden" },
} satisfies ChartConfig;

export default function DonutChartOthers() {
  // Beyond maxSlices, the smallest slices merge into "Other" in a neutral tone.
  return <DonutChart title="Visits by country" data={countries} nameKey="country" valueKey="visits" config={config} maxSlices={5} className="w-full max-w-xl" />;
}
