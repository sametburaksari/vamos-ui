import { ex, type DocEntry } from "../types";
import SelectDemo from "../examples/select/demo";
import SelectGroups from "../examples/select/groups";
import SelectRichItems from "../examples/select/rich-items";
import SelectClearable from "../examples/select/clearable";
import SelectStates from "../examples/select/states";
import SelectComposed from "../examples/select/composed";
import SelectNative from "../examples/select/native";
import SelectForm from "../examples/select/form";

const entry: DocEntry = {
  slug: "select",
  title: "Select",
  group: "Forms & inputs",
  description:
    "Pick one of a small, fixed set — content status, currency, department, sort order. The trigger shares its box with Input (controlVariants); the list supports groups, icons and descriptions, a clearable value and locale-aware typeahead. NativeSelect is the styled platform <select> for mobile-heavy website forms.",
  source: ["components/select.tsx", "components/native-select.tsx", "lib/variants.ts", "lib/text.ts"],
  basedOn: "Radix Select",
  usage: `import { Field, Select, NativeSelect } from "@vamos-ui/react";

<Field label="Status">
  <Select name="status" defaultValue="draft" items={[
    { value: "draft", label: "Draft", description: "Only editors can see it" },
    { value: "published", label: "Published" },
  ]} />
</Field>

<NativeSelect name="country" defaultValue="" placeholder="Choose a country" items={countries} />`,
  demo: ex("demo", "Demo", "select/demo.tsx", SelectDemo),
  examples: [
    ex("groups", "Groups", "select/groups.tsx", SelectGroups, "Give items a group and they render under headings with separators, in first-seen order. Disabled items are skipped by the keyboard."),
    ex("rich-items", "Icons and descriptions", "select/rich-items.tsx", SelectRichItems, "The description only shows in the open list; the trigger keeps the icon and label."),
    ex("clearable", "Clearable filters (CRM)", "select/clearable.tsx", SelectClearable, 'variant="pill" for filter bars. clearable adds a × button; clearing yields null (Radix forbids an empty item value).'),
    ex("states", "Sizes & states", "select/states.tsx", SelectStates, "sm / md / lg follow the density axis. Error from Field, loading options, read-only (doesn't open, no chevron), disabled, and ghost for table cells."),
    ex("composed", "Composite parts", "select/composed.tsx", SelectComposed, "SelectRoot + SelectTrigger + SelectContent + SelectGroup/SelectItem/SelectSeparator when you need full control over the markup."),
    ex("native", "NativeSelect (booking form)", "select/native.tsx", SelectNative, "The real <select>: the phone's own picker, no JavaScript to open, native value/onChange(event). Use it on public website forms."),
    ex("form", "Native form submit (HR)", "select/form.tsx", SelectForm, "With name, Radix renders a hidden native select, so FormData and Server Actions work without a form library."),
  ],
  api: [
    {
      name: "Select",
      props: [
        { name: "value", type: "V | null", description: "Selected value (controlled). null = nothing selected." },
        { name: "defaultValue", type: "V | null", default: "null", description: "Initial value (uncontrolled)." },
        { name: "onValueChange", type: "(value: V | null) => void", description: "Called with the new value, or null after clearing." },
        { name: "items", type: "SelectOption<V>[]", description: "{ value, label, icon?, description?, disabled?, group? }. Or compose SelectItem children." },
        { name: "placeholder", type: "string", default: '"Select…"', description: "Shown while nothing is selected (dictionary select.placeholder)." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Height from --control-h, same as Input." },
        { name: "variant", type: '"default" | "ghost" | "pill"', default: '"default"', description: "Field look · borderless for table cells · rounded for filter bars." },
        { name: "clearable", type: "boolean", default: "false", description: "Show a × button while there is a value." },
        { name: "loading", type: "boolean", default: "false", description: "Spinner in the trigger and a status row in the list." },
        { name: "readOnly", type: "boolean", default: "false", description: "Focusable and announced (aria-readonly) but doesn't open." },
        { name: "invalid", type: "boolean", description: "Danger border + aria-invalid. Set by Field error." },
        { name: "renderValue", type: "(item: SelectOption<V>) => ReactNode", description: "Custom trigger content for the selected item (items shorthand)." },
        { name: "name / required / disabled", type: "string / boolean", description: "Form submission and native semantics; also inherited from Field." },
        { name: "open / defaultOpen / onOpenChange", type: "boolean / (open) => void", description: "Control the list." },
        { name: "className / triggerClassName / contentClassName", type: "string", description: "Classes for the trigger and the floating list." },
        { name: "labels", type: "Partial<SelectLabels>", description: "placeholder, clear, loading, empty." },
      ],
    },
    {
      name: "SelectTrigger",
      props: [
        { name: "size / variant", type: "as Select", description: "Box look from controlVariants." },
        { name: "invalid / readOnly / loading / required", type: "boolean", description: "Same states as the shorthand." },
      ],
    },
    {
      name: "SelectItem",
      props: [
        { name: "value", type: "string", description: "Required, non-empty." },
        { name: "icon", type: "ReactNode", description: "Leading icon (also shown in the trigger)." },
        { name: "description", type: "ReactNode", description: "Second line, list only." },
        { name: "textValue", type: "string", description: "Typeahead text when children aren't a string. Locale-folded automatically." },
        { name: "disabled", type: "boolean", description: "Skipped by keyboard and pointer." },
      ],
    },
    {
      name: "SelectContent / SelectGroup",
      props: [
        { name: "itemSize", type: '"sm" | "md"', description: "SelectContent: item density (follows the trigger by default)." },
        { name: "position", type: '"popper" | "item-aligned"', default: '"popper"', description: "SelectContent: popper sits under the trigger and is at least as wide." },
        { name: "label", type: "ReactNode", description: "SelectGroup: heading; the group is announced with it." },
      ],
    },
    {
      name: "NativeSelect",
      props: [
        { name: "value / defaultValue / onChange", type: "native", description: "The native contract — onChange receives the event." },
        { name: "items", type: "{ value, label, disabled?, group? }[]", description: "Shorthand; groups become <optgroup>. Or pass <option> children." },
        { name: "placeholder", type: "string", description: 'Disabled empty first option; use with defaultValue="" and required.' },
        { name: "size / variant", type: "as Select", description: "Same box as Select and Input." },
        { name: "invalid / readOnly", type: "boolean", description: "readOnly blocks changes but stays focusable (aria-readonly)." },
        { name: "selectClassName", type: "string", description: "Classes for the <select>; className goes on the wrapper." },
      ],
    },
  ],
  notes: [
    "Use Select for up to ~15 options. For longer or searchable lists use Combobox.",
    "Typeahead compares locale-folded text, so typing “i” finds “İstanbul” and “c” finds “Çanakkale”.",
    "The selected item is marked with a check in the accent ink colour; highlight uses the neutral hover tone, readable on glass.",
  ],
  covers: ["Select"],
};

export default entry;
