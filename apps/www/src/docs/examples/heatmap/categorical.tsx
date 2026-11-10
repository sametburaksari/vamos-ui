import { Heatmap, type HeatmapCell } from "@vamos-ui/react/charts";

const states = ["office", "remote", "leave", "sick"] as const;

// Attendance for one person over six weeks (weekends empty).
const attendance: HeatmapCell[] = Array.from({ length: 42 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 8, 28 + i));
  const iso = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
  const state = i >= 17 && i <= 21 ? "leave" : i === 30 ? "sick" : i % 7 === 2 || i % 7 === 4 ? "remote" : "office";
  return { x: iso, value: weekend ? null : 1, category: weekend ? undefined : state };
});

export default function HeatmapCategorical() {
  return (
    <Heatmap
      mode="calendar"
      title="Attendance, Elif Demir"
      data={attendance}
      scale="categorical"
      categories={[
        { value: states[0], label: "Office", color: "chart-1" },
        { value: states[1], label: "Remote", color: "chart-2" },
        { value: states[2], label: "Annual leave", color: "chart-3" },
        { value: states[3], label: "Sick", color: "danger" },
      ]}
      cellSize={22}
      weekStart={1}
    />
  );
}
