import { ProgressRing } from "@vamos-cms/ui/charts";

export default function GaugeRing() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <ProgressRing value={85} format="percent" size="lg" aria-label="Profile completeness" />
      <ProgressRing value={72} format="percent" size="md" aria-label="Onboarding" color="chart-2" />
      <span className="inline-flex items-center gap-2 text-[13px]">
        <ProgressRing value={6} max={9} size="sm" aria-label="Checklist" /> 6 of 9 tasks
      </span>
      <span className="inline-flex items-center gap-1.5 text-[12.5px] text-fg-muted">
        <ProgressRing value={3} max={4} size="xs" aria-label="Approvals" color="success" /> 3/4 approvals
      </span>
    </div>
  );
}
