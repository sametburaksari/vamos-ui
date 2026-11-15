import { ex, type DocEntry } from "../types";
import UptimeBarsDemo from "../examples/uptime-bars/demo";
import UptimeBarsSelectable from "../examples/uptime-bars/selectable";
import UptimeBarsWeekly from "../examples/uptime-bars/weekly";

const entry: DocEntry = {
  slug: "uptime-bars",
  title: "Uptime bars",
  group: "Data display",
  description:
    "Per-period status bars for one service — the uptime row of a status page or a health panel. Hover or focus a bar for its date, state and uptime; the row is one tab stop with arrow-key movement, and a summary line shows the uptime over the range. Bad days also dip in height, so state never rests on colour alone.",
  source: ["components/uptime-bars.tsx"],
  basedOn: "Tooltip (Radix) + roving tabindex",
  usage: `import { UptimeBars, UptimeLegend } from "@vamos-ui/react";

<UptimeLegend />
<UptimeBars name="Public API" bars={days} onBarSelect={(day) => openIncident(day.date)} />`,
  demo: ex("demo", "Status page rows", "uptime-bars/demo.tsx", UptimeBarsDemo),
  examples: [
    ex("selectable", "Open an incident from a bar", "uptime-bars/selectable.tsx", UptimeBarsSelectable, "onBarSelect runs on click and Enter; selectable: false makes quiet days inert (aria-disabled). details adds rich tooltip content."),
    ex("weekly", "Weekly periods", "uptime-bars/weekly.tsx", UptimeBarsWeekly, "label replaces the formatted date; startLabel / endLabel rename the summary ends; precision sets the decimals."),
  ],
  api: [
    { name: "UptimeBars", props: [
      { name: "bars", type: "UptimeBar[]", description: "Periods, oldest first." },
      { name: "name", type: "string", description: "Service name — names the row for screen readers (\"Public API, uptime history\")." },
      { name: "uptime", type: "number", description: "Summary figure 0–100. Default: uptimePercent(bars)." },
      { name: "precision", type: "number", default: "2", description: "Fraction digits of uptime figures." },
      { name: "dateFormat", type: "DatePreset | Intl.DateTimeFormatOptions", default: '"medium"', description: "Date in the tooltip and accessible names." },
      { name: "onBarSelect", type: "(bar, index) => void", description: "Click / Enter on a selectable bar." },
      { name: "severity", type: "boolean", default: "true", description: "Bars dip by severity (degraded → partial → major); maintenance is hatched, no data is dashed." },
      { name: "summary", type: "boolean", default: "true", description: "Start · uptime · end line under the bars." },
      { name: "startLabel / endLabel", type: "ReactNode", default: '"{n} days ago" / "Today"', description: "Ends of the summary line." },
      { name: "legend", type: "boolean", default: "false", description: "Legend under this row (use UptimeLegend once for a list)." },
      { name: "labels", type: "Partial<UptimeBarsLabels>", description: 'Dictionary namespace "uptimeBars": state names, uptime, rowLabel, start, end, legend, selectHint.' },
    ] },
    { name: "UptimeBar", props: [
      { name: "date", type: "string", description: "\"YYYY-MM-DD\" or ISO instant." },
      { name: "status", type: '"operational" | "degraded" | "partial" | "major" | "maintenance" | "none"', description: "State of the period." },
      { name: "uptime", type: "number", description: "0–100. Missing counts as 100 in the summary." },
      { name: "label", type: "string", description: "Period name instead of the date (\"Week 42\")." },
      { name: "note", type: "string", description: "Plain text in the tooltip and the accessible name." },
      { name: "details", type: "ReactNode", description: "Extra tooltip content (not read as the name)." },
      { name: "selectable", type: "boolean", default: "true", description: "With onBarSelect: false makes the bar inert." },
    ] },
    { name: "UptimeLegend", props: [
      { name: "statuses", type: "UptimeStatus[]", description: "States to list. Default: all six." },
      { name: "severity", type: "boolean", default: "true", description: "Swatches match the bar heights." },
    ] },
    { name: "uptimePercent(bars)", props: [{ name: "returns", type: "number | null", description: "Mean uptime of the bars with data." }] },
  ],
  notes: [
    "Tooltips never show on touch: every fact in a tooltip is also in the bar's accessible name, so put what matters in note, not only details.",
    "Colours come from the status tokens (success, warning, danger, info, track); percentages from the locale formatter (\"99.95%\" / \"%99,95\").",
  ],
  covers: [],
};

export default entry;
