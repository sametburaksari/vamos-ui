import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { MoversSite } from "./components/movers-site";
import { QuoteProvider } from "./components/quote-provider";

/**
 * Home moves and cleaning, three pages: home (survey-sheet hero with a measured floor plan and a
 * quick estimate, services priced like a spec sheet, move + clean, moving day by the hour, team,
 * reviews, office and warehouse), quote and FAQ (topic filter + search). Signature: the five-step
 * quote calculator — service, home, extras, date, contact — with a live range, crew, vehicle and
 * line items; weekend, month-end and flexible-date pricing. Corporate, blue, glass, comfortable.
 */
export default function SiteMovers01() {
  return (
    <SiteShell accent="#2563EB" motion="subtle" font="corporate" material="glass" density="comfortable" pages={["home", "quote", "faq"]} className="min-h-dvh bg-scene">
      <QuoteProvider>
        <SiteShellLocale code="en">
          <MoversSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <MoversSite locale="tr" />
        </SiteShellLocale>
      </QuoteProvider>
    </SiteShell>
  );
}
