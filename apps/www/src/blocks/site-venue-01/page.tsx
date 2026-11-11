import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { VenueProvider } from "./components/venue-provider";
import { VenueSite, venuePages } from "./components/venue-site";
import { VenueType } from "./components/venue-type";

/**
 * Event venue in a restored flour mill, three pages: home (a ledger hero over a wide photo, the
 * capacity finder, the building's history, what's included, clients, viewings with map and
 * hours, FAQ), spaces (every room with photos and its capacity in all six layouts) and an
 * enquiry with a live hire estimate. Signature: the capacity filter by layout — pick a layout
 * and a head-count and the site plan fills the rooms that fit, with combinations when none
 * does. Heritage serif, terracotta, solid, compact. EN / TR; choices survive a language switch.
 */
export default function SiteVenue01() {
  return (
    <SiteShell accent="#C2410C" material="solid" density="compact" pages={venuePages} className="min-h-dvh bg-scene">
      <VenueType>
        <VenueProvider>
          <SiteShellLocale code="en">
            <LocaleProvider locale="en-GB">
              <VenueSite locale="en" />
            </LocaleProvider>
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <LocaleProvider locale="tr-TR" messages={tr}>
              <VenueSite locale="tr" />
            </LocaleProvider>
          </SiteShellLocale>
        </VenueProvider>
      </VenueType>
    </SiteShell>
  );
}
