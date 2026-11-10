import { Funnel } from "@vamos-cms/ui/charts";

const pipeline = [
  { key: "qualified", label: "Qualified", value: 612, amount: 4_860_000 },
  { key: "proposal", label: "Proposal", value: 205, amount: 2_140_000 },
  { key: "negotiation", label: "Negotiation", value: 117, amount: 1_380_000 },
  { key: "won", label: "Won", value: 84, amount: 962_000 },
];

export default function FunnelAmount() {
  return <Funnel title="Pipeline value by stage" steps={pipeline} amountFormat={{ currency: "USD", compact: true }} orientation="vertical" className="w-full max-w-xl" />;
}
