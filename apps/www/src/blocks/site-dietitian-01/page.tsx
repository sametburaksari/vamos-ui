import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { ACCENT } from "./components/content";
import { DietitianSite } from "./components/dietitian-site";
import { PlanProvider } from "./components/plan-provider";

/** Corporate and clear: Plus Jakarta Sans (bold, tight) for headings over IBM Plex Sans. */
const greenplateType = createFontPairing({ id: "greenplate", label: "Greenplate", heading: "Plus Jakarta Sans", body: "IBM Plex Sans", mono: "IBM Plex Mono", display: { weight: 700, tracking: "-0.035em", em: "normal", scale: 0.86 } });

/**
 * Dietitian practice, three pages: home (plate-ring hero, programme picker, how it works,
 * plans from your shopping, dietitians, clients, FAQ, map), programmes (`?page=programmes`:
 * the picker, all seven programmes, comparison and single sessions) and booking (`?page=booking`).
 * Signature: the goal-based programme picker — goal, support level and clinic/online give one
 * recommendation with its length, visits, total and weekly price and a week strip of when the
 * visits fall; it survives page and language changes and pre-fills the booking form.
 */
export default function SiteDietitian01() {
  return (
    <SiteShell accent={ACCENT} motion="subtle" material="glass" density="comfortable" pages={["home", "programmes", "booking"]} className="min-h-dvh bg-scene">
      <FontProvider pairing={greenplateType}>
        <PlanProvider>
          <SiteShellLocale code="en">
            <DietitianSite locale="en" />
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <DietitianSite locale="tr" />
          </SiteShellLocale>
        </PlanProvider>
      </FontProvider>
    </SiteShell>
  );
}
