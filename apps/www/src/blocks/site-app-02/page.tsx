import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { AppSite } from "./components/app-site";
import { appPages } from "./components/content";
import { FernwayType } from "./components/fernway-type";

/**
 * Finance app landing, three pages: home (calm split hero beside the app in glass panes, trust
 * seals, features, the savings goal planner with a live projection chart, figures, FAQ),
 * pricing (monthly / yearly plans, comparison, fees) and security (layers of protection,
 * 90-day service health, lost-phone steps, vulnerability reports). Geist type, light glass over
 * a soft tinted scene, cobalt accent, spacious. EN / TR, TRY.
 */
export default function SiteApp02() {
  return (
    <SiteShell
      accent="#2A5BD7"
      material="glass"
      density="spacious"
      pages={appPages}
      className="min-h-dvh bg-[radial-gradient(60rem_36rem_at_85%_-10%,var(--accent-soft),transparent_70%)] bg-scene"
    >
      <FernwayType>
        <SiteShellLocale code="en">
          <LocaleProvider locale="en-GB" currency="TRY">
            <AppSite locale="en" />
          </LocaleProvider>
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <LocaleProvider locale="tr-TR" messages={tr} currency="TRY">
            <AppSite locale="tr" />
          </LocaleProvider>
        </SiteShellLocale>
      </FernwayType>
    </SiteShell>
  );
}
