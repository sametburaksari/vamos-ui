import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { StoreProvider } from "./components/store-provider";
import { StoreSite } from "./components/store-site";

/**
 * Online store for a small ceramics studio, four pages: home (announcement, editorial hero with
 * one product, category tiles, "new this week" rail, maker story, reviews, newsletter), shop
 * (category / stock / sort / currency filters, pagination), product detail and checkout. The
 * cart drawer, currency and selected product live in StoreProvider, above the EN / TR switch.
 * Signature: glaze swatches on every product card swap the photo to that glaze.
 */
export default function SiteStore01() {
  return (
    <SiteShell accent="#B4532A" font="editorial" material="solid" density="comfortable" pages={["home", "shop", "product", "checkout"]} className="min-h-dvh bg-scene">
      <StoreProvider>
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
