import { ex, type DocEntry } from "../types";
import Demo from "../examples/faq/demo";
import Stacked from "../examples/faq/stacked";
import Columns from "../examples/faq/columns";

const entry: DocEntry = {
  slug: "faq",
  title: "FAQ",
  group: "Site blocks",
  description:
    "Questions and answers — parking, cancellation, payment — and long-tail search content. Zero JS: native <details name> makes an exclusive accordion, ::details-content animates the height where supported, and closed answers stay findable with in-page search. The renderer emits FAQPage JSON-LD.",
  source: ["blocks/site/faq.tsx", "blocks/site/registry-1.ts", "styles/blocks.css"],
  basedOn: "Native details / summary",
  usage: `import { Faq, faqJsonLd } from "@vamos-ui/react/blocks";

<Faq
  title="Before you *book*"
  items={[{ q: "Is there parking?", a: "Yes — the Piazza garage, level −2." }]}
  contact={{ link: { href: "https://wa.me/905321234567", label: "Message us", newTab: true }, style: "link" }}
/>`,
  demo: ex("demo", "Split (restaurant)", "faq/demo.tsx", Demo),
  examples: [
    ex("stacked", "Stacked, several open (SaaS billing)", "faq/stacked.tsx", Stacked, "Answers are RichDoc with links and lists; exclusive={false} drops the details name."),
    ex("columns", "Columns (clinic)", "faq/columns.tsx", Columns, "No accordion: a two-column definition list, every answer visible."),
  ],
  api: [
    {
      name: "Faq",
      props: [
        { name: "variant", type: '"split" | "stacked" | "columns"', default: '"split"', description: "Layout (see examples)." },
        { name: "items", type: "{ q: string; a: RichDoc | string; id? }[]", description: "1–30 questions. id defaults to faq-<slug of q> (Turkish-aware), so #faq-is-there-parking deep-links." },
        { name: "eyebrow / title / lead", type: "ReactNode", description: "Section header." },
        { name: "exclusive", type: "boolean", default: "true", description: "One answer open at a time (details name)." },
        { name: "openFirst", type: "boolean", default: "false", description: "Open the first answer." },
        { name: "contact", type: "SiteCta", description: "“Can’t find your question?” link under the title." },
        { name: "deepLink", type: "boolean", default: "true", description: "A 200-byte inline script that opens the item matching location.hash." },
        { name: "theme / anchor / id / className / labels / locale / components / editMode / headingLevel", type: "BlockBaseProps", description: "Questions are one heading level below the title." },
      ],
    },
    { name: "faqJsonLd(items)", props: [{ name: "returns", type: "object", description: "A FAQPage node with Question / Answer pairs (answers as plain text)." }] },
  ],
  covers: ["FAQ"],
};

export default entry;
