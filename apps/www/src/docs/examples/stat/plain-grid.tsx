import { Stat, StatGroup } from "@vamos-ui/react";

export default function StatPlainGrid() {
  return (
    <StatGroup columns={3} variant="plain" className="w-full">
      <Stat variant="plain" label="Active partners" value={142} delta={0.035} href="#plain-grid" />
      <Stat variant="plain" label="On leave today" value={7} delta={2} deltaKind="number" intent="neutral" />
      <Stat variant="plain" label="Open positions" value={12} delta={-3} deltaKind="number" intent="neutral" />
    </StatGroup>
  );
}
