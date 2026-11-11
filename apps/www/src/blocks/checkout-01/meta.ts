import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "One-page checkout",
  description:
    "Checkout on one page: contact, delivery method with dates, Turkish address with province and district (or any country), card form with masked number, network, Luhn and expiry checks and instalments, bank transfer or pay at the door, billing same as delivery, company invoice with tax number, distance sales agreement, order summary, then a confirmation state. EN / TR, TRY.",
  category: "Commerce",
  order: 30,
  tags: ["site", "ops"],
  files: [
    "checkout-01/page.tsx",
    "checkout-01/components/checkout-page.tsx",
    "checkout-01/components/card-fields.tsx",
    "product-01/components/storefront.tsx",
    "product-01/components/cart-store.tsx",
    "product-01/components/catalogue.ts",
  ],
};

export default meta;
