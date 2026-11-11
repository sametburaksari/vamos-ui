import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { StatusProvider } from "./components/status-provider";
import { statusMotion } from "./components/motion";
import { StatusSite } from "./components/status-site";

/**
 * Status page for "Relay" (the webhooks API of site-devtool-01), three pages: current status
 * (overall banner, the active incident, scheduled maintenance, components with 90-day uptime
 * bars, API latency chart, recently resolved, subscribe), one incident (`?page=incident`) and
 * the 90-day history (`?page=history`). Signature: uptime bars with a tooltip per day — hover,
 * or tab in and walk the days with the arrow keys; a day with an incident opens it.
 * System font, neutral graphite accent, solid, compact; every status colour is a status token.
 *
 * Motion (subtle and compact — information first): the banner settles in, each component's
 * uptime bars scan in from 90 days ago to today, the uptime figures tick up from 99%, component
 * groups and resolved incidents come in one after another, links and buttons press. The live dot
 * is the only loop.
 */
export default function SiteStatus01() {
  return (
    <SiteShell accent="graphite" font="system" material="solid" density="compact" motion="subtle" pages={["home", "incident", "history"]} className="min-h-dvh bg-scene">
      <style>{statusMotion}</style>
      <StatusProvider>
        <SiteShellLocale code="en">
          <StatusSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <StatusSite locale="tr" />
        </SiteShellLocale>
      </StatusProvider>
    </SiteShell>
  );
}
