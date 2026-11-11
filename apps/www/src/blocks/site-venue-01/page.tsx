import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { venueMotion } from "./components/motion";
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
 *
 * Motion (full — an events venue, but heavy like the building): the headline unveils and the
 * ledger fills line by line, the Grain Hall photograph drifts as you scroll past (the one scroll
 * effect), the history years roll up to their dates, rooms that fit flood with terracotta from
 * the floor each time the finder changes, what is included arrives in turn, buttons press.
 */
export default function SiteVenue01() {
  return (
    <SiteShell accent="#C2410C" material="solid" density="compact" motion="full" pages={venuePages} className="min-h-dvh bg-scene">
      <style>{venueMotion}</style>
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
