import type * as React from "react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { EstateProvider } from "./components/estate-provider";
import { EstateSite } from "./components/estate-site";

/** Corporate sans for the interface, the editorial serif for headings (tokens only). */
const serifHeadings = {
  "--font-heading": "var(--ff-instrument, Georgia)",
  "--display-weight": "400",
  "--display-tracking": "-0.01em",
  "--display-em": "italic",
  "--display-scale": "0.94",
  "--display-em-color": "inherit",
} as React.CSSProperties;

/**
 * Real-estate agency, three pages: home (photo hero with a glass search panel, stats, featured
 * listings, neighbourhood guides, mortgage calculator, agents, valuation form), listings
 * (filters, sort, list / split / map) and a listing (lightbox gallery, facts, map, calculator,
 * agent). Signature: in the split view, hovering a card lights its pin on the map and the other
 * way round.
 */
export default function SiteEstate01() {
  return (
    <SiteShell accent="#A16207" motion="subtle" font="corporate" material="glass" density="comfortable" pages={["home", "listings", "listing"]} className="min-h-dvh bg-scene" style={serifHeadings}>
      <EstateProvider>
        <SiteShellLocale code="en">
          <EstateSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <EstateSite locale="tr" />
        </SiteShellLocale>
      </EstateProvider>
    </SiteShell>
  );
}
