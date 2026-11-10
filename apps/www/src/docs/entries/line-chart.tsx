import { ex, type DocEntry } from "../types";
import LineChartDemo from "../examples/line-chart/demo";
import LineChartEndLabels from "../examples/line-chart/end-labels";
import LineChartStep from "../examples/line-chart/step";

const entry: DocEntry = {
  slug: "line-chart",
  title: "Line chart",
  group: "Charts",
  description: "Multi-series trends and rates — conversion, win rate, turnover. Point markers (none / last / all), step curves and direct end labels that do not rely on colour.",
  source: ["charts/line-chart.tsx"],
  basedOn: "Recharts LineChart",
  usage: `import { LineChart } from "@vamos-ui/react/charts";

<LineChart title="Win rate" data={rows} x="month" config={{ maya: { label: "Maya", format: "percent" } }} endLabels />`,
  demo: ex("demo", "Demo", "line-chart/demo.tsx", LineChartDemo),
  examples: [
    ex("end-labels", "Direct labels (CRM)", "line-chart/end-labels.tsx", LineChartEndLabels, "endLabels writes each series name at its last point and drops the legend; recommended from 3 series."),
    ex("step", "Step (price changes)", "line-chart/step.tsx", LineChartStep, "curve=\"step\" for values that change in jumps; dots=\"all\" marks every change."),
  ],
  api: [
    { name: "LineChart", props: [
      { name: "…Chart props", type: "ChartProps", description: "See Chart frame." },
      { name: "series", type: "string[]", description: "Keys to draw." },
      { name: "curve", type: '"monotone" | "linear" | "step"', default: '"monotone"', description: "Interpolation." },
      { name: "dots", type: '"none" | "last" | "all"', default: '"last"', description: "Point markers." },
      { name: "endLabels", type: "boolean", default: "false", description: "Direct labels at line ends instead of a legend (≤ 4 series)." },
      { name: "reference", type: "{ y, label?, color? }[]", description: "Reference lines." },
    ] },
  ],
  notes: ["More than 6 series logs a development hint (group into Other or use small multiples)."],
  covers: ["Line"],
};

export default entry;
