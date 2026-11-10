import { ex, type DocEntry } from "../types";
import SwitchDemo from "../examples/switch/demo";
import SwitchSettingsRow from "../examples/switch/settings-row";
import SwitchAsync from "../examples/switch/async";
import SwitchTable from "../examples/switch/table";
import SwitchStates from "../examples/switch/states";

const entry: DocEntry = {
  slug: "switch",
  title: "Switch",
  group: "Forms & inputs",
  description:
    "An on/off setting that applies immediately: maintenance mode, online bookings, active/inactive in a table row. Two sizes, label + description on either side, and a loading state for optimistic saves.",
  source: ["components/switch.tsx", "components/spinner.tsx", "styles/forms.css"],
  basedOn: "Radix Switch",
  usage: `import { Switch } from "@vamos-cms/ui";

<Switch label="Accept online bookings" description="Guests can reserve from your website." defaultChecked />`,
  demo: ex("demo", "Demo", "switch/demo.tsx", SwitchDemo),
  examples: [
    ex("settings-row", "Settings rows", "switch/settings-row.tsx", SwitchSettingsRow, 'labelPosition="start" puts the label first and the switch at the far end — the settings-page pattern.'),
    ex("async", "Optimistic save", "switch/async.tsx", SwitchAsync, "Flip immediately, lock with loading (aria-busy, spinner in the thumb), revert on error and announce the result in a live region. Every second save fails here."),
    ex("table", "In a table row", "switch/table.tsx", SwitchTable, 'size="sm" for dense rows; give each switch an aria-label that names the row.'),
    ex("states", "Sizes & states", "switch/states.tsx", SwitchStates, "md 36×20, sm 28×16; loading, disabled, read-only and a Field error."),
  ],
  api: [
    {
      name: "Switch",
      props: [
        { name: "checked", type: "boolean", description: "Controlled state." },
        { name: "defaultChecked", type: "boolean", default: "false", description: "Initial state (uncontrolled)." },
        { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called with the next state." },
        { name: "label", type: "ReactNode", description: "Names the switch; clicking it toggles." },
        { name: "description", type: "ReactNode", description: "Second line, linked with aria-describedby." },
        { name: "labelPosition", type: '"start" | "end"', default: '"end"', description: "start = label first, switch at the far end." },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "28×16 or 36×20 px." },
        { name: "loading", type: "boolean", description: "Spinner in the thumb, aria-busy, changes locked." },
        { name: "invalid", type: "boolean", description: "Danger outline + aria-invalid. Set by Field error." },
        { name: "readOnly", type: "boolean", description: "Focusable but can't be flipped." },
        { name: "name / value", type: "string", default: 'value "on"', description: "Form submission (hidden input)." },
        { name: "controlClassName", type: "string", description: "Classes for the track when label is used." },
      ],
    },
  ],
  notes: [
    "Switches apply instantly. If a change only takes effect after Save, use a Checkbox instead.",
    "The thumb uses --accent-fg when on, so it stays visible on every accent (graphite in dark mode included). Thumb travel follows --dir for RTL.",
  ],
  covers: ["Switch"],
};

export default entry;
