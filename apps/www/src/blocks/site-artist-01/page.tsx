import type * as React from "react";
import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { ArtistSite } from "./components/artist-site";

/** Display type: heavy, tight, lower-case Onest; the emphasis switches to the italic serif. */
const bandType = {
  "--font-heading": "var(--ff-onest, ui-sans-serif)",
  "--display-weight": "900",
  "--display-tracking": "-0.065em",
  "--display-scale": "1",
} as React.CSSProperties;

/**
 * Band site, three pages: home (full-bleed crowd photo with the name set edge to edge, the new
 * album with its tracklist, the next tour dates, videos behind a click-to-load facade, merch,
 * mailing list with presale city), tour (every date grouped by month, region filter, hide
 * sold out, waitlist on sold-out shows, FAQ) and releases (sleeves drawn in tokens, kind
 * filter, tracklist table, band).
 * Signature: the month-grouped tour list with on sale / few left / new date / sold out states.
 * Dark, compact, solid, black and hot pink.
 */
export default function SiteArtist01() {
  return (
    <SiteShell
      accent="#EC4899"
      theme="dark"
      font="grotesk"
      material="solid"
      density="compact"
      pages={["home", "tour", "releases"]}
      className="min-h-dvh bg-scene [&_.font-display_em]:font-[family-name:var(--ff-instrument)] [&_.font-display_em]:font-normal [&_.font-display_em]:tracking-[-0.02em] [&_.font-display_em]:text-accent-ink [&_.font-display_em]:italic"
      style={bandType}
    >
      <SiteShellLocale code="en">
        <LocaleProvider locale="en-GB">
          <ArtistSite locale="en" />
        </LocaleProvider>
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <LocaleProvider locale="tr-TR" messages={tr}>
          <ArtistSite locale="tr" />
        </LocaleProvider>
      </SiteShellLocale>
    </SiteShell>
  );
}
