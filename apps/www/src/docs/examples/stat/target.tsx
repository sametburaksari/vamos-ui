import { Stat, StatGroup } from "@vamos-cms/ui";

export default function StatTargetExample() {
  return (
    <StatGroup columns={2} className="w-full max-w-2xl">
      <Stat label="Revenue this month" value={12840} format={{ type: "currency", options: { maximumFractionDigits: 0 } }} target={{ value: 46800 }} delta={0.08} />
      <Stat label="New sign-ups" value={520} target={{ value: 500 }} delta={0.21} comparison="Goal for November" />
    </StatGroup>
  );
}
