import { Funnel } from "@vamos-ui/react/charts";

const pipeline = [
  { key: "leads", label: "Leads", value: 1_240 },
  { key: "qualified", label: "Qualified", value: 612 },
  { key: "meeting", label: "Meeting held", value: 318 },
  { key: "proposal", label: "Proposal", value: 205 },
  { key: "won", label: "Won", value: 84 },
];

export default function FunnelDemo() {
  // Columns in a wide container, rows when it gets narrow — the same markup.
  return <Funnel title="Sales pipeline, Q4" steps={pipeline} show={["conversion", "dropoff", "overall"]} className="w-full" />;
}
