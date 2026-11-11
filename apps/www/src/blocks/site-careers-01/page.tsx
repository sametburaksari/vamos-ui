import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { CareersProvider } from "./components/careers-provider";
import { CareersSite } from "./components/careers-site";
import { careersMotion } from "./components/motion";

/** A Scandinavian grotesk for headlines over a sturdy news grotesk; Plex Mono for refs and bands. */
const northpointType = createFontPairing({ id: "northpoint", label: "Northpoint", heading: "Familjen Grotesk", body: "Schibsted Grotesk", mono: "IBM Plex Mono", display: { weight: 600, em: "normal" } });

/**
 * Careers site for Northpoint, three pages: home (team compass hero — hover a team to swing the
 * needle, choose it to open the board filtered —, principles, open numbers, benefits, hiring
 * process, voices, newest roles, FAQ), open roles (`?page=jobs`: search, team, place and contract
 * filters with a live count) and one job post with the apply form (`?page=job`).
 * SiteShell owns Northpoint's lime brand accent, solid material, EN / TR and the pages.
 *
 * Motion (subtle — calm, precise, nothing showy for people deciding on a job): the hero rises in
 * order, the compass needle sweeps in and settles on north, principles and voices stagger in,
 * the open numbers count up, filtered roles rise into the board, buttons press.
 */
export default function SiteCareers01() {
  return (
    <SiteShell accent="lime" material="solid" density="comfortable" motion="subtle" pages={["home", "jobs", "job"]} className="min-h-dvh bg-scene">
      <style>{careersMotion}</style>
      <FontProvider pairing={northpointType}>
        <CareersProvider>
          <SiteShellLocale code="en">
            <CareersSite locale="en" />
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <CareersSite locale="tr" />
          </SiteShellLocale>
        </CareersProvider>
      </FontProvider>
    </SiteShell>
  );
}
