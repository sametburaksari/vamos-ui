import { ex, type DocEntry } from "../types";
import EstimatorDemo from "../examples/estimator/demo";
import EstimatorStatement from "../examples/estimator/statement";
import EstimatorPlans from "../examples/estimator/plans";
import EstimatorPlanner from "../examples/estimator/planner";

const entry: DocEntry = {
  slug: "estimator",
  title: "Estimator",
  group: "Forms & inputs",
  description:
    "A live calculator: declarative inputs (number, slider, select, toggle, option cards, add-on checkboxes) feed a pure formula you pass, and a summary panel shows the total or a range, line items, a spec sheet, notes and a call to action that hands the selection on. Fee estimates, quotes, package builders, usage pricing and planners. Sticky beside the inputs on wide containers, a bottom bar on narrow ones.",
  source: ["components/estimator.tsx"],
  usage: `import { Estimator } from "@vamos-ui/react";

<Estimator
  inputs={[
    { type: "options", id: "size", label: "Home size", variant: "segmented", options: [{ value: "s", label: "Studio" }, { value: "m", label: "2 rooms" }] },
    { type: "slider", id: "km", label: "Distance", min: 1, max: 80, format: (v) => \`\${v} km\` },
    { type: "addons", id: "extras", label: "Extras", options: [{ value: "pack", label: "Packing", meta: "+ $900" }] },
  ]}
  formula={(v) => {
    const total = base[v.size as string] + (v.km as number) * 18;
    return { total, range: [total * 0.9, total * 1.1], lines: [{ id: "base", label: "Crew and truck", amount: total }] };
  }}
  cta="Get a fixed price"
  onSubmit={(values, result) => openQuoteForm(values, result)}
/>`,
  demo: ex("demo", "Quote with a range", "estimator/demo.tsx", EstimatorDemo),
  examples: [
    ex("statement", "Fee statement into a form", "estimator/statement.tsx", EstimatorStatement, "numbered inputs, an add-on shown only for one company type (when), subtotal and tax lines, and name + form posting the selection as JSON with a contact form elsewhere on the page."),
    ex("plans", "Usage pricing across plans", "estimator/plans.tsx", EstimatorPlans, "Lines compare plans; the cheapest that fits is highlighted with a badge, plans that do not fit show text instead of an amount."),
    ex("planner", "Planner with extra content", "estimator/planner.tsx", EstimatorPlanner, "A select and two sliders drive a projection; facts carry the goal and the month it is reached, summaryExtra adds a progress bar (or a chart)."),
  ],
  api: [
    { name: "Estimator", props: [
      { name: "inputs", type: "EstimatorInput[]", description: 'Each { type, id, label, hint?, when?, disabled? } plus per type — "number": min/max/step · "slider": min, max, step?, marks?, format?, withInput? · "select": options (string labels) · "toggle": description? · "options": options, variant "card" | "segmented", columns? · "addons": options, columns?. Options are { value, label, description?, meta?, icon?, disabled?, when? }.' },
      { name: "formula", type: "(values) => EstimateResult", description: "Pure. Returns { total: number | null, range?: [low, high], lines?, facts?, notes?, ready? }. Lines are { id, label, amount?, text?, detail?, kind?: \"item\" | \"discount\" | \"subtotal\" | \"tax\" | \"info\", highlight?, badge? }." },
      { name: "values / defaultValues / onValuesChange", type: "EstimatorValues", description: "Record<id, number | string | boolean | string[]>. onValuesChange gets (values, result)." },
      { name: "format", type: '"currency" | "number" | (n) => string', default: '"currency"', description: "How amounts read; currency uses the provider currency or `currency`." },
      { name: "currency / fractionDigits", type: "string / number", default: "provider / 0", description: "Currency code and fraction digits." },
      { name: "title / totalLabel / totalSuffix", type: "ReactNode", description: "Panel heading, label beside the figure (\"Monthly, excl. tax\") and text after it (\"/ month\")." },
      { name: "numbered", type: "boolean", default: "false", description: "01, 02… before each input label." },
      { name: "cta / ctaHref / onSubmit", type: "ReactNode / string / (values, result) => void", description: "The call to action. Disabled while the result is not ready (total null or ready: false)." },
      { name: "name / form / serialize", type: "string / string / (values, result) => string", description: "A hidden field with the selection (default JSON of { values, total, range }); form ties it to a form elsewhere." },
      { name: "summaryExtra", type: "(values, result) => ReactNode", description: "Extra content in the panel: a chart, a timeline." },
      { name: "stickyTop", type: "string", default: '"1.5rem"', description: "Sticky offset below a fixed header." },
      { name: "labels", type: "Partial<EstimatorLabels>", description: 'Dictionary namespace "estimator": summary, total, range, live, empty, details, step.' },
    ] },
    { name: "estimatorDefaults(inputs, overrides?) · effectiveEstimatorValues(inputs, values)", props: [
      { name: "returns", type: "EstimatorValues", description: "Initial values, and the values the formula sees (hidden add-ons dropped). Use them to run the formula on the server or in tests." },
    ] },
  ],
  notes: [
    "The figure is announced once per change through a polite live region (\"Total: $8,200\"); line items stay in a description list.",
    "Inputs are kit controls — RadioGroup, Checkbox cards, Slider, Switch, NumberInput, NativeSelect — so keyboard behaviour and labels come with them.",
    "Keep the formula the single source of prices: use the same function for the \"from\" prices on the page and on the server that confirms the quote.",
  ],
  covers: [],
};

export default entry;
