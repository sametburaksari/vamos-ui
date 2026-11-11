import type * as React from "react";
import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { GridProvider } from "./components/grid-overlay";
import { PortfolioSite, portfolioPages } from "./components/portfolio-site";

/** Plex at a light weight for large headings — drafted, not shouted (tokens only). */
const lightHeadings = {
  "--display-weight": "300",
  "--display-tracking": "-0.035em",
  "--display-scale": "0.9",
} as React.CSSProperties;

/**
 * Architecture studio, six pages: home (title-block hero, selected work as captioned plates
 * set on a 12-column grid, a filterable project register, practice, awards), one page per
 * project (`?page=project-taslik`) and the studio (people, how a commission runs, contact).
 * Signature: the grid can be shown over any page (corner button or the G key), and each
 * project's captions sit in the margin, tracking and jumping to the figure in view.
 * Light, IBM Plex in a light weight, solid, spacious, one cobalt accent.
 */
export default function SitePortfolio02() {
  return (
    <SiteShell accent="#2B4EDB" motion="subtle" theme="light" font="corporate" material="solid" density="spacious" pages={portfolioPages} className="min-h-dvh bg-scene [&_[data-slot=image]]:my-0!" style={lightHeadings}>
      <GridProvider>
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
      </GridProvider>
    </SiteShell>
  );
}
