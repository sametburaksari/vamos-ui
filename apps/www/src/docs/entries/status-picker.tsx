import { ex, type DocEntry } from "../types";
import StatusPickerDemo from "../examples/status-picker/demo";
import StatusPickerTransitions from "../examples/status-picker/transitions";
import StatusPickerConfirm from "../examples/status-picker/confirm";
import StatusPickerAsync from "../examples/status-picker/async";
import StatusPickerField from "../examples/status-picker/field";

const entry: DocEntry = {
  slug: "status-picker",
  title: "Status picker",
  group: "Pickers",
  description:
    "Change a record's status inside a workflow — task To do → Done, deal stages, content Draft → Published, leave Pending → Approved. The trigger is the status badge itself. Every status has a category with its own icon (shape, not only colour), transitions not allowed from the current status stay visible with the reason, a transition can ask for confirmation and a note, and async saves are optimistic and revert on failure.",
  source: ["components/status-picker.tsx", "components/badge.tsx", "components/alert-dialog.tsx"],
  basedOn: "Radix Select + Alert Dialog",
  usage: `import { StatusPicker, type StatusDef } from "@vamos-cms/ui";

const statuses: StatusDef[] = [
  { value: "todo", label: "To do", category: "todo" },
  { value: "doing", label: "In progress", category: "active" },
  { value: "done", label: "Done", category: "done" },
];

<StatusPicker statuses={statuses} value={task.status} onValueChange={(v) => save({ status: v })} />`,
  demo: ex("demo", "Demo", "status-picker/demo.tsx", StatusPickerDemo),
  examples: [
    ex("transitions", "Workflow transitions", "status-picker/transitions.tsx", StatusPickerTransitions, "transitions lists the allowed next statuses. The others stay visible, disabled, with “Not allowed from Draft” as their description."),
    ex("confirm", "Confirm with a note", "status-picker/confirm.tsx", StatusPickerConfirm, "confirm(next) returns an Alert Dialog config. requireNote asks for a reason; it arrives as meta.note in onValueChange."),
    ex("async", "Optimistic save", "status-picker/async.tsx", StatusPickerAsync, "Return a promise from onValueChange: the badge switches at once with a spinner, then reverts if it rejects. onError is where you toast. color takes user-defined pipeline colours."),
    ex("field", "Field trigger & states", "status-picker/field.tsx", StatusPickerField, 'trigger="field" for forms (name posts a native value). Small, disabled and read-only badges.'),
  ],
  api: [
    {
      name: "StatusPicker",
      props: [
        { name: "statuses", type: "StatusDef[]", description: "The workflow's statuses, in order." },
        { name: "value", type: "string | null", description: "Controlled status." },
        { name: "defaultValue", type: "string | null", description: "Initial status (uncontrolled)." },
        { name: "onValueChange", type: "(value, previous, { note }) => void | Promise", description: "Return a promise for an optimistic save with revert." },
        { name: "transitions", type: "Record<string, string[]>", description: "Allowed next statuses per status." },
        { name: "confirm", type: "(next, current) => false | StatusConfirm", description: "Ask before a transition (title, description, requireNote, noteLabel, confirmLabel, tone)." },
        { name: "onError", type: "(error, attempted) => void", description: "After a failed async save reverted." },
        { name: "trigger", type: '"badge" | "field"', default: '"badge"', description: "Badge for tables and headers, field for forms." },
        { name: "groupByCategory", type: "boolean", default: "true above 5 statuses", description: "Group options under To do / In progress / Done / Cancelled." },
        { name: "fieldLabel", type: "string", default: '"Status"', description: "Used in the trigger's name: “Stage: Proposal sent. Change”." },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "Badge / field size." },
        { name: "loading", type: "boolean", description: "External busy state." },
        { name: "name", type: "string", description: "Hidden native select for form posts." },
        { name: "disabled / readOnly", type: "boolean", description: "Read-only renders a plain StatusBadge." },
        { name: "labels", type: "Partial<StatusPickerLabels>", description: "Built-in strings (namespace statusPicker), incl. the category headings." },
      ],
    },
    {
      name: "StatusDef",
      props: [
        { name: "value / label", type: "string", description: "Stored value and display text (localise in your app)." },
        { name: "category", type: '"todo" | "active" | "done" | "cancelled"', description: "Default icon, tone and grouping." },
        { name: "tone", type: '"neutral" | "accent" | "success" | "warning" | "danger" | "info"', description: "Semantic colour; default from the category." },
        { name: "color", type: "string", description: "Any CSS colour (user-defined stages). Overrides tone." },
        { name: "icon", type: "ReactNode", description: "Replace the category icon." },
        { name: "description", type: "string", description: "Second line in the list." },
      ],
    },
    {
      name: "StatusBadge",
      props: [
        { name: "status", type: "StatusDef", description: "Renders a status without a picker (table cells, activity entries)." },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "Badge size." },
      ],
    },
  ],
  covers: ["Status picker"],
};

export default entry;
