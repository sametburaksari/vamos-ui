import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { AutoserviceSite } from "./components/autoservice-site";
import { JobProvider } from "./components/job-provider";
import { garageMotion } from "./components/motion";

/**
 * Car service and hand wash, three pages: home (two-timestamp hero with a bay board, the job
 * builder, how a visit works, crew, reviews, map and hours, FAQ), prices & times (every job by
 * car size) and booking (job → drop-off day and slot → you and your car). Signature: the service
 * picker — workshop and wash lane on a live two-lane timeline with the ready-by time and price.
 * Dark, grotesk with mono numerals, safety yellow, solid, compact.
 *
 * Motion (subtle, and compact makes it quicker still — a workshop, not a show): the hero rises in
 * line by line, the bay board flips its rows down like a departures board, the hazard stripe
 * rolls in, the proof figures count up, sections rise as they arrive and the ready-by time ticks
 * over on every change. Buttons press; the board's live dot is the only loop.
 */
export default function SiteAutoservice01() {
  return (
    <SiteShell accent="#FACC15" theme="dark" font="grotesk" material="solid" density="compact" motion="subtle" pages={["home", "services", "booking"]} className="min-h-dvh bg-scene">
      <style>{garageMotion}</style>
      <JobProvider>
        <SiteShellLocale code="en">
          <AutoserviceSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <AutoserviceSite locale="tr" />
        </SiteShellLocale>
      </JobProvider>
    </SiteShell>
  );
}
