---
"@vamos-ui/react": minor
"vamos-ui": patch
"@vamos-ui/mcp": patch
---

New pricing and giving components, generic and documented, with English, Turkish, German, French, Spanish and Arabic labels:

- `Estimator`: a live calculator. Declarative inputs (number, slider, select, toggle, option cards, add-on checkboxes) feed a pure formula; the summary panel shows the total or a range, line items, facts, notes and a CTA that hands the selection on (callback, link or hidden form field). Sticky on wide containers, a bottom bar on narrow ones.
- `ChoiceGrid`: a two-axis option grid (size × frequency) as one radio group, arrow keys in both axes, a price per cell, unavailable cells and form posting.
- `TierPricing`: quantity breaks as a table or a ladder, with the active tier, unit price, total and the next break ("8 more for $45.00 per case"). `tierQuote()` gives the same numbers for order lines.
- `AmountPicker`: preset amounts with an impact line, an own amount with bounds and a one-off / monthly switch.
- `GoalMeter`: raised against a goal with backers and days left, or stock left of a run. Built on `Progress`.
- The site recipes (professional firm, home services, software product, developer tool, portfolio studio, subscription box, B2B supplier, nonprofit, online store, mobile app, agency, venue, real estate) now name these components where they describe calculators, price grids, quantity tiers, donations and meters.
