"use client";

import { ThankYou } from "./components/thank-you";
import { StoreFrame } from "../product-01/components/storefront";

/**
 * Order confirmation: order number with copy and print, where the order is now (placed → paid →
 * packing → shipped → delivered), what happens next, an optional account from the guest
 * checkout, and the summary with delivery address, payment and VAT. The checkout endpoint sends
 * the buyer here with `?order=<id>`: the page empties the kit cart and shows the summary the
 * checkout page kept in this tab (or just the order number on another device); `?payment=failed`
 * shows a way back to checkout. `demo` (the docs preview) shows a sample order. EN / TR, TRY.
 */
export default function OrderConfirmation01({ demo = false }: { demo?: boolean }) {
  return (
    <StoreFrame minimal demo={demo ? "order-confirmation-01" : undefined}>
      <ThankYou demo={demo} />
    </StoreFrame>
  );
}
