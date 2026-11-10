import { ex, type DocEntry } from "../types";
import GaugeDemo from "../examples/gauge/demo";
import GaugeRing from "../examples/gauge/ring";
import GaugeThresholds from "../examples/gauge/thresholds";
import GaugeTarget from "../examples/gauge/target";

const entry: DocEntry = {
  slug: "gauge",
  title: "Gauge & Progress ring",
  group: "Charts",
  description:
    "A score or attainment on a 180° / 270° arc with threshold bands and a target marker, and a full ring for progress to a goal — from a 20 px table-cell ring to a 160 px dashboard gauge. Plain SVG.",
  source: ["charts/gauge.tsx"],
  usage: `import { Gauge, ProgressRing } from "@vamos-cms/ui/charts";

<Gauge value={64} aria-label="SEO score" semantic="meter" />
<ProgressRing value={85} format="percent" aria-label="Profile completeness" />`,
  demo: ex("demo", "Score arc (CMS)", "gauge/demo.tsx", GaugeDemo),
  examples: [
    ex("ring", "Progress ring sizes", "gauge/ring.tsx", GaugeRing, "xs 20 · sm 36 · md 96 · lg 160 px. Labels show from 64 px; xs fits inline and in tables."),
    ex("thresholds", "Thresholds (CRM)", "gauge/thresholds.tsx", GaugeThresholds, "color=\"auto\" picks the band colour; the band label is read in aria-valuetext."),
    ex("target", "Quota with target", "gauge/target.tsx", GaugeTarget, "target draws a marker; over max the arc stays full and a ring marks the overshoot."),
  ],
  api: [
    { name: "Gauge", props: [
      { name: "value", type: "number | null", description: "Current value; null = unknown (\"—\")." },
      { name: "max", type: "number", default: "100", description: "Scale maximum." },
      { name: "aria-label", type: "string", description: "Required accessible name." },
      { name: "arc", type: "180 | 270", default: "270", description: "Sweep." },
      { name: "thresholds", type: "{ at, color, label? }[]", description: "Bands from `at` upward." },
      { name: "showThresholdBands", type: "boolean", default: "false", description: "Paint the bands as a thin outer ring." },
      { name: "target", type: "number", description: "Marker on the arc." },
      { name: "color", type: 'ChartColor | "auto"', default: '"chart-1"', description: "Fill token, or the threshold colour." },
      { name: "format", type: "FormatSpec", description: "\"percent\" shows value / max; anything else formats the value." },
      { name: "semantic", type: '"meter" | "progress"', default: '"meter"', description: "role=\"meter\" for scores, role=\"progressbar\" for completion." },
      { name: "size", type: '"xs" | "sm" | "md" | "lg" | number', default: '"lg"', description: "Width in px." },
      { name: "thickness", type: "number", description: "Stroke width." },
      { name: "label", type: "ReactNode | null", description: "Centre content; default the formatted value + band label." },
      { name: "labels", type: "Partial<GaugeLabels>", description: "gauge namespace: valueText, valueTextWithLabel, target, noValue." },
    ] },
    { name: "ProgressRing", props: [
      { name: "value / max / aria-label / format / thresholds / color / label", type: "—", description: "As Gauge." },
      { name: "semantic", type: '"progress" | "meter"', default: '"progress"', description: "ARIA role." },
      { name: "size", type: '"xs" | "sm" | "md" | "lg" | number', default: '"md"', description: "20 / 36 / 96 / 160 px." },
    ] },
  ],
  notes: ["In RTL only the arc mirrors; numbers stay readable.", "The indeterminate circular spinner belongs to Spinner / Progress, not here."],
  covers: ["Gauge"],
};

export default entry;
