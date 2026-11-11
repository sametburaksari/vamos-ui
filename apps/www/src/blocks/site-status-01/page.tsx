import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { StatusProvider } from "./components/status-provider";
import { StatusSite } from "./components/status-site";

/**
 * Status page for "Relay" (the webhooks API of site-devtool-01), three pages: current status
 * (overall banner, the active incident, scheduled maintenance, components with 90-day uptime
 * bars, API latency chart, recently resolved, subscribe), one incident (`?page=incident`) and
 * the 90-day history (`?page=history`). Signature: uptime bars with a tooltip per day — hover,
 * or tab in and walk the days with the arrow keys; a day with an incident opens it.
 * System font, neutral graphite accent, solid, compact; every status colour is a status token.
 */
export default function SiteStatus01() {
  return (
    <SiteShell accent="graphite" font="system" material="solid" density="compact" pages={["home", "incident", "history"]} className="min-h-dvh bg-scene">
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
