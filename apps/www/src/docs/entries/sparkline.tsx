import { ex, type DocEntry } from "../types";
import SparklineDemo from "../examples/sparkline/demo";
import SparklineInTable from "../examples/sparkline/in-table";
import SparklineReference from "../examples/sparkline/reference";
import SparklineFluid from "../examples/sparkline/fluid";

const entry: DocEntry = {
  slug: "sparkline",
  title: "Sparkline",
  group: "Charts",
  description:
    "An axis-less mini trend in plain SVG — light enough for a hundred table rows. Line, area, bars and win/loss; token colours; null gaps; a shared domain to compare rows; fluid width with crisp strokes. Decorative unless you give it a label.",
  source: ["components/sparkline.tsx"],
  basedOn: "Plain SVG",
  usage: `import { Sparkline, sparklineSummary } from "@vamos-ui/react";

<Sparkline values={[4, 6, 5, 8, 7, 9, 12]} className="text-accent-ink" />
<Sparkline values={weekly} variant="bars" size="xs" label={sparklineSummary(weekly)} />`,
  demo: ex("demo", "Variants", "sparkline/demo.tsx", SparklineDemo),
  examples: [
    ex("in-table", "In a table", "sparkline/in-table.tsx", SparklineInTable, "size=\"xs\" (64×20) with one domain for every row, so heights compare. null leaves a gap (page did not exist yet)."),
    ex("reference", "Target line and markers", "sparkline/reference.tsx", SparklineReference, "reference draws a dashed line; showMinMax and showLast add dots. With label it becomes role=\"img\"."),
    ex("fluid", "Fluid width", "sparkline/fluid.tsx", SparklineFluid, "width=\"100%\" stretches the viewBox; strokes and dots stay crisp (non-scaling stroke)."),
  ],
  api: [
    { name: "Sparkline", props: [
      { name: "values", type: "(number | null)[]", description: "Oldest first; null is a gap. Empty → dashed placeholder." },
      { name: "variant", type: '"line" | "area" | "bars" | "winloss"', default: '"line"', description: "Mark type. winloss uses the sign of each value (success / danger)." },
      { name: "size", type: '"xs" | "sm" | "md"', default: '"sm"', description: "64×20 / 96×32 / 160×40." },
      { name: "width", type: 'number | "100%"', description: "Overrides size; \"100%\" fills the container." },
      { name: "height", type: "number", description: "Overrides size." },
      { name: "color", type: "SparklineColor", default: "currentColor", description: '"chart-1".."chart-6" | "accent-ink" | "success" | … or any CSS colour.' },
      { name: "strokeWidth", type: "number", default: "1.6", description: "Line width." },
      { name: "showLast", type: "boolean", default: "false", description: "Dot on the last value (bars: dims the others)." },
      { name: "showMinMax", type: "boolean", default: "false", description: "Dots on the low and high points." },
      { name: "reference", type: "number", description: "Dashed reference line (target, average)." },
      { name: "domain", type: "[number, number]", description: "Shared scale across rows." },
      { name: "label", type: "string", description: "Accessible description (role=\"img\"); otherwise aria-hidden." },
    ] },
    { name: "Helpers", props: [
      { name: "sparklineSummary(values, format?)", type: "string", description: '"Rose from 4 to 14, peak 14" — a starting point for label.' },
      { name: "sparklineDirection(values)", type: "-1 | 0 | 1", description: "Direction from first to last value." },
      { name: "sparklineColor(token)", type: "string", description: '"chart-2" → "var(--chart-2)".' },
    ] },
  ],
  notes: ["Time runs left to right in every direction (not mirrored in RTL)."],
  covers: ["Sparkline"],
};

export default entry;
