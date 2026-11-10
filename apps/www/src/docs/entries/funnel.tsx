import { ex, type DocEntry } from "../types";
import FunnelDemo from "../examples/funnel/demo";
import FunnelAmount from "../examples/funnel/amount";
import FunnelCompare from "../examples/funnel/compare";
import FunnelVertical from "../examples/funnel/vertical";

const entry: DocEntry = {
  slug: "funnel",
  title: "Funnel",
  group: "Charts",
  description:
    "Stage-by-stage conversion as aligned bars: each stage's value, conversion from the previous stage, drop-off, overall rate and an optional amount. Columns in a wide container, rows in a narrow one. Plain DOM — no chart library.",
  source: ["charts/funnel.tsx"],
  usage: `import { Funnel } from "@vamos-cms/ui/charts";

<Funnel title="Sales pipeline" steps={[
  { key: "leads", label: "Leads", value: 1240 },
  { key: "won", label: "Won", value: 84 },
]} />`,
  demo: ex("demo", "Sales pipeline (CRM)", "funnel/demo.tsx", FunnelDemo),
  examples: [
    ex("amount", "Value per stage", "funnel/amount.tsx", FunnelAmount, "amount per stage, written compact (\"$2.1M\")."),
    ex("compare", "Vs previous period (site)", "funnel/compare.tsx", FunnelCompare, "compareTo adds a marker at last period's size and the change in conversion, in points."),
    ex("vertical", "Rows, clickable (HR)", "funnel/vertical.tsx", FunnelVertical, "orientation=\"vertical\" for narrow panels; onStepClick makes each stage a button."),
  ],
  api: [
    { name: "Funnel", props: [
      { name: "steps", type: "{ key, label, value, amount?, href? }[]", description: "Stages in order." },
      { name: "title", type: "string", description: "Accessible name of the list." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Columns (rows below a 36rem container) or always rows." },
      { name: "show", type: '("conversion" | "overall" | "dropoff")[]', default: '["conversion", "dropoff"]', description: "Metrics under each stage." },
      { name: "format", type: "FormatSpec", default: '"integer"', description: "Stage value format." },
      { name: "amountFormat", type: "FormatSpec", default: '"currency"', description: "Amount format (compact under the bar, full in the stage sentence)." },
      { name: "color", type: "ChartColor", default: '"chart-1"', description: "Base colour; later stages fade toward the surface." },
      { name: "compareTo", type: "FunnelStep[]", description: "Same stages for a previous period." },
      { name: "onStepClick", type: "(step) => void", description: "Stages become buttons; stages with href are links." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Bar thickness." },
      { name: "loading", type: "boolean", description: "Stepped skeleton." },
      { name: "labels", type: "Partial<FunnelLabels>", description: "funnel namespace: stage, stageWithConversion, conversion, overall, dropoff, compare, points." },
    ] },
  ],
  notes: ["Each stage reads as one sentence: \"Proposal: 205 (34% of Qualified)\".", "Drop-off is muted, not red — losing leads between stages is normal.", "A stage larger than the one before logs a development warning but still renders."],
  covers: ["Funnel"],
};

export default entry;
