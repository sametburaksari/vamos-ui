import { ex, type DocEntry } from "../types";
import ChoiceGridDemo from "../examples/choice-grid/demo";
import ChoiceGridUnavailable from "../examples/choice-grid/unavailable";

const entry: DocEntry = {
  slug: "choice-grid",
  title: "Choice grid",
  group: "Pickers",
  description:
    "A two-axis choice — size × frequency, room × booking length, tier × term — where every cell is an option with its price. One radio group with a single tab stop and arrow keys in both axes; unavailable cells are skipped; the chosen cell's row and column headers light up so the choice reads as coordinates. Posts as row:column.",
  source: ["components/choice-grid.tsx"],
  basedOn: "WAI-ARIA radio group",
  usage: `import { ChoiceGrid } from "@vamos-ui/react";

<ChoiceGrid
  caption="Choose a size and how often it arrives"
  rows={[{ id: "small", label: "Small" }, { id: "large", label: "Large" }]}
  columns={[{ id: "weekly", label: "Weekly" }, { id: "monthly", label: "Monthly" }]}
  cell={(row, column) => ({ price: prices[row][column], meta: "per box" })}
  value={plan}
  onValueChange={setPlan}
  name="plan"
/>`,
  demo: ex("demo", "Size × frequency", "choice-grid/demo.tsx", ChoiceGridDemo),
  examples: [
    ex("unavailable", "Unavailable cells, posted", "choice-grid/unavailable.tsx", ChoiceGridUnavailable, "cell returns null where there is no offer; the arrow keys skip it. name posts row:column, rowName and columnName post each axis."),
  ],
  api: [
    { name: "ChoiceGrid", props: [
      { name: "rows / columns", type: "ChoiceGridAxisItem[]", description: "{ id, label, name?, description? }. name is the plain text used in accessible names when label is not a string." },
      { name: "cell", type: "(row, column) => ChoiceGridCell | null", description: "{ price?, text?, meta?, badge?, unavailable? }. null = unavailable." },
      { name: "value / defaultValue / onValueChange", type: "{ row, column } | null", description: "The chosen cell." },
      { name: "caption / corner", type: "ReactNode", description: "Visible caption (names the group) and the top-left header. Or pass aria-label." },
      { name: "name / rowName / columnName / form", type: "string", description: "Hidden fields: row:column, and each axis on its own." },
      { name: "formatPrice / currency", type: "(n) => string / string", description: "Default: provider currency, no fraction digits." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Tighter cells for many columns." },
      { name: "disabled", type: "boolean", description: "Every cell unavailable." },
      { name: "labels", type: "Partial<ChoiceGridLabels>", description: 'Dictionary namespace "choiceGrid": cell, cellNoPrice, unavailable, cellUnavailable.' },
    ] },
    { name: "choiceGridStep(available, [row, col], move)", props: [
      { name: "returns", type: "[row, col] | null", description: 'The next selectable cell for "next" | "prev" | "up" | "down" | "rowStart" | "rowEnd" | "first" | "last".' },
    ] },
  ],
  notes: [
    "Left / right move along the row and wrap to the next row (mirrored in RTL); up / down move within the column; Home / End go to the row ends, Ctrl + Home / End to the first and last cell. Selection follows focus, as in any radio group.",
    "Every cell's accessible name carries its row, column and price (\"Medium, Weekly: $27\"), so the headers are decorative for screen readers.",
    "The grid scrolls inside itself on narrow screens rather than squeezing the prices.",
  ],
  covers: [],
};

export default entry;
