import { ex, type DocEntry } from "../types";
import ChartDemo from "../examples/chart/demo";
import ChartConfigTokens from "../examples/chart/config-tokens";
import ChartFormatters from "../examples/chart/formatters";
import ChartRawRecharts from "../examples/chart/raw-recharts";
import ChartStates from "../examples/chart/states";
import ChartTableToggle from "../examples/chart/table-toggle";
import ChartLegendToggle from "../examples/chart/legend-toggle";
import ChartDrillDown from "../examples/chart/drill-down";
import ChartCard from "../examples/chart/chart-card";

const entry: DocEntry = {
  slug: "chart",
  title: "Chart frame",
  group: "Charts",
  description:
    "The shell every chart shares: series mapped to colour tokens, locale-aware formatting, an interactive legend, loading / refreshing / empty / error states, a generated text summary and a data-table alternative. Ready charts sit on top of it; raw Recharts works inside it too.",
  source: ["charts/chart-shell.tsx", "charts/chart.tsx", "charts/utils.ts"],
  basedOn: "Recharts 3",
  usage: `import { AreaChart, type ChartConfig } from "@vamos-cms/ui/charts";

const config = {
  visits: { label: "Visits" },
  revenue: { label: "Revenue", format: "currency", color: "chart-2" },
} satisfies ChartConfig;

<AreaChart title="Traffic" data={rows} x="date" config={config} height="md" />`,
  demo: ex("demo", "Demo", "chart/demo.tsx", ChartDemo),
  examples: [
    ex("chart-card", "Chart card with range (CRM)", "chart/chart-card.tsx", ChartCard, "Card header + 7D / 30D / 90D switch. The chart's title stays the accessible name; the visible title lives in the card."),
    ex("config-tokens", "Colour tokens", "chart/config-tokens.tsx", ChartConfigTokens, "Series reference tokens (chart-1…6, accent-ink, success…), never hex — each scope re-colours itself across accents and materials."),
    ex("formatters", "Formatters, en-US vs tr-TR", "chart/formatters.tsx", ChartFormatters, "One FormatSpec per series. Axis ticks are compact, tooltip and table use the full form, all from the LocaleProvider."),
    ex("states", "States", "chart/states.tsx", ChartStates, "Chart-shaped skeletons, a dimmed refresh, an empty state that keeps its height and an error with retry."),
    ex("table-toggle", "View as table", "chart/table-toggle.tsx", ChartTableToggle, "The data table is always present for screen readers; tableToggle shows it to everyone."),
    ex("legend-toggle", "Controlled legend", "chart/legend-toggle.tsx", ChartLegendToggle, "Legend items are toggle buttons (aria-pressed). The last visible series cannot be hidden."),
    ex("drill-down", "Drill-down (CMS)", "chart/drill-down.tsx", ChartDrillDown, "onPointClick on a bar, or on a row header in the table view — the keyboard path."),
    ex("raw-recharts", "Raw Recharts", "chart/raw-recharts.tsx", ChartRawRecharts, "Any Recharts tree inside <Chart> + <ChartFrame>; use ChartXAxis, ChartYAxis, ChartTooltip and seriesColor(key)."),
  ],
  api: [
    { name: "Chart (shared by every ready chart)", props: [
      { name: "title", type: "string", description: "Required. Accessible name of the figure and caption of the data table (not shown visually)." },
      { name: "data", type: "T[]", description: "Rows. Dates as \"YYYY-MM-DD\" strings, money as numbers or decimal strings." },
      { name: "config", type: "ChartConfig", description: "Series key → { label, color?, format?, axis?, pattern?, icon?, hidden? }. Key order = legend and colour order." },
      { name: "x", type: "keyof T", description: "Category / time key." },
      { name: "xFormat", type: "FormatSpec", description: "x format. Default: \"YYYY-MM-DD\" → \"Nov 1\", everything else as is." },
      { name: "yFormat", type: "FormatSpec", description: "Value axis format. Default: the first series' format, compact." },
      { name: "xLabel", type: "string", description: "Header of the x column in the data table." },
      { name: "height", type: '"sm" | "md" | "lg" | number', default: '"md"', description: "160 / 260 / 360 px or pixels. Reserved before the chart measures (no layout shift)." },
      { name: "aspect", type: "number", description: "Width / height ratio instead of a height." },
      { name: "state", type: "ChartState", description: "{ status: \"loading\" | \"refreshing\" | \"empty\" (message, action) | \"error\" (message, onRetry) | \"ready\" }. Default: empty when data is empty." },
      { name: "summary", type: "string | (data) => string", description: "Text alternative (aria-describedby). Default: generated range, low, high and average per series." },
      { name: "tableToggle", type: "boolean", default: "false", description: "Shows the \"View as table\" switch." },
      { name: "legend", type: '"top" | "bottom" | "none"', default: '"top" with 2+ series', description: "Legend position. Items toggle series." },
      { name: "hiddenSeries / defaultHiddenSeries / onHiddenSeriesChange", type: "string[]", description: "Controlled or uncontrolled hidden series." },
      { name: "tooltipIndicator", type: '"dot" | "line" | "dashed"', default: '"dot"', description: "Swatch in tooltip rows." },
      { name: "animate", type: "boolean", default: "true", description: "Transitions on data change; always off under prefers-reduced-motion." },
      { name: "onPointClick", type: "(row, seriesKey) => void", description: "Drill-down. Also turns the table's row headers into buttons." },
      { name: "toolbar", type: "ReactNode", description: "Extra controls at the end of the legend row." },
      { name: "labels", type: "Partial<ChartLabels>", description: "Built-in strings (chart namespace): viewTable, empty, error, retry, total, other…" },
    ] },
    { name: "SeriesConfig", props: [
      { name: "label", type: "string", description: "Legend, tooltip, table header and summary text." },
      { name: "color", type: "ChartColor", default: "chart-1…6 in order", description: '"chart-1"…"chart-6" | "accent" | "accent-ink" | "success" | "warning" | "danger" | "info" | "fg-subtle" | "fg-muted". Exposed as --series-<key>.' },
      { name: "format", type: "FormatSpec", default: '"number"', description: '"number" | "integer" | "compact" | "percent" (ratio) | "currency" | "duration" | "bytes" | { currency, compact? } | { date } | { relative: true } | (v, locale) => string.' },
      { name: "axis", type: '"start" | "end"', description: "Value axis side (Combo). Logical — swaps in RTL." },
      { name: "pattern", type: '"solid" | "dashed" | "dotted"', description: "Stroke pattern. Auto-assigned with more than 3 series." },
      { name: "icon", type: "ComponentType", description: "Icon in place of the legend swatch." },
      { name: "hidden", type: "boolean", description: "Start hidden." },
    ] },
    { name: "Raw-mode parts", props: [
      { name: "ChartFrame", type: "component", description: "Sizes one Recharts chart to the Chart body." },
      { name: "ChartTooltip", type: "component", description: "Tooltip with the themed, opaque content (indicator, showTotal, showShare, hideLabel)." },
      { name: "ChartXAxis / ChartYAxis", type: "component", description: "Axes with token ticks, formatters, measured y width (format, keys, stacked)." },
      { name: "ChartGrid / ChartReferenceLine", type: "component", description: "Grid in --chart-grid; dashed reference line with label and colour token." },
      { name: "useChart()", type: "hook", description: "config, series, visibleSeries, isHidden, toggleSeries, formatSeries, formatTick, formatX, f, t." },
      { name: "resolveChartColor / seriesColor / seriesPalette", type: "function", description: "\"chart-2\" → \"var(--chart-2)\"; key → \"var(--series-key)\"; first n palette tokens." },
    ] },
  ],
  notes: [
    "Recharts loads only through @vamos-cms/ui/charts — pages without charts never ship it.",
    "Tooltips are opaque (--chart-tooltip) and never blur, even in glass mode: they re-render on every pointer move.",
    "Strokes and text never use the raw accent (lime fails contrast on white); chart-1 is accent-ink.",
  ],
  covers: ["Chart frame"],
};

export default entry;
