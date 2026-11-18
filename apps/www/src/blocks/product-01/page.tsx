"use client";

import { ProductDetail } from "./components/product-detail";
import { StoreFrame } from "./components/storefront";

/**
 * Product detail for a homeware shop: gallery with thumbnails, hover magnifier and full-screen
 * zoom; glaze and size pickers that show stock per variant (each glaze + size is a catalog
 * variant); quantity; sale price with the VAT it contains; add to the kit cart with a toast that
 * opens the mini-cart; a delivery estimate from today's dispatch cut-off; details / size guide /
 * reviews tabs and a "goes with" rail. `demo` (the docs preview) gives the preview its own cart
 * that starts with three items. EN / TR, TRY.
 */
export default function Product01({ demo = false }: { demo?: boolean }) {
  return (
    <StoreFrame demo={demo ? "product-01" : undefined}>
      <ProductDetail />
    </StoreFrame>
  );
}
