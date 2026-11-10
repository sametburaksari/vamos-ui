import { ex, type DocEntry } from "../types";
import ButtonGroupDemo from "../examples/button-group/demo";
import ButtonGroupSplit from "../examples/button-group/split";
import ButtonGroupWithInput from "../examples/button-group/with-input";
import ButtonGroupVertical from "../examples/button-group/vertical";
import ButtonGroupPagination from "../examples/button-group/pagination";
import ButtonGroupToggleGroup from "../examples/button-group/toggle-group";
import ButtonGroupToolbar from "../examples/button-group/toolbar";

const entry: DocEntry = {
  slug: "button-group",
  title: "Button Group & Toggle Group",
  group: "Foundations",
  description:
    "ButtonGroup merges related buttons into one control — a split Publish ▾, pager arrows, a search field with its button. ToggleGroup adds a selected state with roving focus — view switches, chart ranges, text alignment and formatting. Toggle is a single pressed/unpressed button.",
  source: ["components/button-group.tsx", "components/toggle.tsx", "styles/forms.css"],
  basedOn: "Radix Toggle Group (ToggleGroup, Toggle); ButtonGroup is plain role=group",
  usage: `import { Button, ButtonGroup, ToggleGroup, ToggleGroupItem } from "@vamos-cms/ui";

<ButtonGroup aria-label="Post actions">
  <Button>Preview</Button>
  <Button>Edit</Button>
</ButtonGroup>

<ToggleGroup aria-label="View" defaultValue="board">
  <ToggleGroupItem value="list">List</ToggleGroupItem>
  <ToggleGroupItem value="board">Board</ToggleGroupItem>
</ToggleGroup>`,
  demo: ex("demo", "Demo", "button-group/demo.tsx", ButtonGroupDemo),
  examples: [
    ex("split", "Split button", "button-group/split.tsx", ButtonGroupSplit, "A primary group with ButtonGroupSeparator, so the merged edge stays visible on the accent fill. The chevron opens a Dropdown Menu."),
    ex("with-input", "With an input", "button-group/with-input.tsx", ButtonGroupWithInput, "Inputs and ButtonGroupText segments merge the same way; the focused child is raised so its ring isn't clipped."),
    ex("pagination", "Pager", "button-group/pagination.tsx", ButtonGroupPagination, "variant and size on the group apply to direct Button / IconButton children that don't set their own."),
    ex("vertical", "Vertical", "button-group/vertical.tsx", ButtonGroupVertical, 'orientation="vertical" — map zoom controls. attached={false} keeps a gap instead of merging.'),
    ex("toggle-group", "View switch (ToggleGroup)", "button-group/toggle-group.tsx", ButtonGroupToggleGroup, 'The default "segmented" look: an inset track and a raised thumb. Single mode never empties unless allowEmpty is set.'),
    ex("toolbar", "Editor toolbar", "button-group/toolbar.tsx", ButtonGroupToolbar, 'type="multiple" for B / I / U, "outline" for attached alignment buttons, and a lone Toggle. Icon-only items take a label.'),
  ],
  api: [
    {
      name: "ButtonGroup",
      props: [
        { name: "attached", type: "boolean", default: "true", description: "Merge borders and corners; false keeps an 8px gap." },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Direction; corners merge with logical properties (RTL-safe)." },
        { name: "variant", type: "Button variant", description: "Default for direct Button / IconButton children." },
        { name: "size", type: '"xs" | "sm" | "md" | "lg"', description: "Default size for direct Button / IconButton children." },
        { name: "aria-label", type: "string", description: "Recommended: names the group." },
      ],
    },
    {
      name: "ButtonGroupSeparator",
      props: [{ name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Hairline between attached buttons that share a fill." }],
    },
    {
      name: "ButtonGroupText",
      props: [{ name: "size", type: '"xs" | "sm" | "md" | "lg"', default: '"md"', description: "A static segment (\"21–40 of 340\", a prefix or unit)." }],
    },
    {
      name: "ToggleGroup",
      props: [
        { name: "type", type: '"single" | "multiple"', default: '"single"', description: "One active item, or independent pressed states." },
        { name: "value / defaultValue", type: "string | string[]", description: "Active item(s)." },
        { name: "onValueChange", type: "(value) => void", description: "Called with the next value." },
        { name: "allowEmpty", type: "boolean", default: "false", description: "Single only: allow deselecting the active item." },
        { name: "variant", type: '"segmented" | "outline" | "ghost"', default: '"segmented"', description: "Inset track + thumb, attached bordered buttons, or loose toolbar buttons." },
        { name: "size", type: '"xs" | "sm" | "md" | "lg"', default: '"md"', description: "md follows --control-h." },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Layout and arrow-key axis." },
        { name: "block", type: "boolean", description: "Full width, items share the space." },
        { name: "rovingFocus / loop", type: "boolean", default: "true", description: "Arrow-key navigation behaviour." },
      ],
    },
    {
      name: "ToggleGroupItem / Toggle",
      props: [
        { name: "value", type: "string", description: "ToggleGroupItem only. Required." },
        { name: "label", type: "string", description: "Accessible name + tooltip for icon-only items." },
        { name: "pressed / defaultPressed / onPressedChange", type: "boolean", description: "Toggle only: aria-pressed state." },
        { name: "variant", type: '"ghost" | "outline"', default: '"ghost"', description: "Toggle only." },
        { name: "size", type: '"xs" | "sm" | "md" | "lg"', default: '"md"', description: "Toggle only (items take the group size)." },
        { name: "disabled", type: "boolean", description: "Skipped by arrow keys." },
      ],
    },
  ],
  notes: [
    "ButtonGroup has no roving focus: every button is its own tab stop. Use ToggleGroup when the buttons are a set of states.",
    "Choosing: a form value → RadioGroup (segmented); a view or toolbar state → ToggleGroup; independent actions → ButtonGroup.",
  ],
  covers: ["Button Group"],
};

export default entry;
