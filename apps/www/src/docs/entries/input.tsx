import { ex, type DocEntry } from "../types";
import InputDemo from "../examples/input/demo";
import InputField from "../examples/input/field";
import InputSizes from "../examples/input/sizes";
import InputAdornments from "../examples/input/adornments";
import InputClearable from "../examples/input/clearable";
import InputCount from "../examples/input/count";
import InputStates from "../examples/input/disabled";
import FieldLayouts from "../examples/input/layouts";
import TextareaDemo from "../examples/input/textarea";

const entry: DocEntry = {
  slug: "input",
  title: "Input & Field",
  group: "Forms & inputs",
  description:
    "Text input, multi-line textarea, and Field, which wraps any control with a label, hint and error and wires the accessibility attributes through context. Fieldset groups related controls.",
  source: ["components/input.tsx", "lib/field-context.tsx", "lib/variants.ts"],
  basedOn: "Radix Label",
  usage: `import { Field, Input } from "@vamos-ui/react";

<Field label="Title" hint="Keep it under 60 characters.">
  <Input placeholder="Post title" />
</Field>`,
  demo: ex("demo", "Demo", "input/demo.tsx", InputDemo),
  examples: [
    ex("field", "With Field", "input/field.tsx", InputField, "Field sets id, aria-describedby (merged with the control's own), aria-invalid and required. labelAction adds a link at the end of the label row."),
    ex("sizes", "Sizes", "input/sizes.tsx", InputSizes, "sm / md / lg are derived from --control-h, so they follow the density axis."),
    ex("adornments", "Icons & addons", "input/adornments.tsx", InputAdornments, "leading / trailing sit inside the box; addonStart / addonEnd are segments. Focus ring and border belong to the whole group."),
    ex("clearable", "Clearable search", "input/clearable.tsx", InputClearable, "A × button appears while there is a value; Esc clears as well. Works controlled and uncontrolled (fires onChange)."),
    ex("count", "Character count (CMS)", "input/count.tsx", InputCount, "showCount + maxLength. Screen readers hear the remaining count only within 10 characters of the limit."),
    ex("states", "Read-only, disabled, error", "input/disabled.tsx", InputStates, "Read-only gets a dashed border so it doesn't look editable; errors carry an icon so colour isn't the only signal."),
    ex("layouts", "Settings layout & Fieldset", "input/layouts.tsx", FieldLayouts, 'layout="inline" gives a fixed label column; orientation="horizontal" puts the control first (checkboxes, switches); Fieldset is a real <fieldset> + <legend>.'),
    ex("textarea", "Textarea", "input/textarea.tsx", TextareaDemo, "Grows with its content via field-sizing: content."),
  ],
  api: [
    { name: "Input", props: [
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Height from --control-h (−0.5rem / = / +0.5rem)." },
      { name: "variant", type: '"default" | "ghost" | "nav"', default: '"default"', description: "Field look, borderless until hover (inline edit), or for the dark sidebar." },
      { name: "leading", type: "ReactNode", description: "Icon or short text inside the box, at the start." },
      { name: "trailing", type: "ReactNode", description: "Icon, unit, Kbd or spinner inside the box, at the end." },
      { name: "addonStart / addonEnd", type: "ReactNode", description: "Segmented addons (https://, currency, a Button)." },
      { name: "clearable", type: "boolean", default: "false", description: "Clear button while there is a value; Esc clears." },
      { name: "onClear", type: "() => void", description: "Called after clearing." },
      { name: "showCount", type: "boolean", default: "false", description: "Character counter; with maxLength shows {count} / {max}." },
      { name: "invalid", type: "boolean", description: "Invalid look and aria-invalid (Field error sets it for you)." },
      { name: "readOnly", type: "boolean", description: "Read-only look (dashed border, no fill); no clear button." },
      { name: "inputClassName", type: "string", description: "Classes for the inner <input>. className goes on the root box." },
      { name: "labels", type: "Partial<InputLabels>", description: 'Built-in strings: clear, count, remaining (namespace "input").' },
      { name: "...props", type: "InputHTMLAttributes", description: "Native attributes; ref reaches the <input> (react-hook-form register works)." },
    ] },
    { name: "Field", props: [
      { name: "label", type: "ReactNode", description: "Label, linked with htmlFor (Radix Label)." },
      { name: "hint", type: "ReactNode", description: "Helper text (hidden while an error shows)." },
      { name: "error", type: "ReactNode | ReactNode[]", description: "Error text; arrays show the first entry. Sets aria-invalid." },
      { name: "required", type: "boolean", default: "false", description: "Asterisk (aria-hidden) and required on the control." },
      { name: "optional", type: "boolean", default: "false", description: 'Shows "(optional)" from the dictionary.' },
      { name: "disabled / readOnly", type: "boolean", description: "Passed to the control; the label dims when disabled." },
      { name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "horizontal: control first, label and hint beside it." },
      { name: "layout", type: '"stack" | "inline"', default: '"stack"', description: "inline: fixed label column (settings pages)." },
      { name: "labelAction", type: "ReactNode", description: "Slot at the end of the label row." },
      { name: "id / name", type: "string", description: "Control id (default: the child's id or generated) and form name." },
      { name: "children", type: "ReactNode", description: "One control. Kit controls read the context via useFieldControl(); native inputs are wired by cloning." },
    ] },
    { name: "Fieldset", props: [
      { name: "legend", type: "ReactNode", description: "Group title as <legend> (or render <Legend> first)." },
      { name: "hint", type: "ReactNode", description: "Description linked with aria-describedby." },
      { name: "error", type: "ReactNode", description: "Error for the whole group." },
      { name: "disabled", type: "boolean", description: "Disables every native control inside." },
    ] },
    { name: "useFieldControl (for component authors)", props: [
      { name: "useFieldControl(props)", type: "props", description: "Returns props with id, aria-describedby (merged), aria-invalid, required, disabled, readOnly, name from the surrounding Field." },
      { name: "useFieldContext()", type: "FieldContextValue | null", description: "Also exposes labelId for role-based controls (radio group, slider) that need aria-labelledby." },
      { name: "focusFirstInvalid(form)", type: "HTMLElement | null", description: "Focus the first invalid control after a failed submit." },
    ] },
  ],
  covers: ["Input", "Textarea", "Field"],
};

export default entry;
