import { Heatmap, type HeatmapCell } from "@vamos-ui/react/charts";

const departments = ["Engineering", "Sales", "Marketing", "Support", "Operations"];
const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const variance = [
  [0.04, -0.02, 0.06, 0.08, -0.01, 0.03],
  [-0.12, -0.07, 0.02, 0.05, 0.11, 0.09],
  [0.18, 0.09, -0.04, -0.15, -0.06, 0.01],
  [-0.03, -0.01, 0.0, 0.02, -0.05, -0.08],
  [0.07, 0.12, 0.05, -0.02, 0.03, 0.04],
];

// Budget variance: spend vs plan. Over plan is red, under plan green, on plan neutral.
const data: HeatmapCell[] = departments.flatMap((y, r) => months.map((x, c) => ({ x, y, value: -variance[r]![c]! })));

export default function HeatmapDiverging() {
  return <Heatmap mode="matrix" title="Budget variance by department" data={data} xLabels={months} yLabels={departments} scale="diverging" steps={7} format="percent" domain={[-0.2, 0.2]} tableToggle className="w-full max-w-2xl" />;
}
