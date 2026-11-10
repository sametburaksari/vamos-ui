import { ex, type DocEntry } from "../types";
import CalendarDemo from "../examples/calendar/demo";
import CalendarHolidays from "../examples/calendar/holidays";
import CalendarYear from "../examples/calendar/year";
import CalendarBooking from "../examples/calendar/booking";
import CalendarRangeWithAbsences from "../examples/calendar/range-with-absences";
import CalendarWeekNumbers from "../examples/calendar/week-numbers";
import CalendarActivity from "../examples/calendar/activity";

const entry: DocEntry = {
  slug: "calendar",
  title: "Calendar",
  group: "Calendar & time",
  description:
    "A month, multi-month or year calendar with something on each day: event dots, holidays, absences, availability. Single, multiple or range selection with YYYY-MM-DD values; week start, weekend and week numbers from the locale; Turkish public holidays built in. CalendarGrid is the shared grid behind every date picker.",
  source: ["components/calendar.tsx", "lib/date.ts", "styles/calendar.css", "locale-data/core/week-info.ts", "locale-data/tr/holidays.ts"],
  basedOn: "react-day-picker v9 + date-fns v4",
  usage: `import { Calendar } from "@vamos-ui/react";

<Calendar
  value={day}
  onValueChange={setDay}
  markers={{ "2026-11-24": [{ label: "Black Friday launch", tone: "warning" }] }}
/>`,
  demo: ex("demo", "Demo", "calendar/demo.tsx", CalendarDemo),
  examples: [
    ex("booking", "Booking: day, then time", "calendar/booking.tsx", CalendarBooking, "A spa booking page: closed Mondays, a 5-week window, “slots left” dots, and CalendarSlots — a radiogroup with loading and empty states."),
    ex("range-with-absences", "Time off with team absences", "calendar/range-with-absences.tsx", CalendarRangeWithAbsences, "mode=\"range\" over two months; each day's markers are read out with the date (“Wednesday, December 23rd, 2026, Daniel Park — annual leave, …”)."),
    ex("activity", "Large cells", "calendar/activity.tsx", CalendarActivity, "size=\"lg\" gives each day a content area: marker labels, holidays, “+2 more”. Weekends get the inset surface."),
    ex("holidays", "Holidays by locale", "calendar/holidays.tsx", CalendarHolidays, "The tr locale loads Turkish public holidays (Diyanet-verified religious dates) and starts weeks on Monday. Half-day eves say “from 13:00”. Pass holidays={provider} for your own data or false to hide them."),
    ex("year", "Year view", "calendar/year.tsx", CalendarYear, "months={12} lays out compact months in a responsive grid; prev / next move a whole year. Dots show density."),
    ex("week-numbers", "Week numbers & week start", "calendar/week-numbers.tsx", CalendarWeekNumbers, "Week start and first-week rule come from getWeekInfo (Intl.Locale with a CLDR fallback)."),
  ],
  api: [
    {
      name: "Calendar",
      props: [
        { name: "mode", type: '"single" | "multiple" | "range" | "none"', default: '"single"', description: "\"none\" is display only." },
        { name: "value / defaultValue", type: "string | null · string[] · IsoDateRange | null", description: "YYYY-MM-DD values, by mode." },
        { name: "onValueChange", type: "(value) => void", description: "Same shape as value." },
        { name: "months", type: "1 | 2 | 3 | 12", default: "1", description: "12 is the year view (compact cells)." },
        { name: "month / defaultMonth / onMonthChange", type: "string", description: "Visible month as YYYY-MM (or any date in it). onMonthChange gets YYYY-MM-01." },
        { name: "onVisibleRangeChange", type: "({ start, end }) => void", description: "The visible window, to fetch events for it." },
        { name: "markers", type: "Record<string, CalendarMarker | CalendarMarker[]>", description: "Per-day { label, tone?, count? }. Dots in sm / md, labelled lines in lg; always part of the day's accessible name." },
        { name: "renderDay", type: "(date: Date, info: CalendarDayInfo) => ReactNode", description: "Custom content under the number (replaces dots)." },
        { name: "holidays", type: "HolidayProvider | HolidayProvider[] | false", description: "Default: the locale pack (tr → Turkish public holidays)." },
        { name: "holidayRegion", type: "string", description: "ISO 3166-2 filter for regional holidays." },
        { name: "min / max / disabledDays", type: "string / DayMatcher[]", description: "Selectable window and unavailable days. min / max also stop navigation." },
        { name: "required", type: "boolean", default: "false", description: "Single mode: the selected day can't be cleared by clicking it again." },
        { name: "showWeekNumbers", type: "boolean", default: "false", description: "Week number column (locale rules)." },
        { name: "weekStartsOn", type: "0–6", description: "Override the locale's first day (0 = Sunday)." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md" ("sm" in year view)', description: "32px, --control-h, or 76px cells with content." },
        { name: "variant", type: '"plain" | "card"', default: '"plain"', description: "card wraps it in a surface." },
        { name: "header / headerAction", type: "boolean / ReactNode", default: "true", description: "Title, Today, prev / next; extra content in the header." },
        { name: "legend", type: "CalendarLegendItem[] | boolean", description: "Key under the grid; holidays in view are added automatically." },
        { name: "loading", type: "boolean", default: "false", description: "Placeholder dots and aria-busy while the range loads." },
        { name: "footer", type: "ReactNode", description: "Content under the grid." },
        { name: "gridProps", type: "Partial<CalendarGridProps>", description: "Extra react-day-picker props." },
        { name: "labels", type: "Partial<CalendarLabels>", description: "calendar namespace strings." },
      ],
    },
    {
      name: "CalendarSlots",
      props: [
        { name: "slots", type: "CalendarSlot[]", description: "{ start: \"HH:mm\", end?, available, label? }." },
        { name: "value / defaultValue / onValueChange", type: "string | null", description: "Selected start time." },
        { name: "day", type: "string | null", description: "Heading (“Thursday, November 12”)." },
        { name: "loading / error / onRetry", type: "boolean / ReactNode / () => void", description: "Skeleton, error with retry, and the empty state “No times available on this day”." },
        { name: "hourCycle / columns", type: "12 | 24 / 2 | 3 | 4", default: "locale / 3", description: "Display." },
      ],
    },
    {
      name: "CalendarGrid",
      props: [
        { name: "…DayPickerProps", type: "react-day-picker v9", description: "mode, selected, onSelect, month, numberOfMonths, captionLayout, showWeekNumber, modifiers, disabled… pass through (Date objects)." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Cell size." },
        { name: "renderDayExtra", type: "(date, modifiers) => ReactNode", description: "Slot under the number." },
        { name: "describeDay / dayTitle", type: "(date, modifiers) => string | undefined", description: "Accessible-name suffix and native tooltip." },
        { name: "markWeekends", type: "boolean", default: "true", description: "data-weekend from the locale's weekend." },
      ],
    },
  ],
  notes: [
    "Day cells expose data-today, data-selected, data-range-start / -middle / -end, data-disabled, data-outside, data-weekend and data-holiday for styling.",
    "Cells never blur; the range band is an opaque accent mix so it stays legible on glass.",
  ],
  covers: ["Calendar"],
};

export default entry;
