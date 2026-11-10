import { ex, type DocEntry } from "../types";
import InputDemo from "../examples/input/demo";
import InputField from "../examples/input/field";
import InputAdornments from "../examples/input/adornments";
import TextareaDemo from "../examples/input/textarea";
import InputDisabled from "../examples/input/disabled";

const entry: DocEntry = {
  slug: "input",
  title: "Input & Field",
  group: "Forms & inputs",
  description: "Text input, multi-line textarea, and Field, which wraps them with a label, hint and error message.",
  source: ["components/input.tsx"],
  usage: `import { Field, Input } from "@vamos-cms/ui";

<Field label="Title" hint="Keep it under 60 characters.">
<Input placeholder="Post title" />
</Field>`,
  demo: ex("demo", "Demo", "input/demo.tsx", InputDemo),
  examples: [
    ex("field", "With Field", "input/field.tsx", InputField, "Field wires up id, aria-invalid and aria-describedby for you."),
    ex("adornments", "Leading & trailing", "input/adornments.tsx", InputAdornments, "Use leading / trailing for an icon, unit or button."),
    ex("textarea", "Textarea", "input/textarea.tsx", TextareaDemo, "Grows with its content via field-sizing: content."),
    ex("disabled", "Disabled", "input/disabled.tsx", InputDisabled),
  ],
  api: [
    { name: "Input", props: [
      { name: "leading", type: "ReactNode", description: "Icon or text at the start." },
      { name: "trailing", type: "ReactNode", description: "Icon, unit or button at the end." },
      { name: "...props", type: "InputHTMLAttributes", description: "All native input attributes." },
    ] },
    { name: "Field", props: [
      { name: "label", type: "ReactNode", description: "Label, linked to the control with htmlFor." },
      { name: "hint", type: "ReactNode", description: "Helper text." },
      { name: "error", type: "ReactNode", description: "Error text; also sets aria-invalid." },
      { name: "required", type: "boolean", description: "Adds * to the label." },
      { name: "children", type: "ReactElement", description: "A single control (Input, Textarea, Select…)." },
    ] },
  ],
  covers: ["Input", "Textarea", "Field"],
};

export default entry;
