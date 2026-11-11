import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { ACCENT } from "./components/content";
import { DigitalSite } from "./components/digital-site";
import { ShopProvider } from "./components/shop-provider";

/**
 * Digital products shop for website and dashboard templates, three pages: home (dotted-canvas
 * hero with a live template, the shelf of live thumbnails, what's inside, licences, FAQ), product
 * (live preview, licence picker, details, changelog) and checkout summary (lifetime updates,
 * discount code, tax by country, pay → download and licence key). Signature: the live preview —
 * the template's real components at a simulated device width, with page, device, colour mode,
 * accent and type pairing switches. Grotesk, emerald, glass, comfortable.
 */
export default function SiteDigital01() {
  return (
    <SiteShell accent={ACCENT} font="grotesk" material="glass" density="comfortable" pages={["home", "product", "checkout"]} className="min-h-dvh bg-scene">
      <ShopProvider>
        <SiteShellLocale code="en">
          <DigitalSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <DigitalSite locale="tr" />
        </SiteShellLocale>
      </ShopProvider>
    </SiteShell>
  );
}
