import { ex, type DocEntry } from "../types";
import CountdownDemo from "../examples/countdown/demo";
import CountdownInline from "../examples/countdown/inline";
import CountdownUnits from "../examples/countdown/units";

const entry: DocEntry = {
  slug: "countdown",
  title: "Countdown",
  group: "Calendar & time",
  description:
    "Counts down to a moment — a launch, a registration opening, a sale ending. Segmented boxes or compact inline text, the units you choose, localized unit names, and something else to show once the time is up. Server-safe: it renders dashes until the clock starts on the client.",
  source: ["components/countdown.tsx"],
  basedOn: "WAI-ARIA timer role",
  usage: `import { Countdown } from "@vamos-ui/react";

<Countdown to="2027-03-01T09:00:00+03:00" label="Registration opens" highlightLast />
<Countdown variant="inline" units={["hours", "minutes", "seconds"]} to={sale.endsAt} completed="Sale ended" onComplete={refresh} />`,
  demo: ex("demo", "Demo", "countdown/demo.tsx", CountdownDemo),
  examples: [
    ex("inline", "Inline, with completed content", "countdown/inline.tsx", CountdownInline, "variant=\"inline\" for banners and buttons; completed replaces the clock and onComplete fires once."),
    ex("units", "Units and a fixed now", "countdown/units.tsx", CountdownUnits, "The largest unit absorbs the rest (hours only → 52 h). A fixed now keeps screenshots and tests stable."),
  ],
  api: [
    { name: "Countdown", props: [
      { name: "to", type: "string | number | Date", description: "Target moment." },
      { name: "now", type: "number", description: "Fixed epoch ms for static screens and tests. Omit to tick live (every second, or every minute without a seconds unit)." },
      { name: "units", type: '("days" | "hours" | "minutes" | "seconds")[]', default: "all four", description: "Units to show; the largest absorbs the overflow." },
      { name: "variant", type: '"segments" | "inline"', default: '"segments"', description: "One box per unit with a caption, or compact text (\"3d 04h 12m\")." },
      { name: "unitDisplay", type: '"long" | "short" | "narrow"', default: '"long"', description: "Caption style under each segment, from Intl (\"days\", \"gün\")." },
      { name: "highlightLast", type: "boolean", description: "Accent fill on the last segment." },
      { name: "label", type: "string", description: "What is counted down to; prefixes the accessible sentence." },
      { name: "completed", type: "ReactNode", description: "Shown (as role=\"status\") once the target is reached. Default: the clock at zero." },
      { name: "onComplete", type: "() => void", description: "Fires once when the target is reached, also when it is already past on mount." },
      { name: "labels", type: "Partial<CountdownLabels>", description: 'Dictionary namespace "countdown": remaining ("{time} left"), until ("Until {date}"), completed.' },
    ] },
    { name: "countdownParts(to, now, units?)", props: [
      { name: "returns", type: "{ values, total (s), done }", description: "Pure split for custom layouts." },
    ] },
  ],
  notes: ["role=\"timer\" is not a live region and its sentence changes once a minute (every second only in the last minute), so the ticking never floods a screen reader. The digits are aria-hidden.", "Announce the end yourself (or via completed, which is a status region) if people need to hear it."],
  covers: [],
};

export default entry;
