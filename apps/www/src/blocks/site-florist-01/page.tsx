import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { FloristSite, floristPages } from "./components/florist-site";
import { FloristType } from "./components/florist-type";
import { OrderProvider } from "./components/order-provider";

/**
 * Florist, three pages: home (a magazine masthead with the issue number and a live same-day
 * cut-off, the weekly edit as a feature spread, three refusals, subscriptions, delivery fees by
 * district, the shop, FAQ), bouquets (filter + size switch) and order. Signature: delivery date
 * and card message — the calendar and time windows follow the district and the 14:00 cut-off,
 * and the card is previewed as written beside the envelope line. Magazine serif, coral, glass,
 * spacious. EN / TR; the chosen bouquet survives a language switch.
 */
export default function SiteFlorist01() {
  return (
    <SiteShell accent="#F97362" material="glass" density="spacious" pages={floristPages} className="min-h-dvh bg-scene">
      <FloristType>
        <OrderProvider>
          <SiteShellLocale code="en">
            <LocaleProvider locale="en-GB">
              <FloristSite locale="en" />
            </LocaleProvider>
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <LocaleProvider locale="tr-TR" messages={tr}>
              <FloristSite locale="tr" />
            </LocaleProvider>
          </SiteShellLocale>
        </OrderProvider>
      </FloristType>
    </SiteShell>
  );
}
