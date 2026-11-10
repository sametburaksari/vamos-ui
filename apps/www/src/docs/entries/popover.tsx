import { ex, type DocEntry } from "../types";
import PopoverDemo from "../examples/popover/demo";
import PopoverTriggerWidth from "../examples/popover/trigger-width";
import PopoverSchedule from "../examples/popover/schedule";
import PopoverNested from "../examples/popover/nested";
import PopoverLoading from "../examples/popover/loading";

const entry: DocEntry = {
  slug: "popover",
  title: "Popover",
  group: "Overlays & feedback",
  description:
    "Small interactive content anchored to a trigger: a quick form, a picker, a list. Non-modal, labelled by its title, and the base for Combobox and Date Picker.",
  source: ["components/popover.tsx", "lib/floating-arrow.tsx", "lib/layer.tsx"],
  basedOn: "Radix Popover",
  usage: `import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverFooter } from "@vamos-ui/react";

<Popover>
  <PopoverTrigger asChild><Button>Add tag</Button></PopoverTrigger>
  <PopoverContent size="sm">
    <PopoverHeader title="Tag contact" />
    …
  </PopoverContent>
</Popover>`,
  demo: ex("demo", "Demo", "popover/demo.tsx", PopoverDemo),
  examples: [
    ex("trigger-width", "Trigger width list", "popover/trigger-width.tsx", PopoverTriggerWidth, 'size="trigger" matches the trigger; padded={false} for edge-to-edge lists.'),
    ex("schedule", "Schedule a post", "popover/schedule.tsx", PopoverSchedule, "Controlled open state, a small form and an arrow — a CMS publish box pattern."),
    ex("loading", "Loading on open", "popover/loading.tsx", PopoverLoading, "Fetch in onOpenChange and show Skeleton until the data arrives."),
    ex("nested", "Nested layers", "popover/nested.tsx", PopoverNested, "A popover inside another layer is depth 2: in glass mode it turns opaque instead of adding a second blur."),
  ],
  api: [
    { name: "Popover", props: [
      { name: "open / defaultOpen", type: "boolean", description: "Controlled / uncontrolled open state." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when it opens or closes." },
      { name: "modal", type: "boolean", default: "false", description: "Trap focus and block outside interaction." },
    ] },
    { name: "PopoverContent", props: [
      { name: "size", type: '"auto" | "sm" | "md" | "lg" | "trigger"', default: '"md"', description: "Width: auto, 256, 320, 416 px, or the trigger width." },
      { name: "padded", type: "boolean", default: "true", description: "Inner padding from the --gap token. false for lists." },
      { name: "arrow", type: "boolean", default: "false", description: "Pointer arrow towards the trigger." },
      { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: "Preferred side; flips on collision (and in RTL for start/end align)." },
      { name: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Alignment against the trigger." },
      { name: "sideOffset", type: "number", default: "6", description: "Gap to the trigger in px." },
      { name: "collisionPadding", type: "number", default: "12", description: "Distance kept from the viewport edge." },
      { name: "onOpenAutoFocus / onCloseAutoFocus", type: "(event) => void", description: "preventDefault to control focus yourself." },
    ] },
    { name: "PopoverHeader", props: [
      { name: "title", type: "ReactNode", description: "Heading; becomes the popover's accessible name (aria-labelledby)." },
      { name: "description", type: "ReactNode", description: "One line under the title." },
      { name: "action", type: "ReactNode", description: "Trailing element, e.g. a close IconButton." },
    ] },
    { name: "Other parts", props: [
      { name: "PopoverTrigger", type: "Radix Trigger props", description: "Gets aria-expanded and aria-controls. Use asChild with a Button." },
      { name: "PopoverAnchor", type: "Radix Anchor props", description: "Position against another element than the trigger." },
      { name: "PopoverClose", type: "Radix Close props", description: "Closes the popover." },
      { name: "PopoverTitle / PopoverDescription", type: "HTML heading / paragraph props", description: "Use instead of PopoverHeader for custom layouts." },
      { name: "PopoverFooter", type: "HTML div props", description: "Action row with a hairline, bleeding to the panel edge." },
    ] },
  ],
  notes: [
    "Escape closes the popover and returns focus to the trigger.",
    "If the content has nothing interactive, use Tooltip (short label) or Hover Card (rich preview).",
    "Content portals into the nearest ThemeScope, so it keeps a preview's or a dark section's theme.",
  ],
  covers: ["Popover"],
};

export default entry;
