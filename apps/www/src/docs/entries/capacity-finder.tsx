import { ex, type DocEntry } from "../types";
import CapacityFinderDemo from "../examples/capacity-finder/demo";
import CapacityFinderDetailed from "../examples/capacity-finder/detailed";

const entry: DocEntry = {
  slug: "capacity-finder",
  title: "Capacity finder",
  group: "Pickers",
  description:
    "Filter a set of options by head count and layout and see which fit and why — meeting rooms by seating style, tables by party size, vehicles by seat configuration, sessions by format. A layout switch and a count slider with a synced number field drive a live summary and a list where every option shows its capacity against the number.",
  source: ["components/capacity-finder.tsx"],
  usage: `import { CapacityFinder } from "@vamos-ui/react";

<CapacityFinder
  arrangements={[{ id: "theatre", label: "Theatre", phrase: "theatre-style" }, { id: "boardroom", label: "Boardroom", phrase: "around one table" }]}
  options={[{ id: "north", name: "North Room", meta: "Floor 2", capacities: { theatre: 90, boardroom: 28 } }]}
  renderAction={({ option }) => <Button size="sm">Request {option.name}</Button>}
/>`,
  demo: ex("demo", "Demo", "capacity-finder/demo.tsx", CapacityFinderDemo),
  examples: [
    ex("detailed", "Sorted, every layout", "capacity-finder/detailed.tsx", CapacityFinderDetailed, "sortByFit puts the options that fit first; showAllCapacities adds each option's capacity in every layout, the current one marked."),
  ],
  api: [
    { name: "CapacityFinder", props: [
      { name: "options", type: "CapacityOption[]", description: "{ id, name, capacities: Record<arrangementId, number | null>, meta?, description?, media? }. null or missing = not possible in that layout." },
      { name: "arrangements", type: "CapacityArrangement[]", description: "{ id, label, phrase?, hint? } — phrase is used in the summary (\"theatre-style\")." },
      { name: "count / defaultCount / onCountChange", type: "number", description: "Head count, controlled or not. Default: min." },
      { name: "arrangement / defaultArrangement / onArrangementChange", type: "string", description: "Selected layout. Default: the first." },
      { name: "min / max / step", type: "number", default: "1 / largest capacity / 1", description: "Slider bounds." },
      { name: "sortByFit", type: "boolean", default: "false", description: "Fitting options first, then too small, then unavailable." },
      { name: "showAllCapacities", type: "boolean", default: "false", description: "Capacity grid per option." },
      { name: "renderAction", type: "({ option, status, capacity }) => ReactNode", description: "Trailing content per option." },
      { name: "noneFitMessage", type: "ReactNode", description: "Shown when nothing fits." },
      { name: "labels", type: "Partial<CapacityFinderLabels>", description: 'Dictionary namespace "capacityFinder": arrangement, count, countInput, result, resultNone, largest, fits, tooSmall, unavailable, upTo.' },
    ] },
    { name: "capacityFit(options, arrangement, count)", props: [
      { name: "returns", type: "{ option, status, capacity }[]", description: 'status: "fits" | "too-small" | "unavailable". For server-side filtering or your own layout.' },
    ] },
  ],
  notes: [
    "The summary is a polite live region, so moving the slider or switching layout is announced once it settles.",
    "Status is in text (\"Fits · up to 90\"), not only in the bar colour.",
  ],
  covers: [],
};

export default entry;
