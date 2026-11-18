"use client";

import { CheckoutPage } from "./components/checkout-page";
import { StoreFrame } from "../product-01/components/storefront";

/**
 * One-page checkout on the kit cart: contact (email + mobile), standard delivery with dates, a
 * Turkish address with province / district pickers, individual or company invoice (VKN), the
 * distance sales agreement and an order summary priced from the catalog. Place order validates
 * and focuses the first problem, then `useCart().checkout()` posts to /api/checkout (see
 * `npx vamos-ui site store`) and the buyer enters the card on the payment provider's page.
 * Refused fields and other errors show inline; `?payment=failed` shows why the buyer is back.
 * `demo` (used by the docs preview, which has no endpoint) simulates the order instead. EN / TR, TRY.
 */
export default function Checkout01({ demo = false }: { demo?: boolean }) {
  return (
    <StoreFrame minimal demo={demo ? "checkout-01" : undefined}>
      <CheckoutPage demo={demo} />
    </StoreFrame>
  );
}
