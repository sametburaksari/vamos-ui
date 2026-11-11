import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Order confirmation",
  description:
    "Thank-you page after checkout: order number with copy and print, a progress timeline from placed to delivered with the expected date, next steps (tracking SMS, checking the parcel, returns), create an account from the guest order, and the order summary with address, instalments and VAT. EN / TR, TRY.",
  category: "Commerce",
  order: 40,
  tags: ["site", "ops"],
  files: [
    "order-confirmation-01/page.tsx",
    "order-confirmation-01/components/thank-you.tsx",
    "product-01/components/storefront.tsx",
    "product-01/components/cart-store.tsx",
    "product-01/components/catalogue.ts",
  ],
};

export default meta;
