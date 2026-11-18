import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "One-page checkout",
  description:
    "One-page checkout that takes payment: contact, standard delivery with dates, Turkish address with province and district, individual or company invoice with tax number, distance sales agreement and pre-information consent, order summary priced from the catalog with the discount code field and discount line. Place order calls the kit cart's checkout() (POST /api/checkout from `vamos-ui site store`) and the buyer enters the card on the payment provider's page; refused fields, cart changes and outages show inline, and ?payment=failed explains a failed payment. The docs preview passes `demo` and simulates the order. EN / TR, TRY.",
  category: "Commerce",
  order: 30,
  tags: ["site", "ops"],
  files: [
    "checkout-01/page.tsx",
    "checkout-01/components/checkout-page.tsx",
    "product-01/components/storefront.tsx",
    "product-01/components/cart-store.tsx",
    "product-01/components/catalogue.ts",
  ],
};

export default meta;
