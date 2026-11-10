import { Card, Sparkline } from "@vamos-cms/ui";

const daily = [14, 18, 11, 22, 26, 19, 31, 28, 24, 35, 33, 29, 38, 41];

export default function SparklineReference() {
  return (
    <Card className="w-full max-w-xs p-5">
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="text-fg-muted">Daily bookings</span>
        <span className="text-xs text-fg-subtle">target 25 / day</span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <span className="font-mono text-[28px] leading-none font-medium tracking-[-0.03em] tabular">41</span>
        <Sparkline values={daily} size="md" reference={25} showMinMax showLast className="text-accent-ink" label="Bookings rose from 14 to 41; above the 25 per day target since day 5" />
      </div>
    </Card>
  );
}
