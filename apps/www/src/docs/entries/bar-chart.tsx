import { ex, type DocEntry } from "../types";
import BarChartDemo from "../examples/bar-chart/demo";
import BarChartGrouped from "../examples/bar-chart/grouped";
import BarChartStacked from "../examples/bar-chart/stacked";
import BarChartHorizontal from "../examples/bar-chart/horizontal";
import BarChartNegative from "../examples/bar-chart/negative";
import BarChartHighlight from "../examples/bar-chart/highlight";
import BarListDemo from "../examples/bar-chart/bar-list";

const entry: DocEntry = {
  slug: "bar-chart",
  title: "Bar chart & Bar list",
  group: "Charts",
  description:
    "Category comparison — columns or ranked rows, grouped, stacked or 100% stacked, with highlight, value labels and a zero line for negatives. Bar list is the plain-DOM ranked list for top pages, sources and referrers.",
  source: ["charts/bar-chart.tsx", "charts/bar-list.tsx"],
  basedOn: "Recharts BarChart (Bar list: plain DOM)",
  usage: `import { BarChart, BarList } from "@vamos-ui/react/charts";

<BarChart title="Won by rep" data={reps} x="rep" layout="horizontal" config={{ won: { label: "Won", format: "currency" } }} />
<BarList aria-label="Top sources" data={sources} showShare />`,
  demo: ex("demo", "Demo", "bar-chart/demo.tsx", BarChartDemo),
  examples: [
    ex("grouped", "Grouped", "bar-chart/grouped.tsx", BarChartGrouped, "Two series side by side; the target uses the neutral fg-subtle token."),
    ex("stacked", "Stacked", "bar-chart/stacked.tsx", BarChartStacked, "Only the outer segment is rounded; the tooltip reads the total."),
    ex("horizontal", "Ranking (CRM)", "bar-chart/horizontal.tsx", BarChartHorizontal, "layout=\"horizontal\" grows rows from inline-start; valueLabels print each value."),
    ex("negative", "Profit and loss", "bar-chart/negative.tsx", BarChartNegative, "Negative values get a prominent zero line."),
    ex("highlight", "Highlight (CMS)", "bar-chart/highlight.tsx", BarChartHighlight, "highlight(row) keeps full colour; the rest dim to 35%."),
    ex("bar-list", "Bar list", "bar-chart/bar-list.tsx", BarListDemo, "An <ol> with full text per row; max groups the tail into \"Other (n)\"; delta shows the change."),
  ],
  api: [
    { name: "BarChart", props: [
      { name: "…Chart props", type: "ChartProps", description: "See Chart frame." },
      { name: "series", type: "string[]", description: "Keys to draw. Default: every config key." },
      { name: "layout", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Columns, or rows (rankings, long labels)." },
      { name: "stack", type: '"none" | "stacked" | "percent"', default: '"none"', description: "Stacking." },
      { name: "radius", type: "number", default: "4", description: "Corner radius; stacked bars round the outer segment only." },
      { name: "highlight", type: "(row) => boolean", description: "Rows to keep in full colour; others dim." },
      { name: "valueLabels", type: "boolean", default: "false", description: "Formatted values on the bars." },
      { name: "barSize", type: '"auto" | number', default: '"auto"', description: "Fixed bar thickness." },
      { name: "reference", type: "{ y, label?, color? }[]", description: "Reference lines on the value axis." },
    ] },
    { name: "BarList", props: [
      { name: "data", type: "{ key, label, value, textLabel?, href?, icon?, delta? }[]", description: "Rows. delta is a ratio (0.12 → +12%)." },
      { name: "format", type: "FormatSpec", default: '"number"', description: "Value format." },
      { name: "color", type: "ChartColor", default: "accent-soft", description: "Bar colour token." },
      { name: "max", type: "number", description: "Top N; the rest merge into \"Other (n)\"." },
      { name: "sort", type: '"desc" | "asc" | "none"', default: '"desc"', description: "Ties are sorted with the locale collator." },
      { name: "showShare", type: "boolean", default: "false", description: "Each row's share of the total." },
      { name: "onItemClick", type: "(item) => void", description: "Rows become buttons. Rows with href are links." },
      { name: "variant", type: '"filled" | "track"', default: '"filled"', description: "Bar behind the label, or a thin bar under it." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Row height 28 / 32 px." },
      { name: "loading / emptyMessage", type: "boolean / ReactNode", description: "Descending skeleton rows; text when data is empty." },
    ] },
  ],
  notes: ["More than 20 categories in columns logs a development hint — switch to horizontal or group into Other."],
  covers: ["Bar"],
};

export default entry;
