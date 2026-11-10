import { ex, type DocEntry } from "../types";
import HeatmapCalendar from "../examples/heatmap/calendar";
import HeatmapMatrixHours from "../examples/heatmap/matrix-hours";
import HeatmapDiverging from "../examples/heatmap/diverging";
import HeatmapCategorical from "../examples/heatmap/categorical";

const entry: DocEntry = {
  slug: "heatmap",
  title: "Heatmap",
  group: "Charts",
  description:
    "Density patterns as tinted cells: a calendar (weeks × weekdays — publishing, activity, attendance) or a matrix (weekday × hour, department × month). Sequential, diverging and categorical scales; an ARIA grid with full keyboard support and a data-table alternative. Plain DOM — no chart library.",
  source: ["charts/heatmap.tsx", "charts/chart-shell.tsx"],
  usage: `import { Heatmap } from "@vamos-ui/react/charts";

<Heatmap mode="calendar" title="Posts published" data={[{ x: "2026-11-10", value: 3 }]} valueLabel="Posts" />`,
  demo: ex("calendar", "Calendar (CMS)", "heatmap/calendar.tsx", HeatmapCalendar),
  examples: [
    ex("matrix-hours", "Weekday × hour (CRM)", "heatmap/matrix-hours.tsx", HeatmapMatrixHours, "Best call hours. Seven steps from chart-2."),
    ex("diverging", "Diverging (finance)", "heatmap/diverging.tsx", HeatmapDiverging, "scale=\"diverging\": danger ↔ neutral ↔ success around zero, symmetric domain."),
    ex("categorical", "Attendance states (HR)", "heatmap/categorical.tsx", HeatmapCategorical, "scale=\"categorical\" colours each cell by its category; fixed cellSize scrolls when wider."),
  ],
  api: [
    { name: "Heatmap", props: [
      { name: "mode", type: '"calendar" | "matrix"', description: "Weeks × weekdays, or rows × columns." },
      { name: "data", type: "{ x, y?, value, category?, meta? }[]", description: "Calendar: x is \"YYYY-MM-DD\". Matrix: x = column, y = row." },
      { name: "title", type: "string", description: "Grid name and table caption." },
      { name: "range", type: "{ from, to }", description: "Calendar range. Default: first to last date in data." },
      { name: "xLabels / yLabels", type: "string[]", description: "Matrix order. Default: order of appearance." },
      { name: "scale", type: '"sequential" | "diverging" | "categorical"', default: '"sequential"', description: "Colour scale." },
      { name: "categories", type: "{ value, label, color }[]", description: "Categorical palette." },
      { name: "steps", type: "4 | 5 | 7", default: "5", description: "Colour steps (5 + chart-1 uses --chart-seq-0…4)." },
      { name: "domain", type: "[number, number]", description: "Linear breaks. Default: quantile breaks." },
      { name: "color", type: "ChartColor", default: '"chart-1"', description: "Sequential base colour." },
      { name: "format / valueLabel", type: "FormatSpec / string", description: "Value format and the measured thing (\"Posts\")." },
      { name: "weekStart", type: "0–6", description: "Override the locale week start (Sunday en-US, Monday tr-TR)." },
      { name: "today", type: "string | null", description: "Ringed day. Default: today in the provider time zone, after mount." },
      { name: "cellSize", type: '"auto" | number', default: '"auto"', description: "Fill the width, or fixed px with horizontal scroll." },
      { name: "tooltip", type: "(cell) => ReactNode", description: "Custom tooltip content." },
      { name: "onCellClick", type: "(cell) => void", description: "Click or Enter / Space on a cell." },
      { name: "tableToggle / state / summary / showLegend", type: "—", description: "As Chart frame; legend reads Less ↔ More." },
      { name: "labels", type: "Partial<HeatmapLabels>", description: "heatmap namespace: less, more, cell, noData, date, value, summaries." },
    ] },
  ],
  notes: [
    "Keyboard: arrows move (calendar: up/down = day, left/right = week), Home / End jump within a row, PageUp / PageDown move a month (calendar) or to the column ends (matrix).",
    "Each cell is labelled in full (\"Tuesday, November 10, 2026: 3 posts\"); the visual tooltip is decorative.",
    "In glass mode the lightest step uses --track so it does not vanish into a translucent card.",
  ],
  covers: ["Heatmap"],
};

export default entry;
