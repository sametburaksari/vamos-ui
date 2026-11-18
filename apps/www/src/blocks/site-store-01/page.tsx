import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { StoreProvider } from "./components/store-provider";
import { StoreSite } from "./components/store-site";

/**
 * Online store for a small ceramics studio, four pages: home (announcement, editorial hero with
 * one product, category tiles, "new this week" rail, maker story, reviews, newsletter), shop
 * (category / stock / sort filters, pagination), product detail and checkout. The kit cart
 * (@vamos-ui/react/commerce/cart, priced from `catalog` in content.ts), the cart drawer and the
 * selected product live in StoreProvider, above the EN / TR switch. Checkout posts to
 * /api/checkout (`npx vamos-ui site store`); point the endpoint's `successPath` and `failurePath`
 * (PayTR: `okPath` / `failPath`) at this page's checkout ("/?page=checkout") so a paid or failed
 * payment lands back here (see /docs/commerce#blocks).
 * Prices are TRY only: the catalog and the payment page are single-currency.
 * `demo` (the docs preview) gives the preview its own cart and skips the checkout request.
 * Signature: glaze swatches on every product card swap the photo to that glaze.
 */
export default function SiteStore01({ demo = false }: { demo?: boolean }) {
  return (
    <SiteShell accent="#B4532A" font="editorial" material="solid" density="comfortable" pages={["home", "shop", "product", "checkout"]} className="min-h-dvh bg-scene">
      <StoreProvider demo={demo}>
        <SiteShellLocale code="en">
          <StoreSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <StoreSite locale="tr" />
        </SiteShellLocale>
      </StoreProvider>
    </SiteShell>
  );
}
