"use client";

import { ThankYou } from "./components/thank-you";
import { StoreFrame } from "../product-01/components/storefront";

/**
 * Order confirmation: order number with copy and print, where the order is now (placed → paid →
 * packing → shipped → delivered), what happens next, an optional account from the guest
 * checkout, and the summary with delivery address, payment and VAT. EN / TR, TRY.
 */
export default function OrderConfirmation01() {
  return (
    <StoreFrame minimal>
      <ThankYou />
    </StoreFrame>
  );
}
