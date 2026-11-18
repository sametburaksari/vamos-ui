"use client";

import { CartPage } from "./components/cart-page";
import { StoreFrame } from "../product-01/components/storefront";

/**
 * Cart page plus the header's mini-cart drawer on the kit cart (@vamos-ui/react/commerce/cart):
 * line items with a quantity stepper and remove with an inline undo, a discount code (try KILN10,
 * WELCOME150, LINEN15 or the expired SUMMERKILN), the free-delivery meter,
 * standard delivery with dates, an order summary priced from the catalog with the VAT it
 * contains, a notice for saved items the catalog no longer sells, an empty state and recommended
 * items. The cart is saved in localStorage and shared with the product and checkout pages; `demo`
 * (the docs preview) gives it its own cart that starts with three items. EN / TR, TRY.
 */
export default function Cart01({ demo = false }: { demo?: boolean }) {
  return (
    <StoreFrame demo={demo ? "cart-01" : undefined}>
      <CartPage />
    </StoreFrame>
  );
}
