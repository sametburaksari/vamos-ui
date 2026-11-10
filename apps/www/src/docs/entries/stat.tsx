import { ex, type DocEntry } from "../types";
import StatDemo from "../examples/stat/demo";
import StatCurrencyCompact from "../examples/stat/currency-compact";
import StatIntent from "../examples/stat/intent";
import StatTargetExample from "../examples/stat/target";
import StatPlainGrid from "../examples/stat/plain-grid";
import StatDelta from "../examples/stat/delta";
import StatStates from "../examples/stat/states";
import StatLocale from "../examples/stat/locale";

const entry: DocEntry = {
  slug: "stat",
  title: "Stat",
  group: "Data display",
  description:
    "One metric with its change and a mini trend: KPI rows, dashboard tiles, record summaries. Values are formatted with Intl in the current locale; the Delta colour follows the metric's intent (is lower better?) and never carries meaning alone. Server-component compatible, no chart library.",
  source: ["components/stat.tsx", "components/sparkline.tsx", "lib/data-islands.tsx", "lib/value-format.ts"],
  basedOn: "Native <dl> + plain SVG",
  usage: `import { Stat, StatGroup } from "@vamos-cms/ui";

<StatGroup>
  <Stat label="Visitors" value={28412} delta={0.124} trend={[4, 6, 5, 8, 7, 9, 12]} comparison="vs previous 30 days" />
  <Stat label="Avg. response" value={4320} format="duration" delta={-0.18} intent="lower-is-better" />
</StatGroup>`,
  demo: ex("demo", "KPI row (CMS dashboard)", "stat/demo.tsx", StatDemo),
  examples: [
    ex("currency-compact", "Money (CRM)", "stat/currency-compact.tsx", StatCurrencyCompact, "format=\"compact-currency\" → $1.2M; decimal strings are formatted exactly; pass { type, currency, options } for anything else."),
    ex("intent", "Lower is better", "stat/intent.tsx", StatIntent, "intent decides the colour: a drop in cancellations or response time is good news. neutral keeps it grey."),
    ex("target", "Progress to goal", "stat/target.tsx", StatTargetExample, "target adds a goal bar; it turns success-coloured when reached."),
    ex("plain-grid", "Metrics in one surface (HR / PRM)", "stat/plain-grid.tsx", StatPlainGrid, "StatGroup variant=\"plain\" with plain Stats: hairline dividers, one surface (one blur in glass). href turns a stat into a drill-down link."),
    ex("delta", "Delta", "stat/delta.tsx", StatDelta, "Standalone change indicator for table cells and lists — arrow + sign + colour, spoken as \"Up 12.4%\"."),
    ex("states", "Loading, no data, error", "stat/states.tsx", StatStates, "loading sizes the skeleton to label + value; null shows — and reads \"No data\"; error takes a retry slot."),
    ex("locale", "en-US and tr-TR", "stat/locale.tsx", StatLocale, "Intl places the sign and percent: +12.4% vs +%12,4; compact $1.2M vs ₺1,2 Mn; durations 2m 47s vs 2 dk. 47 sn."),
  ],
  api: [
    { name: "Stat", props: [
      { name: "label", type: "ReactNode", description: "Metric name (dt)." },
      { name: "value", type: "number | string | null", description: "Numbers are formatted; strings shown as is; null → \"—\" + No data." },
      { name: "format", type: "ValueFormat", default: '"number"', description: '"number" | "integer" | "decimal" | "currency" | "compact" | "compact-currency" | "percent" (ratio) | "duration" (s) | "bytes" | { type, currency, options }.' },
      { name: "delta", type: "number | null", description: "Change; with deltaKind=\"percent\" a ratio (0.124 → +12.4%)." },
      { name: "deltaKind", type: '"percent" | "number" | "currency"', default: '"percent"', description: "How the delta is formatted." },
      { name: "deltaVariant", type: '"text" | "badge"', default: '"text"', description: "Delta look." },
      { name: "intent", type: '"higher-is-better" | "lower-is-better" | "neutral"', default: '"higher-is-better"', description: "Which direction is good news (colour of delta and trend)." },
      { name: "comparison", type: "ReactNode", description: "Footer line; a string is appended to the spoken delta." },
      { name: "trend", type: "(number | null)[]", description: "Sparkline values, oldest first. Summarised for screen readers." },
      { name: "trendVariant", type: '"line" | "area" | "bars"', default: '"line"', description: "Sparkline style." },
      { name: "target", type: "{ value: number; label?: ReactNode }", description: "Progress-to-goal bar." },
      { name: "icon", type: "LucideIcon", description: "Small icon before the label." },
      { name: "href", type: "string", description: "Whole stat becomes a link." },
      { name: "loading", type: "boolean", default: "false", description: "Skeleton + aria-busy." },
      { name: "error / errorAction", type: "ReactNode", description: "Error text in place of the value, plus a retry slot." },
      { name: "variant", type: '"card" | "plain" | "inline"', default: '"card"', description: "Own surface, a cell in a plain StatGroup, or no chrome." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Value 20 / 28 / 40 px (mono, tabular)." },
      { name: "labels", type: "Partial<StatLabels>", description: "up, down, flat, noData, trendUp/Down/Flat, goal, goalReached." },
    ] },
    { name: "Delta", props: [
      { name: "value", type: "number | null", description: "The change (percent kind = ratio)." },
      { name: "kind", type: '"percent" | "number" | "currency"', default: '"percent"', description: "Formatting." },
      { name: "currency", type: "string", description: "ISO 4217 for kind=\"currency\" (default: provider currency)." },
      { name: "intent", type: "StatIntent", default: '"higher-is-better"', description: "Colour semantics." },
      { name: "variant", type: '"text" | "badge"', default: '"text"', description: "Plain or soft pill." },
      { name: "precision", type: "number", description: "Max fraction digits." },
      { name: "srLabel / comparison", type: "string", description: "Override or extend the spoken sentence." },
    ] },
    { name: "StatGroup", props: [
      { name: "columns", type: "2 | 3 | 4", default: "4", description: "Max columns; container queries drop to 2 and 1." },
      { name: "variant", type: '"cards" | "plain"', default: '"cards"', description: "Separate cards, or one surface with dividers." },
    ] },
    { name: "StatLabel / StatValue / StatDelta / StatTrend / StatFooter / StatTarget", props: [
      { name: "StatValue value / format", type: "number | string | null / ValueFormat", description: "Formatted value; or pass children." },
      { name: "StatTarget value / target / label", type: "number / number / ReactNode", description: "Goal bar." },
      { name: "...props", type: "HTMLAttributes", description: "Composition parts (dt / dd) for custom layouts." },
    ] },
  ],
  notes: ["Period selection (7D / 30D / 90D) belongs to the parent card, not to Stat.", "No count-up animation: numbers are readable immediately and never re-announce."],
  covers: ["Stat / KPI"],
};

export default entry;
