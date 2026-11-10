import { ex, type DocEntry } from "../types";
import Demo from "../examples/comparison-table/demo";
import Versus from "../examples/comparison-table/versus";
import Mobile from "../examples/comparison-table/mobile";

const entry: DocEntry = {
  slug: "comparison-table",
  title: "Comparison table",
  group: "Site blocks",
  description:
    "A plan × feature detail table, or a two-column “us vs. them”. A real <table> with a caption, scoped row and column headers, grouped rows with inset band headings and hidden Yes/No text behind every icon. The header row sticks; the highlighted plan gets a faint accent band. On narrow containers a radio plan picker shows one column at a time — CSS only.",
  source: ["blocks/site/comparison-table.tsx", "blocks/site/registry-2.ts", "styles/blocks.css"],
  basedOn: "Native table + radios + :has()",
  usage: `import { ComparisonTable } from "@vamos-ui/react/blocks";

<ComparisonTable
  title="Every plan, *line by line*"
  columns={[{ name: "Solo" }, { name: "Studio", highlight: true }, { name: "Group" }]}
  groups={[{ title: "Booking", rows: [
    { feature: "Calendars", values: ["1", "Up to 8", "Unlimited"] },
    { feature: "Deposits", hint: "Card payments through iyzico.", values: [false, true, true] },
  ] }]}
/>`,
  demo: ex("demo", "Plans × features (SaaS)", "comparison-table/demo.tsx", Demo),
  examples: [
    ex("versus", "Versus (agency vs. template)", "comparison-table/versus.tsx", Versus, "Two columns everywhere, the end column muted. Extra columns are ignored."),
    ex("mobile", "Phone width: plan picker", "comparison-table/mobile.tsx", Mobile, "Below 42rem container width a fieldset of radios picks the visible plan (highlighted plan preselected); arrow keys switch plans."),
  ],
  api: [
    {
      name: "ComparisonTable",
      props: [
        { name: "variant", type: '"table" | "versus"', default: '"table"', description: "table: 2–5 plans with picker; versus: two columns." },
        { name: "columns", type: "{ name; note?; cta?; highlight? }[]", description: "2–5 column headers; more are dropped (dev warning)." },
        { name: "groups", type: "{ title?; rows: { feature; hint?; values: (boolean | string | null)[] }[] }[]", description: "true → check + “Yes”, false → dash + “No”, null → “—”, string → the value." },
        { name: "caption", type: "string", description: "Table caption for screen readers. Default: the title." },
        { name: "eyebrow / title / lead", type: "ReactNode", description: "Section header." },
        { name: "labels / locale", type: "Partial<Site2Labels> / string", description: "Yes, No, Feature, Show plan…" },
        { name: "theme / anchor / id / className / headingLevel / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
  ],
  covers: ["Comparison table"],
};

export default entry;
