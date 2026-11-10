import { ex, type DocEntry } from "../types";
import ComboChartDemo from "../examples/combo-chart/demo";
import ComboChartStacked from "../examples/combo-chart/stacked";
import ComboChartEndAxisHidden from "../examples/combo-chart/end-axis-hidden";

const entry: DocEntry = {
  slug: "combo-chart",
  title: "Combo chart",
  group: "Charts",
  description:
    "Volume and rate together: bars on the start axis, a line on the end axis. Both axes share the zero line and the grid, so neither scale exaggerates; axis sides are logical and swap in RTL.",
  source: ["charts/combo-chart.tsx"],
  basedOn: "Recharts ComposedChart",
  usage: `import { ComboChart } from "@vamos-cms/ui/charts";

<ComboChart title="Quotes and win rate" data={rows} x="month" bars={["sent"]} lines={["winRate"]}
  config={{ sent: { label: "Quotes sent" }, winRate: { label: "Win rate", format: "percent" } }} />`,
  demo: ex("demo", "Demo (CRM)", "combo-chart/demo.tsx", ComboChartDemo),
  examples: [
    ex("stacked", "Stacked bars + line (HR)", "combo-chart/stacked.tsx", ComboChartStacked, "stackBars stacks the bars; the line keeps its own axis."),
    ex("end-axis-hidden", "End axis hidden (CMS)", "combo-chart/end-axis-hidden.tsx", ComboChartEndAxisHidden, "endAxis={false}: the rate stays in the tooltip and the table."),
  ],
  api: [
    { name: "ComboChart", props: [
      { name: "…Chart props", type: "ChartProps", description: "See Chart frame." },
      { name: "bars", type: "string[]", description: "Keys drawn as bars (default axis start)." },
      { name: "lines", type: "string[]", description: "Keys drawn as lines (default axis end), drawn above the bars." },
      { name: "areas", type: "string[]", description: "Keys drawn as tinted areas behind the bars." },
      { name: "stackBars", type: "boolean", default: "false", description: "Stack the bars." },
      { name: "endAxis", type: "boolean", default: "true", description: "Show the end axis." },
      { name: "endAxisFormat", type: "FormatSpec", description: "End axis tick format. Default: the first end-axis series' format." },
      { name: "startAxisLabel / endAxisLabel", type: "string", description: "Axis titles — name both scales (label + unit)." },
    ] },
  ],
  notes: ["config[key].axis moves any series to the other axis."],
  covers: ["Combo (bar + line)"],
};

export default entry;
