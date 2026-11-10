import { CircleDollarSign, Handshake } from "lucide-react";
import { Stat, StatGroup } from "@vamos-cms/ui";

export default function StatCurrencyCompact() {
  return (
    <StatGroup columns={3} className="w-full">
      <Stat icon={CircleDollarSign} label="Won this month" value={1240000} format="compact-currency" delta={0.182} trend={[620, 700, 680, 810, 905, 990, 1240]} trendVariant="area" size="lg" />
      <Stat icon={Handshake} label="Pipeline value" value="3815400.00" format="currency" delta={-82000} deltaKind="currency" />
      <Stat label="Average deal" value={18400} format={{ type: "currency", currency: "EUR", options: { maximumFractionDigits: 0 } }} delta={0.054} />
    </StatGroup>
  );
}
