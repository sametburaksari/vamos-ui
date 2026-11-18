import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Cart and mini-cart",
  description:
    "Shopping cart page and mini-cart drawer on the kit cart: line items with a quantity stepper and remove with inline undo, free-delivery progress, standard delivery with dates, order summary priced from the catalog with VAT and shipping, a notice for saved items no longer sold, empty state and recommended items. Saved in localStorage and shared with the product and checkout pages. Discount codes, express delivery and pick-up are not in the checkout core yet. EN / TR, TRY.",
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
