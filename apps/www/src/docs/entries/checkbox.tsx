import { ex, type DocEntry } from "../types";
import CheckboxDemo from "../examples/checkbox/demo";
import CheckboxIndeterminate from "../examples/checkbox/indeterminate";
import CheckboxGroupExample from "../examples/checkbox/group";
import CheckboxCard from "../examples/checkbox/card";
import CheckboxForm from "../examples/checkbox/form";
import CheckboxStates from "../examples/checkbox/states";

const entry: DocEntry = {
  slug: "checkbox",
  title: "Checkbox",
  group: "Forms & inputs",
  description:
    "Independent yes/no choices and multi-select: consent, row selection, permissions, modules. Tri-state (indeterminate), a labelled row with description, a selectable card, and CheckboxGroup for array values. Reads the surrounding Field.",
  source: ["components/checkbox.tsx", "lib/field-context.tsx", "styles/forms.css"],
  basedOn: "Radix Checkbox",
  usage: `import { Checkbox, CheckboxGroup, Field } from "@vamos-ui/react";

<Checkbox label="Allow comments" defaultChecked />

<Field label="Notify me by">
  <CheckboxGroup name="channels" items={[{ value: "email", label: "Email" }, { value: "sms", label: "SMS" }]} />
</Field>`,
  demo: ex("demo", "Demo", "checkbox/demo.tsx", CheckboxDemo),
  examples: [
    ex("indeterminate", "Select all (indeterminate)", "checkbox/indeterminate.tsx", CheckboxIndeterminate, 'checked="indeterminate" renders a dash and aria-checked="mixed". Icon-only boxes need an aria-label.'),
    ex("group", "Group", "checkbox/group.tsx", CheckboxGroupExample, "CheckboxGroup keeps one string[] value in item order, is a role=group labelled by the Field, and submits one entry per checked item (formData.getAll)."),
    ex("card", "Card selection", "checkbox/card.tsx", CheckboxCard, 'variant="card" turns items into tiles; the whole tile is clickable and the focus ring belongs to the tile.'),
    ex("form", "Required consent", "checkbox/form.tsx", CheckboxForm, "Inside a horizontal Field the box gets aria-required, aria-invalid and the error as its description. Native FormData, no form library."),
    ex("states", "Sizes & states", "checkbox/states.tsx", CheckboxStates, "sm (16px) for tables, md (18px) default. Read-only stays focusable and announced, but can't change."),
  ],
  api: [
    {
      name: "Checkbox",
      props: [
        { name: "checked", type: 'boolean | "indeterminate"', description: "Controlled state." },
        { name: "defaultChecked", type: 'boolean | "indeterminate"', default: "false", description: "Initial state (uncontrolled)." },
        { name: "onCheckedChange", type: '(checked: boolean | "indeterminate") => void', description: "Called with the next state." },
        { name: "label", type: "ReactNode", description: "Text beside the box; the row is clickable and names the control." },
        { name: "description", type: "ReactNode", description: "Second line, linked with aria-describedby." },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "16 / 18 px box." },
        { name: "variant", type: '"default" | "card"', default: '"default"', description: "Card = bordered selectable tile (needs label)." },
        { name: "icon", type: "ReactNode", description: "Leading icon in a card." },
        { name: "invalid", type: "boolean", description: "Danger border + aria-invalid. Set by Field error." },
        { name: "readOnly", type: "boolean", description: "Focusable, announced as read-only, value locked." },
        { name: "name / value", type: "string", default: 'value "on"', description: "Form submission (hidden input)." },
        { name: "required / disabled", type: "boolean", description: "Native semantics; also inherited from Field." },
        { name: "controlClassName", type: "string", description: "Classes for the box when label is used (className goes on the row)." },
      ],
    },
    {
      name: "CheckboxGroup",
      props: [
        { name: "value / defaultValue", type: "string[]", default: "[]", description: "Checked item values, kept in item order." },
        { name: "onValueChange", type: "(value: string[]) => void", description: "Called with the next array." },
        { name: "items", type: "{ value, label, description?, icon?, disabled? }[]", description: "Shorthand; or compose CheckboxGroupItem children." },
        { name: "name", type: "string", description: "Each checked item submits one entry under this name." },
        { name: "variant", type: '"default" | "card"', default: '"default"', description: "Card lays the items out as tiles in a responsive grid." },
        { name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Layout of default items." },
        { name: "size", type: '"sm" | "md"', description: "Passed to every item." },
        { name: "disabled / readOnly / invalid / required", type: "boolean", description: "Applied to the whole group; inherited from Field." },
      ],
    },
    {
      name: "CheckboxGroupItem",
      props: [
        { name: "value", type: "string", description: "Required. Added to the group value when checked." },
        { name: "…", type: "CheckboxProps", description: "label, description, icon, disabled…" },
      ],
    },
  ],
  notes: [
    "Enter does not toggle a checkbox (WAI-ARIA); Space does. The label, the description and the whole card are click targets.",
    "In glass mode the unchecked border uses --field-border-hover so the box doesn't vanish on the scene.",
  ],
  covers: ["Checkbox"],
};

export default entry;
