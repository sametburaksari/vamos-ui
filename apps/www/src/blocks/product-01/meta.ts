import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Product detail",
  description:
    "Storefront product page: gallery with thumbnails, hover magnifier and full-screen zoom; glaze and size pickers with stock per variant; quantity; sale price with VAT; add to cart with a toast and mini-cart drawer; delivery estimate from the dispatch cut-off; details, size guide and reviews tabs; related products. EN / TR, TRY.",
  category: "Commerce",
  order: 10,
  tags: ["site", "ops"],
  files: [
    "product-01/page.tsx",
    "product-01/components/product-detail.tsx",
    "product-01/components/product-gallery.tsx",
    "product-01/components/storefront.tsx",
    "product-01/components/cart-store.tsx",
    "product-01/components/catalogue.ts",
  ],
};

export default meta;
