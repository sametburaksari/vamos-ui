import { ex, type DocEntry } from "../types";
import DescriptionListDemo from "../examples/description-list/demo";
import DescriptionListGrid from "../examples/description-list/grid";
import DescriptionListCopyable from "../examples/description-list/copyable";
import DescriptionListInlineEdit from "../examples/description-list/inline-edit";
import DescriptionListGroups from "../examples/description-list/groups";
import DescriptionListStates from "../examples/description-list/states";

const entry: DocEntry = {
  slug: "description-list",
  title: "Description list",
  group: "Data display",
  description:
    "Label/value pairs for record details and summaries — a native <dl>. Horizontal, vertical or grid layouts that follow the container width, locale formatting for numbers and dates, copy buttons and click-to-edit values.",
  source: ["components/description-list.tsx", "lib/data-islands.tsx", "lib/value-format.ts", "styles/data.css"],
  basedOn: "Native <dl>",
  usage: `import { DescriptionList } from "@vamos-ui/react";

<DescriptionList items={[
  { key: "owner", label: "Owner", value: "Ayşe Kaya" },
  { key: "value", label: "Deal value", value: "48500.00", format: "currency" },
  { key: "iban", label: "IBAN", value: "TR33 0006 1005 1978 6457 8413 26", copyable: true },
]} />`,
  demo: ex("demo", "Deal details (CRM)", "description-list/demo.tsx", DescriptionListDemo),
  examples: [
    ex("grid", "Grid with spans (HR)", "description-list/grid.tsx", DescriptionListGrid, "layout=\"grid\" with columns; span: 2 or \"full\" for long values. Columns drop on narrow containers."),
    ex("copyable", "Copyable values", "description-list/copyable.tsx", DescriptionListCopyable, "copyable copies the text value, or the string you pass (IBAN without spaces). Confirmed visually and announced."),
    ex("inline-edit", "Inline edit", "description-list/inline-edit.tsx", DescriptionListInlineEdit, "editable rows + onEdit. The value is a button (\"Edit Phone\"); Enter saves, Escape cancels; a rejected promise shows the error."),
    ex("groups", "Sections (CMS)", "description-list/groups.tsx", DescriptionListGroups, "DescriptionGroup titles a section and names it as a region."),
    ex("states", "Loading, vertical, empty values", "description-list/states.tsx", DescriptionListStates, "loading renders label + value skeletons; empty values show — (or emptyValue) and read \"Not set\"."),
  ],
  api: [
    { name: "DescriptionList", props: [
      { name: "items", type: "DescriptionEntry[]", description: "Rows as data — or compose DescriptionItem children." },
      { name: "layout", type: '"horizontal" | "vertical" | "grid"', default: '"horizontal"', description: "Horizontal stacks under ~28rem of container width." },
      { name: "columns", type: "1 | 2 | 3", default: "2", description: "Grid columns (container queries)." },
      { name: "labelWidth", type: "string", default: '"11rem"', description: "Label column width (horizontal)." },
      { name: "divided", type: "boolean", default: "true (horizontal)", description: "Hairlines between rows." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Text size and row spacing." },
      { name: "emptyValue", type: "ReactNode", default: '"—"', description: "Shown for empty values." },
      { name: "onEdit", type: "(key: string, value: string) => void | Promise<void>", description: "Saves editable rows; reject to show the error." },
      { name: "loading", type: "boolean | number", description: "Skeleton rows (default 4)." },
      { name: "labels", type: "Partial<DescriptionListLabels>", description: "copy, copied, edit, save, cancel, saving, error, empty." },
    ] },
    { name: "DescriptionEntry", props: [
      { name: "key", type: "string", description: "Stable key, passed to onEdit." },
      { name: "label / value", type: "ReactNode", description: "The pair." },
      { name: "format", type: "ValueFormat", description: '"number" | "currency" | "compact" | "percent" | "date" | "datetime" | "relative" | …' },
      { name: "hint", type: "ReactNode", description: "Help text under the value." },
      { name: "copyable", type: "boolean | string", description: "Copy button." },
      { name: "span", type: '1 | 2 | "full"', description: "Grid span." },
      { name: "editable / editValue / inputType", type: "boolean / string / input type", description: "Inline edit." },
    ] },
    { name: "DescriptionItem", props: [
      { name: "label", type: "ReactNode", description: "The dt." },
      { name: "children", type: "ReactNode", description: "The value." },
      { name: "copyable", type: "boolean | string", description: "Copy button." },
      { name: "edit", type: "ReactNode", description: "Inline edit slot (e.g. DescriptionEditable)." },
      { name: "action", type: "ReactNode", description: "Trailing slot (link, badge)." },
      { name: "hint / span / emptyValue", type: "…", description: "As in DescriptionEntry." },
    ] },
    { name: "DescriptionEditable", props: [
      { name: "value", type: "string", description: "Current value." },
      { name: "onSave", type: "(value: string) => void | Promise<void>", description: "Save handler." },
      { name: "label", type: "string", description: "Field name for accessible names." },
      { name: "display", type: "ReactNode", description: "Formatted read view." },
      { name: "inputType", type: '"text" | "email" | "tel" | "url" | "number"', default: '"text"', description: "Input type." },
    ] },
    { name: "DescriptionGroup", props: [
      { name: "title", type: "ReactNode", description: "Section heading (names the region)." },
      { name: "description", type: "ReactNode", description: "Secondary line." },
      { name: "titleAs", type: '"h2" | "h3" | "h4" | "h5"', default: '"h4"', description: "Heading level." },
      { name: "action", type: "ReactNode", description: "Slot at the end of the heading row." },
    ] },
  ],
  covers: ["Description list"],
};

export default entry;
