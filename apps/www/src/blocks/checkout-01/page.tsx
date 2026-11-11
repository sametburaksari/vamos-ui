"use client";

import { CheckoutPage } from "./components/checkout-page";
import { StoreFrame } from "../product-01/components/storefront";

/**
 * One-page checkout: contact (email + mobile), delivery method with dates, Turkish addresses
 * with province / district pickers or any other country, card payment with a masked number,
 * network detection, Luhn / expiry checks and instalments — or bank transfer, or pay at the door
 * — billing same as delivery or separate, individual or company invoice (VKN), the distance sales
 * agreement and an order summary. Place order validates, focuses the first problem, then shows
 * the confirmation. EN / TR, TRY.
 */
export default function Checkout01() {
  return (
    <StoreFrame minimal>
      <CheckoutPage />
    </StoreFrame>
  );
}
