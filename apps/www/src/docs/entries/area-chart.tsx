import { ex, type DocEntry } from "../types";
import AreaChartDemo from "../examples/area-chart/demo";
import AreaChartStacked from "../examples/area-chart/stacked";
import AreaChartPercent from "../examples/area-chart/percent";
import AreaChartComparePeriod from "../examples/area-chart/compare-period";
import AreaChartReferenceLine from "../examples/area-chart/reference-line";

const entry: DocEntry = {
  slug: "area-chart",
  title: "Area chart",
  group: "Charts",
  description: "Volume or trend over time — traffic, pipeline value, headcount. Stacked or 100% stacked, gradient / solid / no fill, a dashed previous-period series and reference lines.",
  source: ["charts/area-chart.tsx", "charts/chart-shell.tsx", "charts/chart.tsx"],
  basedOn: "Recharts AreaChart",
  usage: `import { AreaChart } from "@vamos-ui/react/charts";

<AreaChart title="Traffic" data={rows} x="date" config={{ visits: { label: "Visits" } }} height="md" />`,
  demo: ex("demo", "Demo", "area-chart/demo.tsx", AreaChartDemo),
  examples: [
    ex("stacked", "Stacked by channel", "area-chart/stacked.tsx", AreaChartStacked, "stack=\"stacked\" with fill=\"solid\"; the tooltip reads the total."),
    ex("percent", "100% stacked", "area-chart/percent.tsx", AreaChartPercent, "stack=\"percent\": the axis reads 0–100%, the tooltip adds each share."),
    ex("compare-period", "Compare to previous period (HR)", "area-chart/compare-period.tsx", AreaChartComparePeriod, "compare={{ key }} draws that series dashed, unfilled and outside the stack."),
    ex("reference-line", "Target line", "area-chart/reference-line.tsx", AreaChartReferenceLine, "reference lines take a token colour and a label; the axis extends to include them."),
  ],
  api: [
    { name: "AreaChart", props: [
      { name: "…Chart props", type: "ChartProps", description: "title, data, config, x, formats, height, state, legend, tableToggle, onPointClick… (see Chart frame)." },
      { name: "series", type: "string[]", description: "Keys to draw. Default: every config key." },
      { name: "stack", type: '"none" | "stacked" | "percent"', default: '"none"', description: "Stacking." },
      { name: "curve", type: '"monotone" | "linear" | "step"', default: '"monotone"', description: "Line interpolation." },
      { name: "fill", type: '"gradient" | "solid" | "none"', default: '"gradient"', description: "Fill under the line. Gradient top opacity drops in glass mode." },
      { name: "compare", type: "{ key: string }", description: "Previous-period series: dashed, no fill, not stacked." },
      { name: "reference", type: "{ y, label?, color? }[]", description: "Horizontal reference lines." },
      { name: "hideYAxis", type: "boolean", default: "false", description: "Hide the value axis (compact cards)." },
    ] },
  ],
  notes: ["null values leave gaps (connectNulls is off); a single point renders as a dot.", "Gradient ids come from useId, so two charts on a page never collide."],
  covers: ["Area"],
};

export default entry;
