import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { BookingProvider } from "./components/booking-provider";
import { ClinicSite } from "./components/clinic-site";

/**
 * Family clinic, three pages: home (calm hero with the next free slot, services with fees,
 * clinicians, what to bring, the visit in four steps, insurance, map and hours, FAQ), clinicians
 * (filter by specialty) and appointment. Signature: the booking flow — service → clinician →
 * day (Calendar) → time (slots) → details — with a live summary; it survives a language switch.
 */
export default function SiteClinic01() {
  return (
    <SiteShell accent="#0F766E" font="corporate" material="solid" density="comfortable" pages={["home", "doctors", "appointment"]} className="min-h-dvh bg-scene">
      <BookingProvider>
        <SiteShellLocale code="en">
          <ClinicSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <ClinicSite locale="tr" />
        </SiteShellLocale>
      </BookingProvider>
    </SiteShell>
  );
}
