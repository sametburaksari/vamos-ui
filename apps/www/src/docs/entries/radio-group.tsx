import { ex, type DocEntry } from "../types";
import RadioGroupDemo from "../examples/radio-group/demo";
import RadioGroupCard from "../examples/radio-group/card";
import RadioGroupSegmented from "../examples/radio-group/segmented";
import RadioGroupHorizontal from "../examples/radio-group/horizontal";
import RadioGroupStates from "../examples/radio-group/states";

const entry: DocEntry = {
  slug: "radio-group",
  title: "Radio Group",
  group: "Forms & inputs",
  description:
    "Pick exactly one of a small set — post visibility, invoice type, a plan. Classic radios with descriptions, selectable cards, or a compact segmented control. One tab stop, arrow keys move and select.",
  source: ["components/radio-group.tsx", "lib/field-context.tsx", "styles/forms.css"],
  basedOn: "Radix Radio Group",
  usage: `import { Field, RadioGroup } from "@vamos-ui/react";

<Field label="Visibility">
  <RadioGroup
    name="visibility"
    defaultValue="public"
    items={[
      { value: "public", label: "Public" },
      { value: "private", label: "Private" },
    ]}
  />
</Field>`,
  demo: ex("demo", "Demo", "radio-group/demo.tsx", RadioGroupDemo),
  examples: [
    ex("card", "Plan cards", "radio-group/card.tsx", RadioGroupCard, 'variant="card" with icon, description and free content (price, badge) as children of RadioGroupItem.'),
    ex("segmented", "Segmented", "radio-group/segmented.tsx", RadioGroupSegmented, "For short labels that are a form value. For view or toolbar state use ToggleGroup (see Button Group)."),
    ex("horizontal", "Conditional fields", "radio-group/horizontal.tsx", RadioGroupHorizontal, "Controlled value drives which fields follow — a typical checkout / invoice form."),
    ex("states", "Sizes & states", "radio-group/states.tsx", RadioGroupStates, "Small size, a disabled option, the Field error state and read-only."),
  ],
  api: [
    {
      name: "RadioGroup",
      props: [
        { name: "value", type: "V | null", description: "Controlled value; null = nothing selected." },
        { name: "defaultValue", type: "V | null", default: "null", description: "Initial value (uncontrolled)." },
        { name: "onValueChange", type: "(value: V) => void", description: "Called when the selection changes." },
        { name: "items", type: "{ value, label, description?, icon?, disabled? }[]", description: "Shorthand; or compose RadioGroupItem children." },
        { name: "variant", type: '"default" | "card" | "segmented"', default: '"default"', description: "Circles, selectable tiles, or a segmented control." },
        { name: "orientation", type: '"vertical" | "horizontal"', default: 'vertical (segmented: horizontal)', description: "Layout and arrow-key axis." },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "16 / 18 px circles; segment height from --control-h." },
        { name: "name", type: "string", description: "Form name (hidden input). Inherited from Field." },
        { name: "invalid / readOnly / required / disabled", type: "boolean", description: "Group state; inherited from Field." },
        { name: "loop", type: "boolean", default: "true", description: "Arrow keys wrap around." },
      ],
    },
    {
      name: "RadioGroupItem",
      props: [
        { name: "value", type: "string", description: "Required." },
        { name: "label", type: "ReactNode", description: "Names the radio (aria-labelledby)." },
        { name: "description", type: "ReactNode", description: "Linked with aria-describedby." },
        { name: "icon", type: "ReactNode", description: "Leading icon (card, segmented)." },
        { name: "children", type: "ReactNode", description: "Extra card content (price, badge) under the label." },
        { name: "disabled", type: "boolean", description: "Skipped by arrow keys." },
        { name: "controlClassName", type: "string", description: "Classes for the circle (default variant)." },
      ],
    },
  ],
  notes: [
    "Inside a Field the group is labelled by the Field label (aria-labelledby) and described by its hint or error.",
    "Rule of thumb: a value you submit → RadioGroup (segmented if labels are short); a view you switch → ToggleGroup.",
  ],
  covers: ["Radio Group"],
};

export default entry;
