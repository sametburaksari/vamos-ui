import { ex, type DocEntry } from "../types";
import SkeletonDemo from "../examples/skeleton/demo";
import SkeletonTextExample from "../examples/skeleton/text";
import SkeletonList from "../examples/skeleton/list";
import SkeletonTable from "../examples/skeleton/table";
import SkeletonLoadingState from "../examples/skeleton/loading-state";

const entry: DocEntry = {
  slug: "skeleton",
  title: "Skeleton",
  group: "Foundations",
  description:
    "Placeholders while content loads. Skeletons are hidden from assistive tech; SkeletonGroup announces the region once. The shimmer follows reading direction and stops under reduced motion.",
  source: ["components/skeleton.tsx"],
  usage: `import { Skeleton, SkeletonGroup, SkeletonText } from "@vamos-ui/react";

<SkeletonGroup>
  <Skeleton className="h-4 w-32" />
  <SkeletonText lines={3} />
</SkeletonGroup>`,
  demo: ex("demo", "KPI card", "skeleton/demo.tsx", SkeletonDemo),
  examples: [
    ex("text", "Text", "skeleton/text.tsx", SkeletonTextExample, 'shape="text" sizes lines from the font size (0.8em); SkeletonText ends on a shorter line.'),
    ex("list", "List (HR team)", "skeleton/list.tsx", SkeletonList, "SkeletonAvatar matches the Avatar sizes."),
    ex("table", "Table rows (CRM)", "skeleton/table.tsx", SkeletonTable, "SkeletonRow follows --row-h and --cell-px, so it matches the table in every density."),
    ex("loading-state", "Loading → content", "skeleton/loading-state.tsx", SkeletonLoadingState, "SkeletonGroup sets aria-busy and one hidden status while loading."),
  ],
  api: [
    { name: "Skeleton", props: [
      { name: "shape", type: '"rect" | "text" | "circle"', default: '"rect"', description: "Block, one text line (height 0.8em), or circle." },
      { name: "shimmer", type: "boolean", default: "true", description: "Animated sweep (RTL-aware, off under reduced motion)." },
      { name: "className", type: "string", description: "Size it with classes, e.g. h-4 w-32." },
    ] },
    { name: "SkeletonText", props: [
      { name: "lines", type: "number", default: "3", description: "Number of lines." },
      { name: "lastLineWidth", type: "string", default: '"62%"', description: "Width of the last line." },
      { name: "lineClassName", type: "string", description: "Classes for every line." },
    ] },
    { name: "SkeletonAvatar", props: [
      { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', default: '"md"', description: "20 / 24 / 32 / 40 / 56 px." },
      { name: "shape", type: '"circle" | "square"', default: '"circle"', description: "Square for organisation logos." },
    ] },
    { name: "SkeletonRow", props: [
      { name: "columns", type: "number", default: "4", description: "Columns; the first is twice as wide." },
      { name: "avatar", type: "boolean", default: "false", description: "Avatar + two lines in the first column." },
    ] },
    { name: "SkeletonGroup", props: [
      { name: "loading", type: "boolean", default: "true", description: "aria-busy and the hidden status while true." },
      { name: "label", type: "string", default: '"Loading…"', description: "Announced text (dictionary skeleton.loading)." },
    ] },
  ],
  covers: ["Skeleton"],
};

export default entry;
