import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { ACCENT } from "./components/content";
import { schoolMotion } from "./components/motion";
import { PreschoolSite } from "./components/preschool-site";
import { SchoolProvider } from "./components/school-provider";

/** Soft rounded display (Fredoka) over Lexend, a calm, very legible text face: playful, still corporate. */
const orchardType = createFontPairing({ id: "orchard", label: "Orchard", heading: "Fredoka", body: "Lexend", mono: "DM Mono", display: { weight: 600, tracking: "-0.02em", em: "normal", scale: 0.88 } });

/**
 * Preschool, three pages: home (photo-collage hero with the next open morning, the daily
 * rhythm, the three groups, how we work, teachers, a parent's words, fees, map, FAQ), programme
 * (`?page=programme`: groups, the full day, term dates, what to pack, fees) and enrol
 * (`?page=enrol`: child → days with a live monthly fee → open morning → parent).
 * Signature: the daily rhythm — a proportional timeline per age group with a live "now" marker
 * in Istanbul time, arrow-key navigation and a "Play the day" walk-through.
 *
 * Motion (full, springy but short): the hero steps in and its three photographs land like pinned
 * prints; figures count up; the daily rhythm's blocks grow up from the timeline (again on every
 * group switch); groups and fees pop in one by one; buttons press, cards lift.
 */
export default function SitePreschool01() {
  return (
    <SiteShell accent={ACCENT} material="glass" density="spacious" motion="full" pages={["home", "programme", "enrol"]} className="min-h-dvh bg-scene">
      <style>{schoolMotion}</style>
      <FontProvider pairing={orchardType}>
        <SchoolProvider>
          <SiteShellLocale code="en">
            <PreschoolSite locale="en" />
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <PreschoolSite locale="tr" />
          </SiteShellLocale>
        </SchoolProvider>
      </FontProvider>
    </SiteShell>
  );
}
