---
"@vamos-ui/react": minor
---

New `@vamos-ui/react/commerce`: a working store checkout without a store platform. `priceCart` prices a cart from one catalog (VAT-inclusive minor units, variants, shipping with a free threshold, VAT by rate); `createCheckout` gives Web-standard `start` / `callback` handlers that price on the server, start an iyzico Checkout Form, keep the order in a signed HttpOnly cookie instead of a database, check iyzico's signed result against it and run `notify` once per paid order; `resendNotifier` emails the business and a receipt to the buyer, `webhookNotifier` posts each paid order as signed JSON. `@vamos-ui/react/commerce/cart` adds `CartProvider` / `useCart` (localStorage, synced across tabs, `checkout({ buyer })`).
