import { Heatmap, type HeatmapCell } from "@vamos-cms/ui/charts";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 12 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

// Answered sales calls by weekday and hour.
const calls: HeatmapCell[] = days.flatMap((y, di) =>
  hours.map((x, hi) => {
    const peak = Math.exp(-((hi - 2.5) ** 2) / 6) + 0.8 * Math.exp(-((hi - 7) ** 2) / 4);
    const weekend = di >= 5 ? 0.18 : 1;
    return { x, y, value: Math.round(peak * weekend * (34 + ((di * 13 + hi * 7) % 11))) };
  }),
);

export default function HeatmapMatrixHours() {
  // Arrow keys move between cells; Home / End jump within a row, PageUp / PageDown within a column.
  return <Heatmap mode="matrix" title="Answered calls by weekday and hour" data={calls} xLabels={hours} yLabels={days} valueLabel="Calls" color="chart-2" steps={7} className="w-full" />;
}
