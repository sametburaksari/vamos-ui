import { ex, type DocEntry } from "../types";
import SchedulerDemo from "../examples/scheduler/demo";
import SchedulerMonth from "../examples/scheduler/month";
import SchedulerDrag from "../examples/scheduler/drag";
import SchedulerBusinessHours from "../examples/scheduler/business-hours";
import SchedulerList from "../examples/scheduler/list";
import SchedulerPublishing from "../examples/scheduler/publishing";
import SchedulerTimeZone from "../examples/scheduler/time-zone";

const entry: DocEntry = {
  slug: "scheduler",
  title: "Agenda / scheduler",
  group: "Calendar & time",
  description:
    "Day, week, work week, month and list views over one event model. Overlapping events share columns, multi-day events pack into lanes, and you can create, move and resize by dragging (snapped) or from the keyboard. A now line, business hours, holidays and an explicit time zone are built in. Our own engine on date-fns, with no calendar library underneath.",
  source: ["scheduler/scheduler.tsx", "scheduler/core/layout.ts", "scheduler/shared.ts", "sortable/use-pointer-drag.ts", "styles/calendar.css"],
  basedOn: "Own engine: date-fns v4 + @date-fns/tz, usePointerDrag",
  usage: `import { Scheduler } from "@vamos-cms/ui/scheduler";

<Scheduler
  events={events}               // { id, title, start, end } — UTC ISO, or YYYY-MM-DD with allDay
  defaultView="week"
  timeZone="Europe/Istanbul"
  onCreate={(range) => openCreateDialog(range)}
  onEventChange={(c) => api.events.update(c)}   // optimistic; reject to roll back
  onEventOpen={(id) => router.push(\`/events/\${id}\`)}
/>

// The React-free layout functions are exported from the same entry
import { layoutDayEvents, packLanes } from "@vamos-cms/ui/scheduler";`,
  demo: ex("demo", "Demo", "scheduler/demo.tsx", SchedulerDemo),
  examples: [
    ex("month", "Month with multi-day lanes", "scheduler/month.tsx", SchedulerMonth, "Multi-day events span the week and pack into lanes; a crowded day shows “+N more” with a popover. The month is an ARIA grid: arrow keys move between days, Enter opens the day."),
    ex("drag", "Create, move, resize and roll back", "scheduler/drag.tsx", SchedulerDrag, "HR interview scheduling. Changes appear at once; this fake API rejects slots after 17:00, so the event snaps back and a toast explains why. Locked events (editable: false) don't move."),
    ex("business-hours", "Business hours and holidays", "scheduler/business-hours.tsx", SchedulerBusinessHours, "A spa booking back office on trWorkCalendar: 09:00–18:00, Republic Day off, its eve shaded from 13:00. restrictToBusinessHours outlines an invalid drop in red and refuses it."),
    ex("list", "List (agenda) view", "scheduler/list.tsx", SchedulerList, "The screen-reader-first view: one heading per day and one button per event, with time, title, place and status in reading order. The empty state reads “Nothing scheduled this week”."),
    ex("publishing", "Editorial calendar", "scheduler/publishing.tsx", SchedulerPublishing, "A CMS publishing calendar with a channel filter in the toolbar slot and a custom renderEvent."),
    ex("time-zone", "Same events, two time zones", "scheduler/time-zone.tsx", SchedulerTimeZone, "Events are stored in UTC. Each scheduler shows them in its own zone, with the offset in the corner of the time axis. Day boundaries, the now line and every instant it gives you back use that zone."),
  ],
  api: [
    {
      name: "Scheduler",
      props: [
        { name: "events", type: "SchedulerEvent[]", description: "{ id, title, start, end, allDay?, tone?, status?, editable?, location?, data? }. Timed events use UTC ISO instants (end exclusive). All-day events use YYYY-MM-DD (end inclusive)." },
        { name: "view / defaultView / onViewChange", type: '"day" | "week" | "workweek" | "month" | "list"', default: '"week"', description: "The current view." },
        { name: "views", type: "SchedulerView[]", default: '["day", "week", "month", "list"]', description: "Views offered in the switch. Pass one view to hide the switch." },
        { name: "date / defaultDate / onDateChange", type: "string (YYYY-MM-DD)", default: "today", description: "The focused day. Navigation moves by the view's length." },
        { name: "onRangeChange", type: "({ start, end }) => void", description: "Fires when the visible days change (inclusive YYYY-MM-DD). Use it to fetch events." },
        { name: "timeZone", type: "string (IANA)", default: "LocaleProvider timeZone", description: "Every time shown and every instant returned uses this zone. The offset is shown on the time axis." },
        { name: "slotMinutes", type: "5 | 10 | 15 | 30 | 60", default: "30", description: "Grid step, and the length of keyboard-created events." },
        { name: "snapMinutes", type: "number", default: "15", description: "Drag and Alt+arrow step. Hold Alt while dragging for 5-minute steps." },
        { name: "dayRange", type: '{ start: "07:00", end: "21:00" }', default: "00:00–24:00", description: "The part of the day the time grid shows." },
        { name: "scrollToTime", type: "string (HH:mm)", default: "business-hours start or 08:00", description: "Time scrolled into view on open." },
        { name: "height", type: "string | number", default: '"36rem"', description: "Max height of the scrolling time grid." },
        { name: "workCalendar", type: "WorkCalendar", default: "from locale (tr → Turkish holidays)", description: "{ workDays, businessHours, holidays, region }. Shades non-working time, holidays and half days." },
        { name: "restrictToBusinessHours", type: "boolean", default: "false", description: "Refuses moves and new events outside business hours (red outline while dragging)." },
        { name: "onCreate", type: "({ start, end, allDay }) => void", description: "Drag on empty time, double-click, or the keyboard slot cursor (arrow keys, then Enter)." },
        { name: "onEventChange", type: "({ id, start, end, allDay }) => void | Promise<void>", description: "Move or resize. Applied at once; a rejected promise reverts it and shows a toast." },
        { name: "onEventOpen", type: "(id, event) => void", description: "Click or Enter on an event." },
        { name: "renderEvent", type: "(event, { view, compact, timeLabel }) => ReactNode", description: "Custom event content. The accessible name stays the built-in description." },
        { name: "maxEventsPerDay", type: "number", default: "3", description: "Month view: bars per day before “+N more”." },
        { name: "variant", type: '"full" | "embedded"', default: '"full"', description: "embedded drops the toolbar and frame, for cards and side panels." },
        { name: "toolbar", type: "ReactNode", description: "Extra toolbar content, such as filters or a “New event” button." },
        { name: "loading", type: "boolean", default: "false", description: "Dims events (old ones stay visible) and shows a spinner." },
        { name: "readOnly", type: "boolean", default: "false", description: "No create, move or resize." },
        { name: "listDays", type: "number", default: "7", description: "List view length, counted from the week start." },
        { name: "now", type: "Date | number", description: "A fixed “now” for tests and screenshots." },
        { name: "labels", type: "Partial<SchedulerLabels>", description: "Overrides for the scheduler namespace strings." },
      ],
    },
    {
      name: "core (React-free)",
      props: [
        { name: "layoutDayEvents(events, day, timeZone)", type: "PositionedEvent[]", description: "Packs overlapping timed events into columns: startMin, endMin, column, columns, span, continuesBefore/After." },
        { name: "packLanes(events, range, timeZone, { include })", type: "LaneAssignment[]", description: "Packs all-day and multi-day bars into lanes over a day range. include: \"all\" also packs timed events (month view)." },
        { name: "shiftEvent / instantAt / localDate / localMinutes", type: "functions", description: "Wall-clock maths in an explicit zone, safe across DST." },
        { name: "weekDays / monthWeeks", type: "(date, firstDay) => string[] / string[][]", description: "Week and month grids from the locale's first day." },
      ],
    },
  ],
  notes: [
    "Keyboard: events are focusable in time order. Alt+↑/↓ moves by the snap step, Alt+Shift+↑/↓ resizes, and Alt+←/→ changes the day. The context menu (right-click, Shift+F10) has “Change time…”, a dialog with date and time fields. This is the non-drag path for WCAG 2.5.7.",
    "Events and bars are opaque colour mixes over the solid surface. They never blur, so the glass material stays fast. The drag preview uses --popover.",
    "Week start, weekend and 12/24-hour clock come from the locale. Titles use Intl formatRange (“November 8 – 14, 2026”, “9–15 Kasım 2026”).",
    "Recurrence (RRULE) and ICS export are planned for a later release.",
  ],
  covers: ["Agenda / scheduler"],
};

export default entry;
