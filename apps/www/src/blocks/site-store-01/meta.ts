import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Online store website",
  description:
    "Small-batch ceramics shop on the kit cart: editorial hero with one product, category tiles, new-this-week rail, maker story, reviews and newsletter; a filtered shop with pagination, product detail, cart drawer and a checkout with a discount code that posts to /api/checkout. The site has no confirmation route: set successPath and failurePath (PayTR: okPath and failPath) to /?page=checkout so the payment page returns here with ?order= (thank-you, cart cleared) or ?payment=failed (cart kept). Glaze swatches on each card swap the photo. EN / TR; prices in TRY only, because the catalog and the payment page are single-currency. The docs preview passes `demo` and skips the checkout request.",
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
