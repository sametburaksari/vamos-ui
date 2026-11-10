import { ex, type DocEntry } from "../types";
import AccordionDemo from "../examples/accordion/demo";
import AccordionVariants from "../examples/accordion/variants";
import AccordionSidePanel from "../examples/accordion/side-panel";
import AccordionPersisted from "../examples/accordion/persisted";

const entry: DocEntry = {
  slug: "accordion",
  title: "Accordion",
  group: "Navigation",
  description:
    "Collapsible sections for FAQs, policy pages, editor side panels and the mobile menu. Single or multiple open, three variants, header summaries and actions.",
  source: ["components/accordion.tsx"],
  basedOn: "Radix Accordion",
  usage: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@vamos-cms/ui";

<Accordion type="single" collapsible>
  <AccordionItem value="refunds">
    <AccordionTrigger>How do refunds work?</AccordionTrigger>
    <AccordionContent>…</AccordionContent>
  </AccordionItem>
</Accordion>`,
  demo: ex("demo", "Demo", "accordion/demo.tsx", AccordionDemo),
  examples: [
    ex("variants", "Variants (HR policies)", "accordion/variants.tsx", AccordionVariants, "plain is a ruled list, separated boxes each item, card puts them in one panel."),
    ex("side-panel", "Editor side panel (CMS)", "accordion/side-panel.tsx", AccordionSidePanel, "meta summarises a closed section and is part of its name; actions sit beside the toggle as separate controls. Disabled items stay visible."),
    ex("persisted", "Remember open sections", "accordion/persisted.tsx", AccordionPersisted, "Control value and store it — here in localStorage, so the panel reopens the way the user left it."),
  ],
  api: [
    { name: "Accordion", props: [
      { name: "type", type: '"single" | "multiple"', description: "Required. One open section, or any number." },
      { name: "collapsible", type: "boolean", default: "false", description: "single: allow closing the open section." },
      { name: "value · defaultValue", type: "string | string[]", description: "Open section(s); string for single, array for multiple." },
      { name: "onValueChange", type: "(value) => void", description: "Called when sections open or close." },
      { name: "variant", type: '"plain" | "separated" | "card"', default: '"plain"', description: "Ruled list, boxed items, or one panel." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "sm for side panels." },
      { name: "headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "3", description: "Heading that wraps each trigger, to fit the page outline." },
      { name: "disabled", type: "boolean", default: "false", description: "Locks every section." },
    ] },
    { name: "AccordionItem", props: [
      { name: "value", type: "string", description: "Required. Identifies the section." },
      { name: "disabled", type: "boolean", default: "false", description: "Locks this section." },
    ] },
    { name: "AccordionTrigger", props: [
      { name: "icon", type: "ReactNode", description: "Leading icon." },
      { name: "meta", type: "ReactNode", description: "Summary at the end of the header (\"3 selected\"); included in the button's name." },
      { name: "actions", type: "ReactNode", description: "Controls beside the toggle (outside the button)." },
    ] },
    { name: "AccordionContent", props: [
      { name: "forceMount", type: "true", description: "Keep the content mounted while closed." },
      { name: "className", type: "string", description: "Applied to the inner padded box (the outer element animates height)." },
    ] },
  ],
  notes: ["Keyboard: Enter / Space toggles, ↑ ↓ move between headers, Home / End jump to the first / last."],
  covers: ["Accordion"],
};

export default entry;
