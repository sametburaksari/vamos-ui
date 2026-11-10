import { ex, type DocEntry } from "../types";
import BadgeDemo from "../examples/badge/demo";
import BadgeTones from "../examples/badge/tones";
import BadgeStatus from "../examples/badge/status";
import BadgeRemovable from "../examples/badge/removable";
import BadgeCount from "../examples/badge/count";
import BadgeCustomColor from "../examples/badge/custom-color";
import BadgeAsLink from "../examples/badge/as-link";

const entry: DocEntry = {
  slug: "badge",
  title: "Badge",
  group: "Foundations",
  description: "A small label for status, counts and tags — and the kit's removable chip, reused by Tag input, Combobox and Filter bar. Server-compatible.",
  source: ["components/badge.tsx", "lib/islands.tsx"],
  basedOn: "Radix Slot",
  usage: `import { Badge } from "@vamos-cms/ui";

<Badge tone="success" dot>Published</Badge>`,
  demo: ex("demo", "Demo", "badge/demo.tsx", BadgeDemo),
  examples: [
    ex("tones", "Tones", "badge/tones.tsx", BadgeTones, "Colours carry meaning: success, warning, danger, info. Don't use them as decoration."),
    ex("status", "Content status", "badge/status.tsx", BadgeStatus, "Suggested mapping for record statuses."),
    ex("removable", "Removable chips", "badge/removable.tsx", BadgeRemovable, "onRemove adds a × button named \"Remove {label}\"; Delete and Backspace on it remove too."),
    ex("count", "Counts", "badge/count.tsx", BadgeCount, "count uses tabular figures and the locale; above max (99) it shows 99+."),
    ex("custom-color", "Custom colours (CRM labels)", "badge/custom-color.tsx", BadgeCustomColor, "color accepts any CSS colour and tints it like the semantic tones. shape=\"square\" for version tags."),
    ex("as-link", "As link (filters)", "badge/as-link.tsx", BadgeAsLink, "asChild renders your link with hover and focus styles."),
  ],
  api: [{ name: "Badge", props: [
    { name: "tone", type: '"neutral" | "accent" | "success" | "warning" | "danger" | "info" | "outline"', default: '"neutral"', description: "Semantic colour." },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"sm"', description: "Height 20 / 24 / 28 px (lg for filter chips)." },
    { name: "shape", type: '"pill" | "square"', default: '"pill"', description: "square for version and code tags." },
    { name: "dot", type: "boolean", default: "false", description: "Status dot before the label." },
    { name: "color", type: "string", description: "Any CSS colour; overrides tone (user-defined labels)." },
    { name: "count", type: "number", description: "Shows a locale-formatted number instead of children." },
    { name: "max", type: "number", default: "99", description: "Cap for count (99+)." },
    { name: "onRemove", type: "() => void", description: "Makes it a removable chip with a × button." },
    { name: "removeLabel", type: "string", default: '"Remove {label}"', description: "Accessible name of the × button (dictionary badge.remove)." },
    { name: "disabled", type: "boolean", default: "false", description: "Dims the badge and disables removal." },
    { name: "asChild", type: "boolean", default: "false", description: "Render as the child (e.g. a filter link). Ignored with onRemove." },
  ] }],
  covers: ["Badge"],
};

export default entry;
