import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Online store website",
  description:
    "Small-batch ceramics shop on the kit cart: editorial hero with one product, category tiles, new-this-week rail, maker story, reviews and newsletter; a filtered shop with pagination, product detail, cart drawer and a checkout that posts to /api/checkout and returns with ?order= or ?payment=failed. Glaze swatches on each card swap the photo. EN / TR; prices in TRY only, because the catalog and the payment page are single-currency. The docs preview passes `demo` and skips the checkout request.",
  category: "Website pages",
  order: 40,
  tags: ["site"],
  files: [
    "site-store-01/page.tsx",
    "site-store-01/components/store-site.tsx",
    "site-store-01/components/store-provider.tsx",
    "site-store-01/components/product-card.tsx",
    "site-store-01/components/home-parts.tsx",
    "site-store-01/components/shop-page.tsx",
    "site-store-01/components/product-page.tsx",
    "site-store-01/components/checkout-page.tsx",
    "site-store-01/components/content.ts",
  ],
};

export default meta;
