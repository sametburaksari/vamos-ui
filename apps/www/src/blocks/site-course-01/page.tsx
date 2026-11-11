import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { ACCENT } from "./components/content";
import { CourseSite } from "./components/course-site";

/** Optical-size serif headlines, a precise sans and a typewriter mono for the data bits. */
const atlasType = createFontPairing({ id: "atlas", label: "Atlas", heading: "Newsreader", body: "Instrument Sans", mono: "Space Mono", display: { weight: 500, em: "italic" } });

/**
 * Online course site, three pages: home (ink hero with a live query cell, who it is for, the
 * lesson map, student capstones, instructor, cohort dates, pricing, FAQ), the curriculum
 * (`?page=curriculum`: full lesson map + every module) and instructor & enrol
 * (`?page=enrol`: mentors, steps and a validated enrol form).
 * Signature: the curriculum as a progress-style map — pick a weekly pace, drag through the weeks.
 * SiteShell owns the mustard accent, solid material, compact density, EN / TR and the pages.
 */
export default function SiteCourse01() {
  return (
    <SiteShell accent={ACCENT} material="solid" density="compact" pages={["home", "curriculum", "enrol"]} className="min-h-dvh bg-scene">
      <FontProvider pairing={atlasType}>
        <SiteShellLocale code="en">
          <CourseSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <CourseSite locale="tr" />
        </SiteShellLocale>
      </FontProvider>
    </SiteShell>
  );
}
