"use client";

import { CartPage } from "./components/cart-page";
import { StoreFrame } from "../product-01/components/storefront";

/**
 * Cart page plus the header's mini-cart drawer: line items with a quantity stepper and remove
 * with an inline undo, a discount code (try KILN10 or WELCOME150), the free-delivery meter,
 * delivery choice with dates, an order summary with the VAT it contains, an empty state and
 * recommended items. EN / TR, TRY.
 */
export default function Cart01() {
  return (
    <StoreFrame>
      <CartPage />
    </StoreFrame>
  );
}
