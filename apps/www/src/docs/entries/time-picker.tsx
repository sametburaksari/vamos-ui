import { ex, type DocEntry } from "../types";
import TimePickerDemo from "../examples/time-picker/demo";
import TimePickerSlots from "../examples/time-picker/slots";
import TimePickerTwelveHour from "../examples/time-picker/twelve-hour";
import TimePickerRange from "../examples/time-picker/range";
import TimePickerStates from "../examples/time-picker/states";

const entry: DocEntry = {
  slug: "time-picker",
  title: "Time picker",
  group: "Pickers",
  description:
    "A time of day for meetings, shifts, pickups and opening hours. Segmented input where each part is a spinbutton (type digits, ↑ ↓, ← →), an optional slot list every N minutes, and a start–end range with duration. The value is always \"HH:mm\" 24h; the display follows the locale (2:30 PM / 14:30).",
  source: ["components/time-picker.tsx", "lib/date.ts"],
  basedOn: "WAI-ARIA spinbutton + Radix Popover",
  usage: `import { Field, TimePicker } from "@vamos-cms/ui";

<Field label="Meeting starts">
  <TimePicker value={time} onValueChange={setTime} slots step={30} />
</Field>`,
  demo: ex("demo", "Demo", "time-picker/demo.tsx", TimePickerDemo),
  examples: [
    ex("slots", "Slot list", "time-picker/slots.tsx", TimePickerSlots, "slots opens a listbox every step minutes between min and max; disabledTimes greys out a lunch break."),
    ex("twelve-hour", "12-hour and 24-hour", "time-picker/twelve-hour.tsx", TimePickerTwelveHour, "Segment order, separator and AM/PM labels come from Intl. Both fields share one \"HH:mm\" value."),
    ex("range", "Shift start and end", "time-picker/range.tsx", TimePickerRange, "TimeRangePicker shows the duration and flags an end before the start, unless overnight is set (then +1 day)."),
    ex("states", "Seconds, sizes & states", "time-picker/states.tsx", TimePickerStates, "seconds adds a segment; disabled, read-only, out of range (aria-invalid) and sizes."),
  ],
  api: [
    {
      name: "TimeInput / TimePicker",
      props: [
        { name: "value / defaultValue", type: "string | null", description: "\"HH:mm\" (\"HH:mm:ss\" with seconds), 24h." },
        { name: "onValueChange", type: "(value: string | null) => void", description: "A complete time, or null when emptied or left incomplete." },
        { name: "hourCycle", type: "12 | 24", description: "Display only. Default from the locale (en-US 12, tr 24)." },
        { name: "step", type: "number", default: "1 (TimeInput) · 15 (TimePicker)", description: "Minutes per ↑ / ↓ on the minute segment and between slots." },
        { name: "seconds", type: "boolean", default: "false", description: "Adds a seconds segment." },
        { name: "min / max", type: "string", description: "Allowed range (HH:mm). Outside it the group is aria-invalid." },
        { name: "disabledTimes", type: "(time: string) => boolean", description: "Times that are not allowed (also disabled in the slot list)." },
        { name: "slots", type: "boolean", default: "false", description: "TimePicker only: slot list popover." },
        { name: "slotRange", type: "{ start: string; end: string }", description: "TimePicker only: first / last slot. Default min / max or the whole day." },
        { name: "name", type: "string", description: "Hidden input submitting HH:mm." },
        { name: "size / variant", type: '"sm" | "md" | "lg" / "default" | "ghost"', default: '"md" / "default"', description: "Box look (controlVariants)." },
        { name: "invalid / disabled / readOnly / required", type: "boolean", description: "Also read from Field." },
        { name: "icon / trailing", type: "ReactNode", description: "Leading icon (null hides the clock) and end content." },
        { name: "labels", type: "Partial<TimePickerLabels>", description: "timePicker namespace: hour, minute, second, dayPeriod, showTimes, durations." },
      ],
    },
    {
      name: "TimeRangePicker",
      props: [
        { name: "value / defaultValue", type: "{ start: string | null; end: string | null }", description: "Two HH:mm values." },
        { name: "onValueChange", type: "(value: TimeRange) => void", description: "Any change of either end." },
        { name: "overnight", type: "boolean", default: "false", description: "An earlier end means the next day (night shift)." },
        { name: "showDuration", type: "boolean", default: "true", description: "Duration hint, announced politely." },
        { name: "nameStart / nameEnd", type: "string", description: "Hidden inputs." },
      ],
    },
  ],
  notes: [
    "Each segment is role=\"spinbutton\" with aria-valuenow / min / max / valuetext inside a role=\"group\" labelled by the Field. Digits type ahead and auto-advance; Backspace clears a segment, then moves back; : or . jumps to the next segment; A / P set the period.",
    "The input group is always dir=\"ltr\" so times read the same in right-to-left pages.",
  ],
  covers: ["Time picker"],
};

export default entry;
