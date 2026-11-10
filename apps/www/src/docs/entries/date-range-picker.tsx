import { ex, type DocEntry } from "../types";
import DateRangePickerDemo from "../examples/date-range-picker/demo";
import DateRangePickerApply from "../examples/date-range-picker/apply";
import DateRangePickerLimits from "../examples/date-range-picker/limits";
import DateRangePickerCustomPresets from "../examples/date-range-picker/custom-presets";
import DateRangePickerInput from "../examples/date-range-picker/input";
import DateRangePickerStates from "../examples/date-range-picker/states";

const entry: DocEntry = {
  slug: "date-range-picker",
  title: "Date range picker",
  group: "Pickers",
  description:
    "Pick a from–to range for report filters, leave requests, bookings and campaign flights. Presets column, two months side by side (one on phones), a hover preview of the band, min / max length, and an Apply mode for expensive queries. Values are YYYY-MM-DD strings.",
  source: ["components/date-range-picker.tsx", "components/calendar.tsx", "components/date-picker.tsx", "lib/date.ts", "styles/calendar.css"],
  basedOn: "react-day-picker v9 (range mode) + Radix Popover",
  usage: `import { DateRangePicker, type IsoDateRange } from "@vamos-ui/react";

const [range, setRange] = React.useState<IsoDateRange | null>(null);

<DateRangePicker aria-label="Report period" presets value={range} onValueChange={setRange} />`,
  demo: ex("demo", "Demo", "date-range-picker/demo.tsx", DateRangePickerDemo),
  examples: [
    ex("apply", "Apply to commit", "date-range-picker/apply.tsx", DateRangePickerApply, "commit=\"apply\" holds the draft until Apply, so a dashboard runs one query per decision. Cancel or Esc discards it."),
    ex("limits", "Length limits & booked days", "date-range-picker/limits.tsx", DateRangePickerLimits, "After the first click, days that would make the range shorter than minDays or longer than maxDays are disabled. excludeDisabled restarts a range that would span a booked day."),
    ex("custom-presets", "Custom presets", "date-range-picker/custom-presets.tsx", DateRangePickerCustomPresets, "Any { id, label, range(today) } list — here fiscal quarters. The active preset is highlighted in the listbox."),
    ex("input", "Typeable fields", "date-range-picker/input.tsx", DateRangePickerInput, "trigger=\"input\": two fields with the same parser as Date Picker; an end before the start is swapped."),
    ex("states", "Sizes & states", "date-range-picker/states.tsx", DateRangePickerStates, "Small, disabled, a Field error and empty."),
  ],
  api: [
    {
      name: "DateRangePicker",
      props: [
        { name: "value / defaultValue", type: "IsoDateRange | null", description: "{ from, to? } as YYYY-MM-DD. to is missing while the end is being picked." },
        { name: "onValueChange", type: "(value: IsoDateRange | null) => void", description: "Every change (immediate) or on Apply." },
        { name: "presets", type: "boolean | DateRangePreset[]", default: "false", description: "true = Today, Yesterday, Last 7 / 30 / 90 days, This week, This / Last month, This year. Week presets follow the locale's week start." },
        { name: "numberOfMonths", type: "1 | 2", default: "2", description: "Drops to 1 below the sm breakpoint." },
        { name: "commit", type: '"immediate" | "apply"', default: '"immediate"', description: "Immediate closes after the end is picked; apply waits for the button." },
        { name: "minDays / maxDays", type: "number", description: "Inclusive length limits in days." },
        { name: "min / max", type: "string", description: "Earliest / latest date (YYYY-MM-DD)." },
        { name: "disabledDays", type: "DayMatcher | DayMatcher[]", description: "Matchers or YYYY-MM-DD strings." },
        { name: "excludeDisabled", type: "boolean", default: "false", description: "A range may not span a disabled day." },
        { name: "trigger", type: '"button" | "input"', default: '"button"', description: "One trigger showing the range, or two typeable fields." },
        { name: "nameFrom / nameTo", type: "string", description: "Hidden inputs submitting YYYY-MM-DD." },
        { name: "placeholder", type: "string", default: '"Pick a date range"', description: "Empty trigger text." },
        { name: "clearable", type: "boolean", default: "false", description: "Clear in the footer (and in the input trigger)." },
        { name: "size / invalid / disabled / readOnly / required", type: "", description: "As every control; also read from Field." },
        { name: "open / defaultOpen / onOpenChange", type: "boolean / (open) => void", description: "Popover state." },
        { name: "calendarProps", type: "DatePickerCalendarProps", description: "Extra grid props (showWeekNumber, renderDayExtra…)." },
        { name: "labels", type: "Partial<DateRangePickerLabels>", description: "dateRangePicker namespace: preset names, Apply / Cancel, days plural, summary announcement." },
      ],
    },
    {
      name: "DateRangePreset",
      props: [
        { name: "id", type: "string", description: "Stable key." },
        { name: "label", type: "string", description: "Shown in the presets listbox." },
        { name: "range", type: "(today: string, ctx: { weekStartsOn }) => { from: string; to: string }", description: "Computed when the popover renders, from today in the provider's time zone." },
      ],
    },
  ],
  notes: [
    "Presets are a listbox (↑ ↓ Home End, Enter). The grid uses the WAI-ARIA grid keyboard model. The selected range is announced: “From November 1, 2026 to November 10, 2026, 10 days”.",
    "On glass, the range band is an opaque mix of the accent and the surface, so it never shows the page through it.",
  ],
  covers: ["Date range picker"],
};

export default entry;
