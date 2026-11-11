import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Cart and mini-cart",
  description:
    "Shopping cart page and mini-cart drawer: line items with a quantity stepper and remove with inline undo, discount codes with errors, free-delivery progress, delivery choice with dates, order summary with VAT and shipping, empty state and recommended items. EN / TR, TRY.",
  category: "Commerce",
  order: 20,
  tags: ["site", "ops"],
  files: [
    "cart-01/page.tsx",
    "cart-01/components/cart-page.tsx",
    "product-01/components/storefront.tsx",
    "product-01/components/cart-store.tsx",
    "product-01/components/catalogue.ts",
  ],
};

export default meta;
