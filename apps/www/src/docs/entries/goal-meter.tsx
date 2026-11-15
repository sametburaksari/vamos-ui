import { ex, type DocEntry } from "../types";
import GoalMeterDemo from "../examples/goal-meter/demo";
import GoalMeterStock from "../examples/goal-meter/stock";
import GoalMeterCompact from "../examples/goal-meter/compact";

const entry: DocEntry = {
  slug: "goal-meter",
  title: "Goal meter",
  group: "Data display",
  description:
    "Progress toward a goal with its context — raised against the target, the share, backers and the deadline with days left — for campaigns, pre-order thresholds and membership drives. The stock variant reads the same bar as units left of a run, warning when low and \"Sold out\" at zero. Built on Progress.",
  source: ["components/goal-meter.tsx"],
  basedOn: "Progress",
  usage: `import { GoalMeter } from "@vamos-ui/react";

<GoalMeter label="Spring campaign" value={182400} goal={250000} backers={612} deadline="2026-12-31" />
<GoalMeter variant="stock" size="compact" value={6} goal={40} />`,
  demo: ex("demo", "Campaign", "goal-meter/demo.tsx", GoalMeterDemo),
  examples: [
    ex("stock", "Stock left", "goal-meter/stock.tsx", GoalMeterStock, "variant=\"stock\": units left of a run; warning at or below lowAt (20%), sold out at zero."),
    ex("compact", "Compact, other units", "goal-meter/compact.tsx", GoalMeterCompact, "format=\"number\" or a function for goals that are not money; labels rename backers."),
  ],
  api: [
    { name: "GoalMeter", props: [
      { name: "value / goal", type: "number", description: "Raised and target — or units left and the run (stock)." },
      { name: "variant", type: '"goal" | "stock"', default: '"goal"', description: "Raised against a target, or stock left." },
      { name: "label", type: "ReactNode", description: "Eyebrow: campaign or product name." },
      { name: "backers", type: "number", description: "Backers, donors, orders (rename with labels.backers)." },
      { name: "deadline / now", type: "string | Date", description: "End date. Days left appear with now, or after hydration (the server renders the date only)." },
      { name: "format / currency", type: '"currency" | "number" | (n) => string', default: 'currency (goal), number (stock)', description: "How the amounts read." },
      { name: "lowAt", type: "number", default: "0.2", description: "Stock share at which the bar turns warning." },
      { name: "size", type: '"default" | "compact"', default: '"default"', description: "Compact for cards and heroes." },
      { name: "footer", type: "ReactNode", description: "A line under the meter." },
      { name: "labels", type: "Partial<GoalMeterLabels>", description: 'Dictionary namespace "goalMeter": meter, stockMeter, of, valueText, percent, backers, ends, ended, daysLeft, lastDay, reached, left, soldOut, low.' },
    ] },
    { name: "daysUntil(deadline, now)", props: [{ name: "returns", type: "number", description: "Whole days to the end of the deadline day; 0 on the last day, −1 once past." }] },
  ],
  notes: [
    "role=\"progressbar\" with one aria-valuetext sentence (\"$182,400 of $250,000 raised, 73%\"); the big figure is hidden from screen readers so it is not read twice.",
    "Low stock and sold out are stated in text, not only in the bar colour.",
  ],
  covers: [],
};

export default entry;
