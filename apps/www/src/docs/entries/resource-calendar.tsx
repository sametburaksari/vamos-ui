import { ex, type DocEntry } from "../types";
import ResourceCalendarDemo from "../examples/resource-calendar/demo";
import ResourceCalendarAbsences from "../examples/resource-calendar/absences";
import ResourceCalendarRules from "../examples/resource-calendar/rules";
import ResourceCalendarHours from "../examples/resource-calendar/hours";
import ResourceCalendarCodes from "../examples/resource-calendar/codes";
import ResourceCalendarVirtual from "../examples/resource-calendar/virtual";

const entry: DocEntry = {
  slug: "resource-calendar",
  title: "Resource calendar",
  group: "Calendar & time",
  description:
    "People, rooms or equipment as rows and days or hours as columns, holding blocks: shifts, absences, bookings, allocations. It has a template palette, rule warnings (never hard blocks), a working calendar with holidays, a one-code-per-cell variant for attendance sheets, and a full keyboard grid. Every drag has a menu or key alternative.",
  source: ["scheduler/resource-calendar.tsx", "scheduler/core/time-scale.ts", "scheduler/shared.ts", "sortable/use-pointer-drag.ts", "styles/calendar.css"],
  basedOn: "Own grid: usePointerDrag, @tanstack/react-virtual, date-fns",
  usage: `import { ResourceCalendar, minRestRule } from "@vamos-cms/ui/scheduler";

<ResourceCalendar
  resources={staff}                       // { id, title, avatarUrl?, group?, meta? }
  blocks={shifts}                         // { id, resourceId, start, end, label?, tone?, status? }
  range={{ start: "2026-11-09", end: "2026-11-15" }}
  onRangeChange={setRange}
  templates={[{ id: "am", label: "Morning", start: "07:00", end: "15:00", tone: "chart-2" }]}
  rules={[minRestRule(11 * 60)]}
  onBlocksChange={({ created, updated, deleted }) => api.shifts.sync({ created, updated, deleted })}
/>`,
  demo: ex("demo", "Demo", "resource-calendar/demo.tsx", ResourceCalendarDemo),
  examples: [
    ex("absences", "Leave plan (month)", "resource-calendar/absences.tsx", ResourceCalendarAbsences, "HR leave plan: multi-day blocks run across cells. Pending is striped, approved is solid, rejected is hidden unless you show it, and a half day takes half a cell. The cell menu has a custom “Request time off…” action."),
    ex("rules", "Rules: rest hours and weekly cap", "resource-calendar/rules.tsx", ResourceCalendarRules, "Rules are plain objects. Here they use Turkish labour-law values as an example dataset: 11 h rest, a 45 h week, at most one person off per day. Problems get a corner flag and are part of the cell's accessible name. Team rules flag the day header."),
    ex("hours", "Rooms × hours", "resource-calendar/hours.tsx", ResourceCalendarHours, "unit=\"hour\" makes each column an hour slot, for spa or meeting-room booking. Blocks span slots by their real start and end."),
    ex("codes", "Attendance codes", "resource-calendar/codes.tsx", ResourceCalendarCodes, "variant=\"codes\" puts one short code in each cell, for attendance sheets (the Time tracker recipe). Type a code to set it, Shift+arrows select a range, Delete clears it (with Undo)."),
    ex("virtual", "300 people", "resource-calendar/virtual.tsx", ResourceCalendarVirtual, "Rows are virtualized from 60 resources (virtualizeAt). The header and row names stay sticky."),
  ],
  api: [
    {
      name: "ResourceCalendar",
      props: [
        { name: "resources", type: "Resource[]", description: "{ id, title, avatarUrl?, group?, meta?, readOnly? }. meta is the second line, such as “Head chef” or “9 days left”." },
        { name: "blocks", type: "ResourceBlock[]", description: "{ id, resourceId, start, end, label?, code?, kind?, tone?, status?, halfDay?, editable?, note? }. In day mode, YYYY-MM-DD dates (inclusive) or UTC ISO instants for timed shifts. In hour mode, UTC ISO instants." },
        { name: "range", type: "{ start, end }", description: "Visible days, inclusive YYYY-MM-DD." },
        { name: "onRangeChange", type: "(range) => void", description: "Shows Today, ‹ and › in the toolbar. Steps by the range length, or by month when the range is a whole month." },
        { name: "unit", type: '"day" | "hour"', default: '"day"', description: "Day columns, or hour slots of each day." },
        { name: "hours", type: '{ start: "08:00", end: "20:00" }', default: "08:00–20:00", description: "Hour mode: the visible hours." },
        { name: "variant", type: '"blocks" | "codes"', default: '"blocks"', description: "codes puts one short code in each cell. Assigning replaces what's there." },
        { name: "templates", type: "ResourceTemplate[]", description: "{ id, label, start?, end?, tone?, code?, kind?, shortcut?, status? }. Shown as the palette and in the cell menu. With start and end the template makes a timed shift (overnight works)." },
        { name: "rules", type: "ResourceRule[]", description: "{ id, check?(ctx), checkTeam?(ctx) } returning { blockId? | day?, message, severity }. Rules only warn. Built-in factories: minRestRule, maxHoursRule, maxConcurrentRule." },
        { name: "workCalendar", type: "WorkCalendar", default: "from locale", description: "Work days and holidays (tr → Turkish public holidays). Weekend and holiday columns are shaded." },
        { name: "onBlocksChange", type: "({ created?, updated?, deleted? }) => void | Promise<void>", description: "Every edit in one change set. Applied at once; a rejected promise reverts it. Deletes offer Undo." },
        { name: "cellActions / onCellAction", type: "{ id, label, tone? }[] / ({ id, cells }) => void", description: "Extra cell-menu items, such as “Request time off”. Receives the selected cells." },
        { name: "onBlockOpen", type: "(block) => void", description: "Adds the cell's blocks to the cell menu as items that open them." },
        { name: "renderBlock", type: "(block, { compact }) => ReactNode", description: "Custom block content." },
        { name: "summary", type: "((day, blocks) => ReactNode) | false", default: "headcount", description: "The sticky summary row." },
        { name: "rowSummary", type: "(resource, blocks) => ReactNode", description: "A trailing value in each row header, such as “38 h”." },
        { name: "groupBy", type: '"group" | null', default: "null", description: "Group rows by resource.group, with a header row for each group." },
        { name: "showRejected", type: "boolean", default: "false", description: "Show rejected blocks, struck through." },
        { name: "readOnly / loading", type: "boolean", default: "false", description: "No edits / skeleton rows (or dimmed rows while reloading)." },
        { name: "timeZone", type: "string", default: "LocaleProvider timeZone", description: "Zone for timed blocks and templates." },
        { name: "height / virtualizeAt", type: "string | number / number", default: '"32rem" / 60', description: "Scroll height, and the resource count from which rows are virtualized." },
        { name: "toolbar", type: "ReactNode", description: "Extra toolbar content." },
        { name: "labels", type: "Partial<ResourceCalendarLabels>", description: "Overrides for the resourceCalendar namespace strings." },
      ],
    },
    {
      name: "Rule factories",
      props: [
        { name: "minRestRule(minutes, message?)", type: "ResourceRule", description: "Warns when two timed blocks of one person are closer than minutes apart." },
        { name: "maxHoursRule(minutes, message?)", type: "ResourceRule", description: "Danger when a person's timed blocks in the range go over the cap." },
        { name: "maxConcurrentRule(max, kinds, message?)", type: "ResourceRule", description: "Flags days on which more than max people have a block of those kinds." },
      ],
    },
  ],
  notes: [
    "Keyboard: the grid has one tab stop. Use the arrow keys to move, Shift+arrows to select, Enter for the cell menu (assign template, remove, your actions) and Delete to clear (with Undo). Alt+arrows move the cell's blocks. In codes mode, type a code.",
    "Pointer: drag across cells to select. Click a palette template to arm it, then click or drag over cells to paint. You can also drag a template or a block onto a cell. Every drag has a menu or keyboard path (WCAG 2.5.7).",
    "Blocks are opaque colour mixes and never blur. Only the outer surface uses the glass material.",
  ],
  covers: ["Resource calendar (people × days)"],
};

export default entry;
