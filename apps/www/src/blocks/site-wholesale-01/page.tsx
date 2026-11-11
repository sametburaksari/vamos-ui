import type { CSSProperties } from "react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { ACCENT } from "./components/content";
import { QuoteProvider } from "./components/quote-provider";
import { WholesaleSite } from "./components/wholesale-site";

/** Square corners for the delivery-note look; headings stay on the grotesk display face. */
const squared = { "--radius": "3px" } as CSSProperties;

/**
 * B2B wholesale site for a packaging supplier, three pages: home (price-check hero, numbered
 * category index, tiers explained, warehouse, trade account steps, buyers, delivery zones, FAQ),
 * catalogue (search, aisle, stock and sort over product rows) and quote (editable lines, delivery,
 * totals with VAT, company form). Signature: bulk price tiers drawn as a staircase on every
 * product; the case count lights the tier and says how far the next break is.
 * Grotesk, cobalt, solid, compact.
 */
export default function SiteWholesale01() {
  return (
    <SiteShell accent={ACCENT} font="grotesk" material="solid" density="compact" pages={["home", "catalogue", "quote"]} className="min-h-dvh bg-scene" style={squared}>
      <QuoteProvider>
        <SiteShellLocale code="en">
          <WholesaleSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <WholesaleSite locale="tr" />
        </SiteShellLocale>
      </QuoteProvider>
    </SiteShell>
  );
}
