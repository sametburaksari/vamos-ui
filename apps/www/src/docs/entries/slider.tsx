import { ex, type DocEntry } from "../types";
import SliderDemo from "../examples/slider/demo";
import SliderRange from "../examples/slider/range";
import SliderMarks from "../examples/slider/marks";
import SliderCommit from "../examples/slider/commit";
import SliderStates from "../examples/slider/states";

const entry: DocEntry = {
  slug: "slider",
  title: "Slider",
  group: "Forms & inputs",
  description:
    "Choose a number or a range by dragging: a price filter, a salary band, deal probability, image opacity. Marks, a value bubble, synced number inputs, and Intl formatting with the provider locale.",
  source: ["components/slider.tsx", "components/input.tsx", "lib/locale.tsx"],
  basedOn: "Radix Slider",
  usage: `import { Field, Slider } from "@vamos-cms/ui";

<Field label="Price per night">
  <Slider
    defaultValue={[120, 340]}
    min={40}
    max={600}
    step={10}
    formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
    withInputs
  />
</Field>`,
  demo: ex("demo", "Demo", "slider/demo.tsx", SliderDemo),
  examples: [
    ex("range", "Range with inputs", "slider/range.tsx", SliderRange, "Two values = range. Thumbs are named \"Price per night Minimum / Maximum\"; typed values are snapped to step and can't cross. names gives each thumb its own form field."),
    ex("marks", "Marks", "slider/marks.tsx", SliderMarks, "Numbers or { value, label }. showValue=\"always\" pins the bubble; \"never\" hides it when the marks already say it."),
    ex("commit", "Filter on release", "slider/commit.tsx", SliderCommit, "onValueChange for the live preview, onValueCommit to filter or call the server once per gesture."),
    ex("states", "Sizes & states", "slider/states.tsx", SliderStates, "Small, disabled, read-only, a Field error and vertical orientation."),
  ],
  api: [
    {
      name: "Slider",
      props: [
        { name: "value / defaultValue", type: "number[]", default: "[min]", description: "One number = single, two = range." },
        { name: "onValueChange", type: "(value: number[]) => void", description: "Continuously while dragging." },
        { name: "onValueCommit", type: "(value: number[]) => void", description: "On release / key up — wire filters here." },
        { name: "min / max / step", type: "number", default: "0 / 100 / 1", description: "Bounds and step." },
        { name: "minStepsBetweenThumbs", type: "number", default: "0", description: "Minimum gap in a range." },
        { name: "marks", type: "(number | { value, label })[]", description: "Ticks under the track; labels optional." },
        { name: "formatOptions", type: "Intl.NumberFormatOptions", description: "Formatting with the provider locale (currency, percent, unit)." },
        { name: "formatValue", type: "(n: number) => string", description: "Custom formatter (client components only). Wins over formatOptions." },
        { name: "showValue", type: '"never" | "hover" | "always"', default: '"hover"', description: "Value bubble above the thumb (hover, focus and drag)." },
        { name: "withInputs", type: "boolean", description: "Number inputs under the track, commit on blur / Enter." },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "Track and thumb size." },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Vertical needs a height on the parent." },
        { name: "thumbLabels", type: "string[]", description: "Accessible name per thumb. Range default: Minimum / Maximum (dictionary slider.*)." },
        { name: "name", type: "string", description: "Form name; range values submit as repeated entries (formData.getAll(name))." },
        { name: "names", type: "string[]", description: "Separate form names per thumb, e.g. [\"priceMin\", \"priceMax\"]." },
        { name: "invalid / readOnly / disabled / required", type: "boolean", description: "State; inherited from Field." },
        { name: "labels", type: "Partial<{ min, max, value }>", description: "Built-in string overrides." },
      ],
    },
  ],
  notes: [
    "Keyboard: arrows ± step, Page Up / Page Down ± 10 steps, Home / End to the bounds. aria-valuetext carries the formatted value (\"$120\", \"₺1.250\").",
    "In server components pass formatOptions, not formatValue — functions can't cross into client components.",
  ],
  covers: ["Slider (range)"],
};

export default entry;
