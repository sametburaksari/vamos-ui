import { Stat, StatGroup } from "@vamos-cms/ui";

export default function StatDemo() {
  return (
    <StatGroup className="w-full">
      <Stat label="Visitors" value={28412} delta={0.124} trend={[4, 6, 5, 8, 7, 9, 12, 11, 14]} comparison="vs previous 30 days" />
      <Stat label="Published posts" value={144} delta={6} deltaKind="number" trend={[2, 3, 3, 4, 5, 5, 6, 7, 8]} comparison="vs previous 30 days" />
      <Stat label="Form submissions" value={312} delta={0.31} trend={[3, 5, 4, 6, 9, 8, 10, 13, 12]} comparison="vs previous 30 days" />
      <Stat label="Avg. read time" value={167} format="duration" delta={-0.041} trend={[9, 8, 9, 7, 8, 6, 7, 6, 5]} comparison="vs previous 30 days" />
    </StatGroup>
  );
}
