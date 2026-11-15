import { ex, type DocEntry } from "../types";
import TierPricingDemo from "../examples/tier-pricing/demo";
import TierPricingLadder from "../examples/tier-pricing/ladder";

const entry: DocEntry = {
  slug: "tier-pricing",
  title: "Tier pricing",
  group: "Data display",
  description:
    "Quantity breaks: a unit price that drops at set quantities, the tier the current quantity falls in highlighted, the unit price and total, and how many more units reach the next price. A table with range, unit price and saving, or a ladder of descending steps; tiers can set the quantity.",
  source: ["components/tier-pricing.tsx"],
  usage: `import { TierPricing } from "@vamos-ui/react";

<TierPricing
  unit="case"
  tiers={[{ min: 1, price: 52 }, { min: 10, price: 48, label: "Trade" }, { min: 60, price: 41.5, label: "Pallet" }]}
  quantity={cases}
  onQuantityChange={setCases}
  quantityInput
/>`,
  demo: ex("demo", "Table with a quantity field", "tier-pricing/demo.tsx", TierPricingDemo),
  examples: [ex("ladder", "Ladder", "tier-pricing/ladder.tsx", TierPricingLadder, "variant=\"ladder\": descending steps; each step is a button that jumps to its minimum.")],
  api: [
    { name: "TierPricing", props: [
      { name: "tiers", type: "PriceTier[]", description: "{ min, price, label? }. Sorted by min; a tier runs to the next min − 1, the last is open-ended." },
      { name: "quantity / defaultQuantity / onQuantityChange", type: "number", description: "With onQuantityChange (or quantityInput) every tier sets the quantity to its minimum." },
      { name: "quantityInput / maxQuantity", type: "boolean / number", description: "A number field for the quantity." },
      { name: "variant", type: '"table" | "ladder"', default: '"table"', description: "Rows or descending steps." },
      { name: "unit", type: "string", default: 'label "unit"', description: "Unit word in the texts: case, box, seat." },
      { name: "formatPrice / currency", type: "(n) => string / string", description: "Default: provider currency, two fraction digits." },
      { name: "showSaving / showSummary", type: "boolean", default: "true", description: "Saving column (against the first tier) and the quantity × price, total and next-break line." },
      { name: "labels", type: "Partial<TierPricingLabels>", description: 'Dictionary namespace "tierPricing": caption, quantity, range, rangeOpen, unitPrice, saving, current, line, total, next, best, minimum, saved, setQuantity, unit.' },
    ] },
    { name: "tierQuote(tiers, quantity)", props: [
      { name: "returns", type: "TierQuote", description: "{ index, tier, next, more, unitPrice, total, saved } — for order lines, carts and server checks." },
    ] },
  ],
  notes: [
    "The active tier carries aria-current and a \"Your price\" tag in text, not only the highlight.",
    "The next-break hint is a polite live region, so changing the quantity announces \"8 more for $45.00 per case.\"",
  ],
  covers: [],
};

export default entry;
