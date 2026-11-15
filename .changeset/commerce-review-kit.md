---
"@vamos-ui/react": minor
---

Commerce and review parts in `@vamos-ui/react/blocks`.

- **StarRating / StarRatingInput.** Read-only stars as one `role="img"` ("Rated 4.5 out of 5") with half or tenth fills, average and review count (optionally a link). The input is a native radio group in a fieldset: one tab stop, arrow keys, half steps with `allowHalf`, posts with the form; hover and checked fills are CSS.
- **ReviewScore.** Review summary box: score as points, percent or stars, criteria bars, pros and cons, verdict, reviewer and readers' rating, with schema.org `Review` JSON-LD (`reviewRating`, `positiveNotes` / `negativeNotes`, the item's `aggregateRating`). `reviewJsonLd` builds the node on its own.
- **ProductCard / ProductGrid.** Product tile with hover photo or one photo per colour swatch (native radios, CSS swap), sale price with the regular price struck through, price ranges, sale / new / sold-out badges, star rating, and slots for quick add and wishlist (no cart logic inside). ProductGrid lays them out in 2–5 responsive columns or as a list, with header, "Shop all", empty state and optional `ItemList` JSON-LD; `bare` renders only the list. `productJsonLd` builds a `Product` with `Offer` / `AggregateOffer` and `AggregateRating`.
- Strings in `commerceLabels` plus Turkish, German, French, Spanish and Arabic sets; styles in `styles/commerce.css`.
