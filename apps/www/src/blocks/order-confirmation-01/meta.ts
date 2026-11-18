import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Order confirmation",
  description:
    "Thank-you page after payment: reads ?order= (empties the kit cart and shows the summary the checkout kept in this tab, or just the order number on another device) and ?payment=failed (a way back to checkout); order number with copy and print, a progress timeline from placed to delivered with the expected date, next steps, create an account from the guest order, and the order summary with address and VAT. The docs preview passes `demo` for a sample order. EN / TR, TRY.",
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
