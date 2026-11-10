import { ex, type DocEntry } from "../types";
import Demo from "../examples/pricing-table/demo";
import RowsAgency from "../examples/pricing-table/rows-agency";
import Single from "../examples/pricing-table/single";
import QuoteOnly from "../examples/pricing-table/quote-only";

const entry: DocEntry = {
  slug: "pricing-table",
  title: "Pricing table",
  group: "Site blocks",
  description:
    "Plan pricing for SaaS subscriptions, agency packages and retainers. Plans are separated by hairline rules, not cards; the highlighted plan gets a 2px accent rule and a label (no glow, no scale). The monthly/yearly switch is a fieldset of hidden radios read by :has() — zero JavaScript. Money goes through Intl per locale and currency, and a tax note is required.",
  source: ["blocks/site/pricing-table.tsx", "blocks/site/registry-2.ts", "styles/blocks.css"],
  basedOn: "Native radios + :has()",
  usage: `import { PricingTable } from "@vamos-cms/ui/blocks";

<PricingTable
  title="One booking page, three *sizes*"
  billing="both"
  yearlySaving="2 months free"
  taxNote="Prices exclude 20% VAT"
  plans={[
    { name: "Solo", price: { monthly: { amount: "29", currency: "USD" }, yearly: { amount: "290", currency: "USD" } },
      features: [{ text: "1 calendar" }, { text: "Deposits", included: false }],
      cta: { link: { href: "/signup?plan=solo", label: "Start with Solo" }, style: "secondary" } },
    { name: "Studio", highlight: "Most chosen", … },
  ]}
/>`,
  demo: ex("demo", "Columns with monthly / yearly (SaaS)", "pricing-table/demo.tsx", Demo),
  examples: [
    ex("rows-agency", "Rows (agency packages, Turkish)", "pricing-table/rows-agency.tsx", RowsAgency, "Each package reads like a line on a quote: name and description, a comma list of inclusions, price and action. ₺ formatting and the “/ay” suffix come from Intl and site2LabelsTr."),
    ex("single", "Single package (ad retainer)", "pricing-table/single.tsx", Single, "One plan: large price and action on the start side, a two-column inclusion list, and a “Not included” line."),
    ex("quote-only", "Quote-only plans", "pricing-table/quote-only.tsx", QuoteOnly, "No price: `custom` text (“From $4,500”, “Get a quote”) takes its place."),
  ],
  api: [
    {
      name: "PricingTable",
      props: [
        { name: "variant", type: '"columns" | "rows" | "single"', default: '"columns"', description: "Layout. A single plan always renders as single." },
        { name: "plans", type: "PricingPlan[]", description: "1–4 plans (see below)." },
        { name: "billing", type: '"monthly" | "yearly" | "both" | "once"', default: '"monthly"', description: "Which prices exist. both adds the period switch; once shows one-off prices." },
        { name: "defaultPeriod", type: '"monthly" | "yearly"', default: '"monthly"', description: "Selected period with billing=both." },
        { name: "yearlySaving", type: "ReactNode", description: "Next to “Yearly”: “2 months free” (text, never a strikethrough)." },
        { name: "taxNote", type: "ReactNode", description: "Required by the house rules: “Prices exclude 20% VAT”." },
        { name: "footnote", type: "ReactNode | RichDoc", description: "Terms under the table." },
        { name: "eyebrow / title / lead", type: "ReactNode", description: "Section header; title supports one *emphasis*." },
        { name: "labels", type: "Partial<Site2Labels>", description: "Built-in strings (Monthly, /mo, Not included…). site2LabelsTr for Turkish." },
        { name: "locale", type: "string", default: '"en-US"', description: "Intl locale for money." },
        { name: "theme / anchor / id / className / headingLevel / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
    {
      name: "PricingPlan",
      props: [
        { name: "name / description", type: "ReactNode", description: "Plan name (h3) and one line." },
        { name: "price", type: "{ monthly?: Money; yearly?: Money; once?: Money; from?: boolean }", description: "Money is { amount: decimal string, currency: ISO 4217 }. from prefixes “from”." },
        { name: "custom", type: "ReactNode", description: "Shown instead of a price." },
        { name: "features", type: "{ text; included?; note? }[]", description: "Up to 14. Excluded features are muted with a dash and read “Not included”." },
        { name: "cta", type: "{ link: { href, label, newTab? }; style? }", description: "One primary per block: the highlighted plan keeps it, other primaries become secondary." },
        { name: "highlight", type: "ReactNode", description: "Label text for the recommended plan." },
      ],
    },
  ],
  notes: ["The schema (`pricingBlock` in blocks/site/registry-2.ts) emits an OfferCatalog with a UnitPriceSpecification per period."],
  covers: ["Pricing table"],
};

export default entry;
