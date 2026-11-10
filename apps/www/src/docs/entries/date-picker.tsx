import { ex, type DocEntry } from "../types";
import DatePickerDemo from "../examples/date-picker/demo";
import DatePickerButtonTrigger from "../examples/date-picker/button-trigger";
import DatePickerMinMax from "../examples/date-picker/min-max";
import DatePickerNaturalInput from "../examples/date-picker/natural-input";
import DatePickerDropdownCaption from "../examples/date-picker/dropdown-caption";
import DatePickerDateTime from "../examples/date-picker/date-time";
import DatePickerForm from "../examples/date-picker/form";
import DatePickerStates from "../examples/date-picker/states";

const entry: DocEntry = {
  slug: "date-picker",
  title: "Date Picker",
  group: "Pickers",
  description:
    "A single date in a typeable field with a popover calendar: due dates, hire dates, birth dates, publish dates. Type in the locale's pattern, digits only, a partial date or “tomorrow”. The value is always a YYYY-MM-DD string that never shifts across time zones. DateTimePicker adds a time for scheduling.",
  source: ["components/date-picker.tsx", "components/calendar.tsx", "components/time-picker.tsx", "lib/date.ts", "styles/calendar.css"],
  basedOn: "react-day-picker v9 + date-fns v4 + Radix Popover",
  usage: `import { DatePicker, Field } from "@vamos-cms/ui";

const [due, setDue] = React.useState<string | null>("2026-12-04");

<Field label="Invoice due date">
  <DatePicker value={due} onValueChange={setDue} clearable />
</Field>`,
  demo: ex("demo", "Demo", "date-picker/demo.tsx", DatePickerDemo),
  examples: [
    ex("button-trigger", "Button trigger", "date-picker/button-trigger.tsx", DatePickerButtonTrigger, "trigger=\"button\" for filter bars: the button reads the full date and opens a dialog (aria-haspopup=\"dialog\")."),
    ex("min-max", "Min and max", "date-picker/min-max.tsx", DatePickerMinMax, "Days outside min / max are disabled in the grid; a typed date out of range keeps its text, sets aria-invalid and reports a message through onInputError."),
    ex("natural-input", "Natural input & locales", "date-picker/natural-input.tsx", DatePickerNaturalInput, "Separators . / - and space, digits only (1123 / 23112026), partial dates (this year), two-digit years, month names, +N days and relative words from the dictionary."),
    ex("dropdown-caption", "Month and year dropdowns", "date-picker/dropdown-caption.tsx", DatePickerDropdownCaption, "calendarProps passes react-day-picker options through — captionLayout=\"dropdown\" with startMonth / endMonth for birth dates."),
    ex("date-time", "Date and time", "date-picker/date-time.tsx", DatePickerDateTime, "DateTimePicker emits a local wall-clock \"YYYY-MM-DDTHH:mm\" and shows the zone it is meant in. Picking a date first fills defaultTime."),
    ex("form", "In a form", "date-picker/form.tsx", DatePickerForm, "name renders a hidden input with the YYYY-MM-DD value, so plain FormData and server actions get an unambiguous date."),
    ex("states", "Sizes & states", "date-picker/states.tsx", DatePickerStates, "sm / md / lg follow --control-h; read-only, disabled and a Field error."),
  ],
  api: [
    {
      name: "DatePicker",
      props: [
        { name: "value / defaultValue", type: "string | null", description: "YYYY-MM-DD, or null when empty." },
        { name: "onValueChange", type: "(value: string | null) => void", description: "After a pick, Today, Clear, or a valid typed date (on blur / Enter)." },
        { name: "trigger", type: '"input" | "button"', default: '"input"', description: "Typeable field + calendar button, or a single trigger for filter bars." },
        { name: "displayFormat", type: '"short" | "medium" | "long" | "full"', default: '"long"', description: "Text of the button trigger, via Intl." },
        { name: "placeholder", type: "string", description: "Default: the locale pattern (MM/DD/YYYY, GG.AA.YYYY) or “Pick a date” for the button." },
        { name: "min / max", type: "string", description: "Earliest / latest selectable date (YYYY-MM-DD). Also limits calendar navigation." },
        { name: "disabledDays", type: "DayMatcher | DayMatcher[]", description: "react-day-picker matchers ({ dayOfWeek: [0, 6] }, { before }, functions) or YYYY-MM-DD strings." },
        { name: "clearable", type: "boolean", default: "false", description: "Clear button in the field and in the popover footer." },
        { name: "showToday", type: "boolean", default: "true", description: "Today shortcut in the popover footer (disabled when today is not allowed)." },
        { name: "name", type: "string", description: "Hidden input that submits YYYY-MM-DD." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Height from the density axis." },
        { name: "invalid / disabled / readOnly / required", type: "boolean", description: "Also read from the surrounding Field." },
        { name: "align", type: '"start" | "center" | "end"', default: '"start"', description: "Popover alignment." },
        { name: "open / defaultOpen / onOpenChange", type: "boolean / (open) => void", description: "Popover state." },
        { name: "onInputError", type: "(error: DateInputError | null, message: string) => void", description: "\"invalid\", \"beforeMin\", \"afterMax\" or \"unavailable\" for typed text, with a localized message for Field error." },
        { name: "calendarProps", type: "DatePickerCalendarProps", description: "Passed to the grid: captionLayout, startMonth, endMonth, showWeekNumber, renderDayExtra, size…" },
        { name: "labels", type: "Partial<DatePickerLabels>", description: "Strings (datePicker namespace): openCalendar, clear, today, invalid, tokens (dayToken / monthToken / yearToken), relative words." },
        { name: "calendarLabels", type: "Partial<CalendarLabels>", description: "Grid strings (calendar namespace)." },
      ],
    },
    {
      name: "DateTimePicker",
      props: [
        { name: "value / defaultValue", type: "string | null", description: "Local wall-clock \"YYYY-MM-DDTHH:mm\"." },
        { name: "onValueChange", type: "(value: string | null) => void", description: "Once both a date and a time are set; null otherwise." },
        { name: "defaultTime", type: "string | null", default: '"09:00"', description: "Time filled when only a date is picked; null waits for a time." },
        { name: "step", type: "number", default: "15", description: "Minutes between time slots and per arrow press." },
        { name: "hourCycle", type: "12 | 24", description: "Default from the locale." },
        { name: "minTime / maxTime", type: "string", description: "Allowed time of day (HH:mm)." },
        { name: "timeZone", type: "string", description: "IANA zone shown after the inputs (GMT+3). Convert on the server." },
        { name: "…DatePicker props", type: "", description: "min, max, disabledDays, size, labels, calendarProps…" },
      ],
    },
    {
      name: "Helpers",
      props: [
        { name: "parseDateInput(text, locale, options?)", type: "string | null", description: "The parser behind the field. Options: reference date, relative words." },
        { name: "formatDateInput(value, locale)", type: "string", description: "YYYY-MM-DD → locale numeric pattern." },
        { name: "dateToIso(date) / isoToDate(value)", type: "string / Date | null", description: "Local calendar conversions (no UTC shift)." },
        { name: "todayIso(timeZone?) / addIsoDays(value, n)", type: "string", description: "Date-only arithmetic." },
        { name: "registerDateLocale(tag, locale)", type: "void", description: "Add a date-fns locale for month / weekday names (en-US and tr built in)." },
      ],
    },
  ],
  notes: [
    "Never build the value with toISOString(): at UTC+3 a local midnight is the previous day in UTC. The pickers read and write the local calendar.",
    "Keyboard: the field stays typeable; Alt+↓ opens the calendar, where arrows / PageUp / PageDown / Home / End move, Enter picks and Esc closes and returns focus to the field.",
  ],
  covers: ["Date Picker"],
};

export default entry;
