import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { AutoserviceSite } from "./components/autoservice-site";
import { JobProvider } from "./components/job-provider";

/**
 * Car service and hand wash, three pages: home (two-timestamp hero with a bay board, the job
 * builder, how a visit works, crew, reviews, map and hours, FAQ), prices & times (every job by
 * car size) and booking (job → drop-off day and slot → you and your car). Signature: the service
 * picker — workshop and wash lane on a live two-lane timeline with the ready-by time and price.
 * Dark, grotesk with mono numerals, safety yellow, solid, compact.
 */
export default function SiteAutoservice01() {
  return (
    <SiteShell accent="#FACC15" theme="dark" font="grotesk" material="solid" density="compact" pages={["home", "services", "booking"]} className="min-h-dvh bg-scene">
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
