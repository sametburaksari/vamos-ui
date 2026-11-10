import { ex, type DocEntry } from "../types";
import GanttDemo from "../examples/gantt/demo";
import GanttDependencies from "../examples/gantt/dependencies";
import GanttScales from "../examples/gantt/scales";
import GanttReadOnly from "../examples/gantt/read-only";
import GanttLarge from "../examples/gantt/large";

const entry: DocEntry = {
  slug: "gantt",
  title: "Gantt",
  group: "Calendar & time",
  description:
    "A task plan on a time axis. The task list is a WAI-ARIA treegrid that holds everything: WBS number, dates, duration, progress and predecessors, all editable inline. Beside it are bars, summary brackets, milestones, finish-to-start links, a today marker and non-working days. Drag a bar to move it, pull its end to resize, or drag its handle onto another bar to link them. Successors are auto-scheduled on working days.",
  source: ["scheduler/gantt.tsx", "scheduler/core/gantt.ts", "scheduler/core/time-scale.ts", "sortable/use-time-scale.ts", "styles/calendar.css"],
  basedOn: "Own engine: useTimeScale, usePointerDrag, @tanstack/react-virtual",
  usage: `import { Gantt } from "@vamos-ui/react/scheduler";
import { trWorkCalendar } from "@vamos-ui/react/locale-data";

<Gantt
  tasks={tasks}            // { id, parentId?, title, start, end (YYYY-MM-DD, inclusive), progress?, type? }
  links={links}            // { id, from, to, type: "FS", lagDays? }
  defaultScale="week"
  workCalendar={trWorkCalendar}
  onTaskChange={(batch) => api.tasks.updateMany(batch)}   // the task + every pushed successor
  onLinkCreate={(l) => api.links.create(l)}
/>

// Scheduling without React (server, worker)
import { scheduleForward, detectCycles } from "@vamos-ui/react/scheduler";`,
  demo: ex("demo", "Demo", "gantt/demo.tsx", GanttDemo),
  examples: [
    ex("dependencies", "Dependencies and auto-scheduling", "gantt/dependencies.tsx", GanttDependencies, "A partner launch plan on trWorkCalendar. Move a task and its finish-to-start successors move with it, on working days only (29 October is skipped). Edit the Predecessors cell (“1.2, 3”) to add or remove links. A link that would create a loop is refused."),
    ex("scales", "Zoom levels", "gantt/scales.tsx", GanttScales, "A hiring timeline at day, week, month and quarter zoom. Week numbers follow the locale's rules (W46). Overdue tasks (unfinished and past today) get a red edge."),
    ex("read-only", "Client portal (read-only)", "gantt/read-only.tsx", GanttReadOnly, "readOnly and scales={[]}: a calm progress view for clients, with no handles and no editing."),
    ex("large", "2,000 rows", "gantt/large.tsx", GanttLarge, "400 work packages × 5 phases. Rows are virtualized from 150 (virtualizeAt), in the task list and the timeline together."),
  ],
  api: [
    {
      name: "Gantt",
      props: [
        { name: "tasks", type: "GanttTask[]", description: "{ id, parentId?, title, start, end, progress? (0–1), type?: \"task\" | \"milestone\" | \"summary\", assignees?, tone?, editable? }. Parents span their children automatically." },
        { name: "links", type: "GanttLink[]", description: "{ id, from, to, type?: \"FS\", lagDays? }. This release draws and schedules finish-to-start links." },
        { name: "scale / defaultScale / onScaleChange", type: '"day" | "week" | "month" | "quarter"', default: '"week"', description: "Zoom level." },
        { name: "scales", type: "GanttScale[]", default: "all four", description: "Zoom options in the toolbar. [] hides the switch." },
        { name: "workCalendar", type: "WorkCalendar", default: "from locale", description: "Working days for durations, scheduling and the shaded non-working days (day zoom)." },
        { name: "durationUnit", type: '"workdays" | "days"', default: '"workdays"', description: "How durations are counted and shown (“6 working days”)." },
        { name: "onTaskChange", type: "(changes: { id, start, end, progress? }[]) => void | Promise<void>", description: "One batch per edit, including successors that moved. Applied at once; reject to revert." },
        { name: "onLinkCreate / onLinkDelete", type: "(link) => void | Promise / (id) => void | Promise", description: "From dragging the connect handle onto another bar, clicking a link, or the Predecessors cell. Delete offers Undo." },
        { name: "autoSchedule", type: "boolean", default: "true", description: "Push successors later when a task moves (never pulls them earlier)." },
        { name: "readOnly", type: "boolean", default: "false", description: "No drag, no inline editing." },
        { name: "columns", type: "GanttColumnKey[]", default: '["title", "start", "end", "duration", "progress"]', description: "Task-list columns: title, assignees, start, end, duration, progress, predecessors." },
        { name: "gridWidth / defaultGridWidth / onGridWidthChange", type: "number (px)", description: "Task-list width. Drag the splitter, or focus it and use ←/→." },
        { name: "collapsed / defaultCollapsed / onCollapsedChange", type: "string[]", description: "Ids of collapsed parent rows." },
        { name: "height / rowHeight / virtualizeAt", type: "string | number / number / number", default: '"32rem" / density / 150', description: "Scroll height, row height (follows density by default), and the row count from which rows are virtualized." },
        { name: "today", type: "string (YYYY-MM-DD)", default: "today in the locale zone", description: "Sets the today marker and the overdue state." },
        { name: "toolbar", type: "ReactNode", description: "Extra toolbar content." },
        { name: "labels", type: "Partial<GanttLabels>", description: "Overrides for the gantt namespace strings." },
      ],
    },
    {
      name: "core (React-free)",
      props: [
        { name: "scheduleForward(tasks, links, cal?, unit?)", type: "GanttTask[]", description: "Pushes FS successors after their predecessors, working-day aware. Unchanged tasks keep their identity." },
        { name: "detectCycles(links) / createsCycle(links, from, to)", type: "string[][] / boolean", description: "Dependency loop checks." },
        { name: "rollupSummaries / flattenTasks / visibleTasks", type: "functions", description: "Parent spans and progress, WBS numbering, collapsed views." },
        { name: "taskDuration / moveTaskTo / linkViolations", type: "functions", description: "Working-day durations, moves that keep length, FS links that are violated." },
      ],
    },
  ],
  notes: [
    "The treegrid is the accessible source of truth, and the timeline is aria-hidden. Use ↑/↓ for rows, ←/→ for cells (on the first cell, ← and → collapse and expand), Home and End, and Enter or F2 to edit a cell. Enter saves and Escape cancels. Date edits are the non-drag path (WCAG 2.5.7).",
    "Bars are opaque colour mixes with no blur. The timeline sits on one surface.",
    "The first release has finish-to-start links only. Critical path, baselines and RTL timeline mirroring come later.",
  ],
  covers: ["Gantt"],
};

export default entry;
