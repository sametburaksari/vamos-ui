import { ex, type DocEntry } from "../types";
import DonutChartDemo from "../examples/donut-chart/demo";
import DonutChartHalf from "../examples/donut-chart/half";
import DonutChartOthers from "../examples/donut-chart/others";
import DonutChartCenterCustom from "../examples/donut-chart/center-custom";
import DonutChartPie from "../examples/donut-chart/pie";

const entry: DocEntry = {
  slug: "donut-chart",
  title: "Donut / Pie chart",
  group: "Charts",
  description:
    "Parts of a whole, up to about six slices. The legend is a real list with value and share; hovering a slice or focusing a row shows it in the centre, clicking a row hides it. Donut, pie and half-ring variants.",
  source: ["charts/donut-chart.tsx"],
  basedOn: "Recharts PieChart",
  usage: `import { DonutChart } from "@vamos-cms/ui/charts";

<DonutChart title="Leads by source" data={rows} nameKey="source" valueKey="leads"
  config={{ organic: { label: "Organic search" }, paid: { label: "Paid ads" } }} />`,
  demo: ex("demo", "Demo (CRM)", "donut-chart/demo.tsx", DonutChartDemo),
  examples: [
    ex("half", "Half ring (HR)", "donut-chart/half.tsx", DonutChartHalf, "variant=\"half\" with the legend under it."),
    ex("others", "Other grouping", "donut-chart/others.tsx", DonutChartOthers, "Beyond maxSlices the smallest slices merge into a neutral \"Other\"."),
    ex("center-custom", "Custom centre (CMS)", "donut-chart/center-custom.tsx", DonutChartCenterCustom, "center takes any node; byte values use format: \"bytes\"."),
    ex("pie", "Pie", "donut-chart/pie.tsx", DonutChartPie, "variant=\"pie\" — no centre, thin separators."),
  ],
  api: [
    { name: "DonutChart", props: [
      { name: "title / data / config / state / summary / labels", type: "ChartProps", description: "See Chart frame. config is keyed by slice id (the nameKey value)." },
      { name: "nameKey", type: "keyof T", description: "Row key holding the slice id." },
      { name: "valueKey", type: "keyof T", description: "Row key holding the value." },
      { name: "variant", type: '"donut" | "pie" | "half"', default: '"donut"', description: "Shape." },
      { name: "size", type: '"sm" | "md" | "lg" | number', default: '"md"', description: "120 / 180 / 240 px diameter." },
      { name: "center", type: 'ReactNode | "total" | "none"', default: '"total"', description: "Centre content; the active slice replaces it while hovered or focused." },
      { name: "centerLabel", type: "string", default: '"Total"', description: "Label under the total." },
      { name: "maxSlices", type: "number", default: "5", description: "Rest → \"Other\" (fg-subtle)." },
      { name: "legend", type: '"side" | "bottom" | "none"', default: '"side"', description: "Legend list position (side falls under the ring in a narrow container)." },
      { name: "format", type: "FormatSpec", description: "Value format. Default: the first config entry's format." },
      { name: "activeKey / onActiveChange", type: "string | null", description: "Controlled active slice." },
    ] },
  ],
  notes: ["All-zero data renders an empty ring in --track with \"No data\".", "The ring itself is not focusable; the legend list is the keyboard path."],
  covers: ["Donut / Pie"],
};

export default entry;
