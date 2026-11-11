import { ex, type DocEntry } from "../types";
import CollapsibleDemo from "../examples/collapsible/demo";
import CollapsibleShowMore from "../examples/collapsible/show-more";
import CollapsibleOrderPanel from "../examples/collapsible/order-panel";
import CollapsibleMotion from "../examples/collapsible/motion";

const entry: DocEntry = {
  slug: "collapsible",
  title: "Collapsible",
  group: "Navigation",
  description:
    "One show/hide region with its trigger — advanced settings in a form, \"show more\" tags, a side-panel block. The single-section primitive under Accordion: no coordination between sections, any element as the trigger, and a height animation that respects reduced motion and data-motion.",
  source: ["components/collapsible.tsx"],
  basedOn: "Radix Collapsible",
  usage: `import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@vamos-ui/react";

<Collapsible>
  <CollapsibleTrigger meta="3 fields">Advanced settings</CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>`,
  demo: ex("demo", "Demo", "collapsible/demo.tsx", CollapsibleDemo),
  examples: [
    ex("show-more", "Show more (asChild, controlled)", "collapsible/show-more.tsx", CollapsibleShowMore, "asChild turns any Button into the trigger; control open to change its label. The first items stay outside the region."),
    ex("order-panel", "Order side panel (CRM)", "collapsible/order-panel.tsx", CollapsibleOrderPanel, "Independent blocks that can all be open at once. meta summarises a closed block and is part of the button's name; disabled locks one."),
    ex("motion", "Motion levels", "collapsible/motion.tsx", CollapsibleMotion, "The region animates its height with ui-collapse. Inside data-motion=\"off\" or with prefers-reduced-motion it opens instantly."),
  ],
  api: [
    { name: "Collapsible", props: [
      { name: "open / defaultOpen / onOpenChange", type: "boolean", default: "false", description: "Controlled or uncontrolled state." },
      { name: "disabled", type: "boolean", description: "The trigger is disabled and the state is locked." },
    ] },
    { name: "CollapsibleTrigger", props: [
      { name: "asChild", type: "boolean", description: "Use your own button (Button, a link-styled control). The built-in row look and chevron are skipped." },
      { name: "icon", type: "ReactNode", description: "Leading icon." },
      { name: "meta", type: "ReactNode", description: "Summary on the end side (\"3 fields\", \"€1,488.00\"). Read as part of the name." },
      { name: "chevron", type: "boolean", default: "true", description: "Trailing chevron that turns when open." },
    ] },
    { name: "CollapsibleContent", props: [
      { name: "forceMount", type: "boolean", description: "Keep the content in the DOM while closed (for find-in-page or animation libraries)." },
      { name: "className", type: "string", description: "Goes on the animated region; put padding on an inner element so the height animation stays smooth." },
    ] },
  ],
  notes: [
    "WAI-ARIA disclosure: a button with aria-expanded and aria-controls; Enter and Space toggle.",
    "Several sections where only one opens at a time, or arrow-key navigation between headers? Use Accordion.",
  ],
  covers: ["Collapsible"],
};

export default entry;
