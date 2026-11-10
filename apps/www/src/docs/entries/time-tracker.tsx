import { ex, type DocEntry } from "../types";
import TimeTrackerTimer from "../examples/time-tracker/timer";
import TimeTrackerTimesheet from "../examples/time-tracker/timesheet";
import TimeTrackerToLineItems from "../examples/time-tracker/to-line-items";
import TimeTrackerAttendance from "../examples/time-tracker/attendance";
import TimeTrackerParseDuration from "../examples/time-tracker/parse-duration";

const entry: DocEntry = {
  slug: "time-tracker",
  title: "Time tracker",
  group: "Calendar & time",
  description:
    "Track time with one running timer shared by every tab, a weekly timesheet that accepts durations the way people type them, and a day-grouped entry list. Billable time becomes invoice line drafts with decimal-string totals. Attendance sheets use the Resource calendar's codes variant.",
  source: ["scheduler/time-tracker.tsx", "scheduler/core/duration.ts", "styles/calendar.css"],
  basedOn: "Plain React + BroadcastChannel (timer adapter)",
  usage: `import { TimerButton, Timesheet, createLocalTimerAdapter } from "@vamos-cms/ui/scheduler";

const adapter = createLocalTimerAdapter({ onStop: (entry) => api.timeEntries.create(entry) });

<TimerButton adapter={adapter} projects={projects} />          // top bar

<Timesheet
  weekStart="2026-11-09"
  rows={projects}
  value={minutesByRowAndDay}                                   // { [rowId]: { "2026-11-09": 240 } }
  onCellChange={(rowId, day, minutes) => api.timesheet.set(rowId, day, minutes)}
  dailyTarget={8 * 60}
/>`,
  demo: ex("timer", "Timer", "time-tracker/timer.tsx", TimeTrackerTimer, "The compact pill for a top bar, the full form with project and note, and the entries it produced. Open this page in two tabs: starting the timer in one shows it running in both."),
  examples: [
    ex("timesheet", "Weekly timesheet", "time-tracker/timesheet.tsx", TimeTrackerTimesheet, "An agency week. Type into a cell (1.5, 1:30, 90m, 1h 30m), press Enter to save and move down, and Escape to cancel. Row, day and week totals have their own accessible names. A working day under the 8 h target turns amber."),
    ex("to-line-items", "Billable time → line items", "time-tracker/to-line-items.tsx", TimeTrackerToLineItems, "toLineItems groups billable entries by project (or task) and rate. Quantities are hours as decimal strings with unit HUR, ready for an invoice."),
    ex("attendance", "Monthly attendance (tr)", "time-tracker/attendance.tsx", TimeTrackerAttendance, "An HR attendance sheet: Resource calendar variant=\"codes\" with the Turkish code set (Ç, İ, R, HT, RT, Ü). The codes are data, not kit logic. Type a code to set a cell."),
    ex("parse-duration", "Accepted input formats", "time-tracker/parse-duration.tsx", TimeTrackerParseDuration, "parseDuration reads hours, h:mm and unit words (h/min, sa/dk), with a decimal comma where the locale uses one. formatDuration has short, clock and decimal styles."),
  ],
  api: [
    {
      name: "TimerButton",
      props: [
        { name: "adapter", type: "TimerAdapter", description: "{ getActive, start, stop, subscribe? }. createLocalTimerAdapter (localStorage + BroadcastChannel) or createMemoryTimerAdapter. Back it with your API for one timer per user." },
        { name: "projects", type: "{ id, label, meta? }[]", description: "Projects to choose from (full variant)." },
        { name: "projectId / defaultProjectId / onProjectChange", type: "string", description: "The selected project." },
        { name: "variant", type: '"compact" | "full"', default: '"compact"', description: "A top-bar pill, or project, note and a large counter." },
        { name: "staleAfterMin", type: "number", default: "600", description: "After this many minutes a running timer asks “Still on it?”." },
        { name: "onStart / onStop", type: "(entry: TimeEntry) => void", description: "Called after the adapter confirms." },
        { name: "onAdjust", type: "(entry) => void", description: "Adds an “Adjust end time” button to a stale timer." },
        { name: "titleTicker", type: "boolean", default: "false", description: "Prefixes document.title with the elapsed time while the timer runs." },
        { name: "labels", type: "Partial<TimeTrackerLabels>", description: "Overrides for the timeTracker namespace strings." },
      ],
    },
    {
      name: "Timesheet",
      props: [
        { name: "weekStart", type: "string (YYYY-MM-DD)", description: "First day shown." },
        { name: "days", type: "number", default: "7", description: "Number of day columns." },
        { name: "rows", type: "{ id, label, meta?, readOnly? }[]", description: "Projects, tasks or people." },
        { name: "value / defaultValue", type: "Record<rowId, Record<YYYY-MM-DD, minutes>>", description: "Minutes per cell." },
        { name: "onCellChange", type: "(rowId, day, minutes) => void | Promise<void>", description: "Saves one cell. A rejected promise resets the cell and shows a toast." },
        { name: "dailyTarget", type: "number (minutes)", description: "Day totals under target on working days (up to today) turn amber and say so." },
        { name: "locked", type: "boolean", default: "false", description: "An approved week: read-only, with a lock note." },
        { name: "workCalendar", type: "WorkCalendar", default: "from locale", description: "Shades weekends and holidays. Half days halve the target." },
        { name: "display", type: '"clock" | "decimal" | "short"', default: '"clock"', description: "Cell format: 7:30, 7.5 or 7 h 30 min." },
      ],
    },
    {
      name: "TimeEntryList",
      props: [
        { name: "entries", type: "TimeEntry[]", description: "{ id, start, end?, durationMin?, projectLabel?, note?, billable?, rate? }. Running entries count up live." },
        { name: "onEntryOpen", type: "(entry) => void", description: "Makes each row a button." },
        { name: "showAmounts", type: "boolean", default: "false", description: "Shows rate × time for billable entries." },
      ],
    },
    {
      name: "core (React-free)",
      props: [
        { name: "parseDuration(input, locale)", type: "number | null", description: "Minutes from “1.5”, “1,5”, “1:30”, “90m”, “1h 30m” or “1 sa 30 dk”. A bare number is hours." },
        { name: "formatDuration(min, locale, style?)", type: "string", description: "“3 h 20 min” / “3 sa 20 dk”, “3:20”, or decimal “3.33”." },
        { name: "toLineItems(entries, groupBy) / lineItemsTotal", type: "LineItemDraft[] / string", description: "Billable entries to { description, quantity, unitCode: \"HUR\", unitPrice, total, currency, entryIds }." },
        { name: "timesheetTotals / entryMinutes", type: "functions", description: "Row, day and week sums, and the length of one entry." },
      ],
    },
  ],
  notes: [
    "The timer is a toggle button (aria-pressed) named after its project: “Start timer for Mobile app”. The counter isn't announced every second, only when the timer starts and stops.",
    "The timesheet is a grid with one tab stop. Use the arrow keys to move, type a digit or press Enter to edit, Enter to save (then move down), Escape to cancel and Delete to clear.",
    "Idle detection is planned for a later release.",
  ],
  covers: ["Time tracker"],
};

export default entry;
