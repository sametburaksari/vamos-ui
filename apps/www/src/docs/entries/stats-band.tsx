import { ex, type DocEntry } from "../types";
import Demo from "../examples/stats-band/demo";
import WithText from "../examples/stats-band/with-text";
import Ledger from "../examples/stats-band/ledger";
import Tr from "../examples/stats-band/locale-tr";

const entry: DocEntry = {
  slug: "stats-band",
  title: "Stats band",
  group: "Site blocks",
  description:
    "Concrete, sourced numbers — “4.8 on Google · 1,240 reviews”, “340 projects in 12 years”. A semantic dl; numbers go through Intl for the locale, units are superscripts that screen readers hear spelled out, and there is no count-up animation. The schema warns when a figure has no source.",
  source: ["blocks/site/stats-band.tsx", "blocks/site/registry-1.ts", "styles/blocks.css"],
  usage: `import { StatsBand } from "@vamos-ui/react/blocks";

<StatsBand
  items={[
    { value: 4.8, label: "Google rating", source: "1,240 reviews, Nov 2026" },
    { value: 63, unit: "%", label: "Of tables booked on WhatsApp", source: "Oct 2026" },
  ]}
/>`,
  demo: ex("demo", "Inline (restaurant)", "stats-band/demo.tsx", Demo),
  examples: [
    ex("with-text", "With text (agency)", "stats-band/with-text.tsx", WithText, "A paragraph on the start side, a 2×2 grid of figures on the end side."),
    ex("ledger", "Ledger (clinic annual report)", "stats-band/ledger.tsx", Ledger, "Label, dotted leader, figure, and a mono source line under each row."),
    ex("locale-tr", "Turkish formatting", "stats-band/locale-tr.tsx", Tr, "locale=\"tr-TR\": 4,8 and 1.240; “yüzde” for screen readers with site1LabelsTr."),
  ],
  api: [
    {
      name: "StatsBand",
      props: [
        { name: "variant", type: '"inline" | "with-text" | "ledger"', default: '"inline"', description: "Layout (see examples)." },
        { name: "items", type: "StatItem[]", description: "{ value: number | string, unit?, unitLabel?, label, source? } — 2–5 figures. Numbers keep their decimals and get locale separators; strings are verbatim." },
        { name: "eyebrow / title / lead", type: "ReactNode", description: "Optional header." },
        { name: "body", type: "RichDoc | string", description: "with-text: the paragraph(s) beside the figures." },
        { name: "locale", type: "string", default: '"en-US"', description: "Intl locale for the figures." },
        { name: "labels", type: "Partial<Site1Labels>", description: "percent, source." },
        { name: "theme / anchor / id / className / components / editMode / headingLevel", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
  ],
  notes: ["Lint (registry): stat-missing-source for unsourced figures, stat-round-number for “500+” style values."],
  covers: ["Stats band"],
};

export default entry;
