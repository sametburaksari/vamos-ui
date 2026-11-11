import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { PortfolioSite, portfolioPages } from "./components/portfolio-site";

/**
 * Photographer portfolio, nine pages: home (the name as the hero, a discipline filter over a
 * masonry wall with a lightbox, the project index whose rows preview their cover beside the
 * cursor, a short bio), one case story per project (`?page=work-fog-studies`) and about +
 * contact (`?page=about`). Grotesk type, solid, compact, one vermilion accent.
 */
export default function SitePortfolio01() {
  return (
    <SiteShell accent="#E4572E" font="grotesk" material="solid" density="compact" pages={portfolioPages} className="min-h-dvh bg-surface">
      <SiteShellLocale code="en">
        <LocaleProvider locale="en-GB">
          <PortfolioSite locale="en" />
        </LocaleProvider>
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <LocaleProvider locale="tr-TR" messages={tr}>
          <PortfolioSite locale="tr" />
        </LocaleProvider>
      </SiteShellLocale>
    </SiteShell>
  );
}
