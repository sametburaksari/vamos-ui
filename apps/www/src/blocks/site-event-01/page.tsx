import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { EventSite } from "./components/event-site";

/**
 * Conference site, three pages: home (date-and-venue hero with a geometric poster and a live
 * countdown, shape-masked speakers, programme at a glance, venue map, sponsors, early-bird CTA,
 * FAQ), schedule (day tabs, track filter and "Add to my agenda" with clash warnings, saved in
 * this browser) and tickets (tiers, what's included, code of conduct, FAQ). Grotesk type,
 * solid surfaces, compact density, a signal-orange accent. EN / TR.
 */
export default function SiteEvent01() {
  return (
    <SiteShell accent="#F97316" font="grotesk" material="solid" density="compact" pages={["home", "schedule", "tickets"]} className="min-h-dvh bg-scene">
      <SiteShellLocale code="en">
        <EventSite locale="en" />
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <EventSite locale="tr" />
      </SiteShellLocale>
    </SiteShell>
  );
}
