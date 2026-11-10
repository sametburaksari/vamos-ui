import { Card } from "@vamos-cms/ui";

export default function CardStat() {
  return (
    <Card className="w-full max-w-xs p-5">
      <div className="text-[13px] text-fg-muted">Revenue this month</div>
      <div className="mt-2 font-mono text-[34px] leading-none tracking-[-0.03em] tabular">$12,840</div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-track">
        <div className="h-full w-[27%] rounded-full bg-accent" />
      </div>
      <div className="mt-2 flex justify-between text-xs text-fg-subtle">
        <span>Goal $46,800</span>
        <span className="tabular">27%</span>
      </div>
    </Card>
  );
}
