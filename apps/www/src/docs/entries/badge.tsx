import { ex, type DocEntry } from "../types";
import BadgeDemo from "../examples/badge/demo";
import BadgeTones from "../examples/badge/tones";
import BadgeStatus from "../examples/badge/status";

const entry: DocEntry = {
  slug: "badge",
  title: "Badge",
  group: "Foundations",
  description: "A small label for status, counts and tags.",
  source: ["components/badge.tsx"],
  usage: `import { Badge } from "@vamos-cms/ui";

<Badge tone="success" dot>Published</Badge>`,
  demo: ex("demo", "Demo", "badge/demo.tsx", BadgeDemo),
  examples: [
    ex("tones", "Tones", "badge/tones.tsx", BadgeTones, "Colours carry meaning: success, warning, danger, info. Don't use them as decoration."),
    ex("status", "Content status", "badge/status.tsx", BadgeStatus, "Suggested mapping for record statuses."),
  ],
  api: [{ name: "Badge", props: [
    { name: "tone", type: '"neutral" | "accent" | "success" | "warning" | "danger" | "info" | "outline"', default: '"neutral"', description: "Semantic colour." },
    { name: "size", type: '"sm" | "md"', default: '"sm"', description: "Height." },
    { name: "dot", type: "boolean", default: "false", description: "Status dot before the label." },
  ] }],
  covers: ["Badge"],
};

export default entry;
