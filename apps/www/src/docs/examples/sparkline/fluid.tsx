import { Card, Sparkline } from "@vamos-ui/react";

const hourly = [2, 3, 2, 1, 1, 2, 5, 9, 14, 18, 21, 24, 26, 22, 19, 17, 20, 24, 27, 23, 15, 9, 5, 3];

export default function SparklineFluid() {
  return (
    <Card className="w-full max-w-2xl p-5">
      <div className="text-[13px] text-fg-muted">Orders per hour · today</div>
      <Sparkline values={hourly} variant="area" width="100%" height={56} color="chart-1" showLast className="mt-4" />
      <div className="mt-2 flex justify-between font-mono text-[11px] text-fg-subtle tabular">
        <span>00:00</span>
        <span>12:00</span>
        <span>23:00</span>
      </div>
    </Card>
  );
}
