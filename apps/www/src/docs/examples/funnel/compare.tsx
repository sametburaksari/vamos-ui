import { Funnel } from "@vamos-ui/react/charts";

const october = [
  { key: "visit", label: "Visited pricing", value: 18_420 },
  { key: "start", label: "Started checkout", value: 2_310 },
  { key: "details", label: "Entered card", value: 1_204 },
  { key: "paid", label: "Paid", value: 962 },
];
const september = [
  { key: "visit", label: "Visited pricing", value: 16_980 },
  { key: "start", label: "Started checkout", value: 1_870 },
  { key: "details", label: "Entered card", value: 1_062 },
  { key: "paid", label: "Paid", value: 790 },
];

export default function FunnelCompare() {
  // The marker shows last period's stage size; the chip shows the change in conversion.
  return <Funnel title="Checkout funnel, October vs September" steps={october} compareTo={september} color="chart-2" className="w-full" />;
}
