import { Heatmap, type HeatmapCell } from "@vamos-ui/react/charts";

// One year of published posts (deterministic sample; load yours from the CMS).
const posts: HeatmapCell[] = Array.from({ length: 365 }, (_, i) => {
  const d = new Date(Date.UTC(2025, 10, 11 + i));
  const iso = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  const weekday = d.getUTCDay();
  const seasonal = Math.sin(i / 40) + 1;
  const value = weekday === 0 || weekday === 6 ? (i % 9 === 0 ? 1 : 0) : Math.round(((i * 7919) % 5) * seasonal * 0.8);
  return { x: iso, value };
});

export default function HeatmapCalendar() {
  return (
    <div className="w-full">
      <Heatmap mode="calendar" title="Posts published, last 12 months" data={posts} valueLabel="Posts" tableToggle today="2026-11-10" />
    </div>
  );
}
