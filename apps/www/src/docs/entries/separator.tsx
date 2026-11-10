import { ex, type DocEntry } from "../types";
import SeparatorDemo from "../examples/separator/demo";
import SeparatorLabel from "../examples/separator/label";
import SeparatorToolbar from "../examples/separator/toolbar";
import SeparatorTones from "../examples/separator/tones";

const entry: DocEntry = {
  slug: "separator",
  title: "Separator",
  group: "Foundations",
  description: "A hairline divider between content: card sections, menu and toolbar groups, the \"or\" on a sign-in form.",
  source: ["components/separator.tsx"],
  basedOn: "Radix Separator",
  usage: `import { Separator } from "@vamos-cms/ui";

<Separator />
<Separator orientation="vertical" />
<Separator label="or" />`,
  demo: ex("demo", "Demo", "separator/demo.tsx", SeparatorDemo),
  examples: [
    ex("label", "With label (sign-in)", "separator/label.tsx", SeparatorLabel, "The label is read as normal text; the lines around it are decorative."),
    ex("toolbar", "Toolbar groups", "separator/toolbar.tsx", SeparatorToolbar, "Between meaningful groups, decorative={false} exposes role=\"separator\" with aria-orientation."),
    ex("tones", "Tones & inset", "separator/tones.tsx", SeparatorTones, "line (default), strong and nav; inset keeps the line off the card edges using --gap."),
  ],
  api: [{ name: "Separator", props: [
    { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Vertical separators stretch to the parent's height." },
    { name: "decorative", type: "boolean", default: "true", description: "Hidden from assistive tech. Set false to announce it as a separator." },
    { name: "label", type: "ReactNode", description: "Text in the middle of a horizontal line." },
    { name: "labelAlign", type: '"start" | "center" | "end"', default: '"center"', description: "Where the label sits." },
    { name: "tone", type: '"line" | "strong" | "nav"', default: '"line"', description: "Hairline, field-border strength, or for the dark sidebar." },
    { name: "inset", type: "boolean", default: "false", description: "Inset by --gap (horizontal) or 6 px (vertical)." },
  ] }],
  covers: ["Separator"],
};

export default entry;
