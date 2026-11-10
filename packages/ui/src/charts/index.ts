// Public API of @vamos-cms/ui/charts — owned by the charts group.
// Recharts is only reachable through this subpath; pages without charts never load it.

export {
  CHART_HEIGHTS,
  resolveChartColor,
  seriesPalette,
  seriesColor,
  seriesVarName,
  resolveSeries,
  patternDash,
  formatValue,
  formatCategory,
  summarizeSeries,
  seriesStats,
  alignZeroDomains,
  niceStep,
  quantileBreaks,
  type ChartColor,
  type ChartDatePreset,
  type FormatSpec,
  type SeriesConfig,
  type SeriesPattern,
  type ChartConfig,
  type ChartState,
  type ChartHeight,
  type ResolvedSeries,
  type SeriesStats,
} from "./utils";

export {
  Chart,
  useChart,
  useOptionalChart,
  chartLabels,
  ChartLegendContent,
  ChartIndicator,
  ChartSkeleton,
  ChartRefreshBar,
  ChartEmpty,
  ChartError,
  ChartDataTable,
  type ChartProps,
  type ChartLabels,
  type ChartContextValue,
  type ChartSkeletonKind,
  type ChartTableColumn,
  type ChartTableSpec,
  type ChartLegendContentProps,
  type ChartDataTableProps,
} from "./chart-shell";

export {
  ChartFrame,
  ChartTooltip,
  ChartTooltipContent,
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartReferenceLine,
  useValueAxisWidth,
  usePointClick,
  type ChartFrameProps,
  type ChartTooltipProps,
  type ChartTooltipContentProps,
} from "./chart";

export { AreaChart, type AreaChartProps, type ChartReference } from "./area-chart";
export { BarChart, type BarChartProps } from "./bar-chart";
export { BarList, type BarListProps, type BarListItem } from "./bar-list";
export { LineChart, type LineChartProps } from "./line-chart";
export { DonutChart, type DonutChartProps } from "./donut-chart";
export { ComboChart, type ComboChartProps } from "./combo-chart";
export { Funnel, funnelLabels, type FunnelProps, type FunnelStep, type FunnelLabels } from "./funnel";
export { Gauge, ProgressRing, gaugeLabels, type GaugeProps, type ProgressRingProps, type GaugeThreshold, type GaugeLabels } from "./gauge";
export { Heatmap, heatmapLabels, weekStartOf, type HeatmapProps, type HeatmapCell, type HeatmapCategory, type HeatmapLabels } from "./heatmap";
