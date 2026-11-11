import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { AreaProvider } from "./components/area-provider";
import { ACCENT } from "./components/content";
import { PhysioSite } from "./components/physio-site";

/** Lab grotesk: Bricolage Grotesque (extra-bold, tight, set in capitals) over Hanken Grotesk, JetBrains Mono for data. */
const labType = createFontPairing({ id: "motion-lab", label: "Motion Lab", heading: "Bricolage Grotesque", body: "Hanken Grotesk", mono: "JetBrains Mono", display: { weight: 800, tracking: "-0.04em", em: "normal", scale: 0.82 } });

/**
 * Physiotherapy clinic, three pages: home (dark lab hero with the body map, numbers, first visit,
 * the gym, physios, FAQ, map), treatments (`?page=treatments`: filtered by area, packs, FAQ) and
 * booking (`?page=booking`: a six-day slot grid).
 * Signature: the body-area selector — a mannequin with front/back views and hotspots, plus
 * keyboard-friendly area chips; the chosen area swaps the common reasons, typical visit range and
 * treatments with time and price, filters the treatments page and pre-fills booking.
 */
export default function SitePhysio01() {
  return (
    <SiteShell accent={ACCENT} material="glass" density="compact" pages={["home", "treatments", "booking"]} className="min-h-dvh bg-scene">
      <FontProvider pairing={labType}>
        <AreaProvider>
          <SiteShellLocale code="en">
            <PhysioSite locale="en" />
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <PhysioSite locale="tr" />
          </SiteShellLocale>
        </AreaProvider>
      </FontProvider>
    </SiteShell>
  );
}
