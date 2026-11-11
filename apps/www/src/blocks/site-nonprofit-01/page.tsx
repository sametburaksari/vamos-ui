import type * as React from "react";
import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { NonprofitSite } from "./components/nonprofit-site";

/** Serif headings (editorial) over a sober report-style body and mono call numbers. */
const reportType = {
  "--font-ui": "var(--ff-plex, ui-sans-serif)",
  "--font-code": "var(--ff-plex-mono, ui-monospace)",
} as React.CSSProperties;

/**
 * Community-library charity, three pages: home (mission hero with the Winter Drive meter,
 * impact figures, the gift builder, programmes as catalogue cards, stories, how a shelf opens,
 * volunteer call), donate (gift builder + donor details + what happens next + FAQ) and the
 * 2025 transparency report (figures, every ₺100, ledger tables, files, board).
 * Signature: pick an amount and the slip itemises what it buys while books fill a drawn shelf.
 * Editorial serif headings, solid surfaces, warm library red.
 */
export default function SiteNonprofit01() {
  return (
    <SiteShell accent="#B91C1C" font="editorial" material="solid" density="comfortable" pages={["home", "donate", "report"]} className="min-h-dvh bg-scene" style={reportType}>
      <SiteShellLocale code="en">
        <LocaleProvider locale="en-GB" currency="TRY">
          <NonprofitSite locale="en" />
        </LocaleProvider>
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <LocaleProvider locale="tr-TR" currency="TRY" messages={tr}>
          <NonprofitSite locale="tr" />
        </LocaleProvider>
      </SiteShellLocale>
    </SiteShell>
  );
}
