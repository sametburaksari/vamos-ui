import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { ACCENT } from "./components/content";
import { EstateProvider } from "./components/estate-provider";
import { EstateSite } from "./components/estate-site";

/** High-contrast Bodoni Moda for names and statements, light geometric Urbanist for the rest. */
const courtType = createFontPairing({ id: "vellacourt", label: "Vellacourt", heading: "Bodoni Moda", body: "Urbanist", mono: "IBM Plex Mono", display: { weight: 400, tracking: "-0.02em", em: "italic", scale: 0.92 } });

/**
 * Luxury residences, three pages: home (a full-bleed film of residences with slow crossfades and
 * drift, the office in one paragraph, three houses as full-bleed photographs, the off-market
 * register, ledger stats, one client's words, a private-conversation form), collection
 * (`?page=collection`: filter by setting, sort, alternating rows) and residence
 * (`?page=residence&house=macka`: full-bleed hero, key facts, story, floor plan, gallery with
 * lightbox, private-viewing request). Signature: walk the plan — rooms on the floor plan drive
 * a slow crossfading photograph of that room, by pointer, focus or arrow keys.
 */
export default function SiteEstate02() {
  return (
    <SiteShell accent={ACCENT} material="glass" density="spacious" pages={["home", "collection", "residence"]} className="min-h-dvh bg-scene">
      <FontProvider pairing={courtType}>
        <EstateProvider>
          <SiteShellLocale code="en">
            <EstateSite locale="en" />
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <EstateSite locale="tr" />
          </SiteShellLocale>
        </EstateProvider>
      </FontProvider>
    </SiteShell>
  );
}
