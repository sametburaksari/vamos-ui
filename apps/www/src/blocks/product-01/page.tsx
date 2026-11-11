"use client";

import { ProductDetail } from "./components/product-detail";
import { StoreFrame } from "./components/storefront";

/**
 * Product detail for a homeware shop: gallery with thumbnails, hover magnifier and full-screen
 * zoom; glaze and size pickers that show stock per variant; quantity; sale price with the VAT it
 * contains; add to cart with a toast that opens the mini-cart; a delivery estimate from today's
 * dispatch cut-off; details / size guide / reviews tabs and a "goes with" rail. EN / TR, TRY.
 */
export default function Product01() {
  return (
    <StoreFrame>
      <ProductDetail />
    </StoreFrame>
  );
}
