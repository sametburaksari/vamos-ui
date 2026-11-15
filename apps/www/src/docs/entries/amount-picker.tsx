import { ex, type DocEntry } from "../types";
import AmountPickerDemo from "../examples/amount-picker/demo";
import AmountPickerTopUp from "../examples/amount-picker/top-up";

const entry: DocEntry = {
  slug: "amount-picker",
  title: "Amount picker",
  group: "Forms & inputs",
  description:
    "Pick an amount to give or pay: preset amounts with an impact line for the chosen one, an \"Other amount\" currency field with bounds, and a one-off / monthly switch (or your own frequencies) that can swap the presets. Donations, tips, top-ups, gift cards and pledges.",
  source: ["components/amount-picker.tsx"],
  usage: `import { AmountPicker } from "@vamos-ui/react";

<AmountPicker
  amounts={(frequency) => (frequency === "monthly" ? monthlyAmounts : oneOffAmounts)}
  min={50}
  name="amount"
  frequencyName="frequency"
/>`,
  demo: ex("demo", "Donation", "amount-picker/demo.tsx", AmountPickerDemo),
  examples: [ex("top-up", "Own frequencies, computed impact", "amount-picker/top-up.tsx", AmountPickerTopUp, "frequencies with a suffix for the summary, bounds on the custom amount and an impact function for any amount.")],
  api: [
    { name: "AmountPicker", props: [
      { name: "amounts", type: "AmountOption[] | (frequency) => AmountOption[]", description: "{ value, impact?, badge? }. A function swaps the presets per frequency." },
      { name: "frequencies", type: "AmountFrequency[] | false", default: "one-off, monthly", description: "{ id, label, suffix? }. suffix (\"a month\") turns the summary recurring. false hides the switch." },
      { name: "value / defaultValue / onValueChange", type: "{ amount: number | null, frequency }", description: "The choice." },
      { name: "allowCustom / min / max", type: "boolean / number", default: "true", description: "\"Other amount\" with a currency field; bounds are checked and explained." },
      { name: "impact", type: "(amount, frequency) => ReactNode", description: "Impact line for any amount. Default: the largest preset at or below it." },
      { name: "currency", type: "string", description: "Default: the provider currency." },
      { name: "name / frequencyName / form", type: "string", description: "Hidden fields (amount empty while out of bounds)." },
      { name: "columns", type: "2 | 3 | 4", default: "3", description: "Preset columns." },
      { name: "labels", type: "Partial<AmountPickerLabels>", description: 'Dictionary namespace "amountPicker": frequency, once, monthly, amount, custom, customInput, summaryOnce, summaryRecurring, perMonth, min, max, empty.' },
    ] },
    { name: "impactFor(options, amount)", props: [{ name: "returns", type: "ReactNode", description: "The impact of the largest preset at or below the amount." }] },
  ],
  notes: [
    "Frequency and amount are radio groups (one tab stop each); the summary and impact line are a polite live region.",
    "State the recurring charge plainly before payment — amount, frequency, first charge and how to cancel.",
  ],
  covers: [],
};

export default entry;
