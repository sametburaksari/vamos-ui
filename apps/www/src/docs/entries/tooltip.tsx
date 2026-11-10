import { ex, type DocEntry } from "../types";
import TooltipDemo from "../examples/tooltip/demo";
import TooltipShortcut from "../examples/tooltip/shortcut";
import TooltipSides from "../examples/tooltip/sides";
import TooltipDisabledTrigger from "../examples/tooltip/disabled-trigger";
import TooltipTones from "../examples/tooltip/tones";
import TooltipTableActions from "../examples/tooltip/table-actions";

const entry: DocEntry = {
  slug: "tooltip",
  title: "Tooltip",
  group: "Overlays & feedback",
  description:
    "A short label for icon buttons, abbreviations and disabled actions. Opens on hover and keyboard focus, shows an optional shortcut, never blurs and never shows on touch screens.",
  source: ["components/tooltip.tsx", "components/button.tsx", "lib/floating-arrow.tsx"],
  basedOn: "Radix Tooltip",
  usage: `import { Tooltip, TooltipProvider, IconButton } from "@vamos-ui/react";

// once, at the app root (App shell ships it)
<TooltipProvider>{children}</TooltipProvider>

<Tooltip content="Edit post" shortcut="mod+e">
  <Button>Edit</Button>
</Tooltip>

// inside a provider, IconButton shows its label as a tooltip
<IconButton label="Delete post"><Trash2 /></IconButton>`,
  demo: ex("demo", "Demo", "tooltip/demo.tsx", TooltipDemo),
  examples: [
    ex("shortcut", "Keyboard shortcut", "tooltip/shortcut.tsx", TooltipShortcut, "shortcut renders platform-aware keycaps: ⌘ K on Apple devices, Ctrl K elsewhere."),
    ex("sides", "Sides and arrow", "tooltip/sides.tsx", TooltipSides, "side picks the preferred edge; Radix flips it when there is no room. arrow adds a pointer."),
    ex("disabled-trigger", "Explaining a disabled action", "tooltip/disabled-trigger.tsx", TooltipDisabledTrigger, "Disabled buttons fire no events, so the trigger is wrapped in a focusable span automatically."),
    ex("tones", "Tones and inline triggers", "tooltip/tones.tsx", TooltipTones, "inverted (default) is an opaque chip that stays readable on glass; default uses the floating-layer surface for longer hints."),
    ex("table-actions", "Table row actions", "tooltip/table-actions.tsx", TooltipTableActions, "A CMS post list: every IconButton inside the provider labels itself."),
  ],
  api: [
    { name: "Tooltip", props: [
      { name: "content", type: "ReactNode", description: "Tooltip text. Empty or null renders the trigger alone." },
      { name: "children", type: "ReactElement", description: "The trigger, rendered with asChild. Must accept a ref." },
      { name: "shortcut", type: "string | string[]", description: 'Shortcut hint shown with Kbd, e.g. "mod+e" or ["mod", "enter"].' },
      { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"top"', description: "Preferred side." },
      { name: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Alignment against the trigger." },
      { name: "tone", type: '"inverted" | "default"', default: '"inverted"', description: "inverted: opaque high-contrast chip. default: floating-layer surface." },
      { name: "arrow", type: "boolean", default: "false", description: "Show the pointer arrow." },
      { name: "delay", type: "number", description: "Open delay in ms; overrides the provider (400 ms)." },
      { name: "disabled", type: "boolean", default: "false", description: "Render the trigger without a tooltip." },
      { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Controlled or uncontrolled open state." },
      { name: "sideOffset", type: "number", default: "6", description: "Gap to the trigger in px." },
    ] },
    { name: "TooltipProvider", props: [
      { name: "delayDuration", type: "number", default: "400", description: "Hover time before a tooltip opens." },
      { name: "skipDelayDuration", type: "number", default: "300", description: "Window in which the next tooltip opens instantly." },
      { name: "disableHoverableContent", type: "boolean", default: "false", description: "Close as soon as the pointer leaves the trigger." },
    ] },
    { name: "TooltipRoot · TooltipTrigger · TooltipContent", props: [
      { name: "TooltipRoot", type: "Radix Tooltip.Root props", description: "Compound root; adds a provider when none is present." },
      { name: "TooltipTrigger", type: "Radix Tooltip.Trigger props", description: "Use asChild with your own element." },
      { name: "TooltipContent", type: "tone · arrow · shortcut · side · align · sideOffset", description: "Portals into the nearest ThemeScope, z-index --z-tooltip." },
    ] },
    { name: "IconButton (tooltip props)", props: [
      { name: "tooltip", type: "boolean | string", default: "true", description: "Inside a TooltipProvider the label shows as a Tooltip; a string shows different text; false keeps the native title." },
      { name: "tooltipSide", type: '"top" | "right" | "bottom" | "left"', default: '"top"', description: "Side of the tooltip." },
      { name: "shortcut", type: "string | string[]", description: "Shortcut hint in the tooltip." },
    ] },
  ],
  notes: [
    "Tooltips are hidden on touch-only devices (hover: none), so never put information only in a tooltip. IconButton's label is already its accessible name.",
    "The trigger gets aria-describedby pointing at the tooltip. Focus opens it, Escape closes it.",
    "Without a TooltipProvider, IconButton falls back to the native title attribute, so existing code keeps working.",
    "If the content has links or inputs, use Popover instead.",
  ],
  covers: ["Tooltip"],
};

export default entry;
