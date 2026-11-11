import type * as React from "react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { getFontPairing, pairingUrl, pairingVars } from "@vamos-ui/react/fonts";
import { ClubSite } from "./components/club-site";

/** "Poster" pairing from the kit: condensed sports-poster headlines over a sturdy grotesk. */
const poster = getFontPairing("poster")!;
const posterUrl = pairingUrl(poster);

/**
 * Football club site, three pages: home (the club name set as a matchday poster, the next
 * fixture as a ticket stub, last three results, a league snapshot with top scorers, news, the
 * ground, membership band), fixtures (the signature: every fixture and result of the season
 * with team / competition / home-away filters, a record and form guide, and "Add to calendar"
 * as a real .ics file; then the full league table) and membership (four memberships, how
 * joining works, the stands, FAQ). Condensed poster type, solid surfaces, compact density, a
 * harbour-green club colour. EN / TR.
 */
export default function SiteClub01() {
  return (
    <SiteShell
      accent="#00875A"
      font={poster.id}
      material="solid"
      density="compact"
      pages={["home", "fixtures", "membership"]}
      className="min-h-dvh bg-scene"
      style={pairingVars(poster) as React.CSSProperties}
    >
      {posterUrl ? <link rel="stylesheet" href={posterUrl} precedence="default" /> : null}
      <SiteShellLocale code="en">
        <ClubSite locale="en" />
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <ClubSite locale="tr" />
      </SiteShellLocale>
    </SiteShell>
  );
}
