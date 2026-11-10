import { Stat, StatGroup } from "@vamos-ui/react";

export default function StatIntent() {
  return (
    <StatGroup columns={3} className="w-full">
      {/* Fewer cancellations and faster replies are good news: the drop is green. */}
      <Stat label="Cancellation rate" value={0.024} format="percent" delta={-0.12} intent="lower-is-better" trend={[3.1, 3.0, 2.9, 2.7, 2.6, 2.4]} comparison="vs October" />
      <Stat label="First response time" value={4320} format="duration" delta={0.09} intent="lower-is-better" trend={[3600, 3800, 3900, 4100, 4320]} comparison="vs October" />
      <Stat label="Tickets opened" value={86} delta={0.14} intent="neutral" trend={[60, 72, 70, 81, 86]} comparison="vs October" />
    </StatGroup>
  );
}
