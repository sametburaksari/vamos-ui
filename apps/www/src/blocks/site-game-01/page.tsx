import type * as React from "react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { getFontPairing, pairingUrl, pairingVars } from "@vamos-ui/react/fonts";
import { GameSite } from "./components/game-site";

/** "Studio" pairing from the kit (extended avant-garde display, precise text, retro mono), pushed to its heaviest weight. */
const studio = getFontPairing("studio")!;
const studioUrl = pairingUrl(studio);
const style = { ...pairingVars(studio), "--display-weight": "800", "--display-tracking": "-0.04em" } as React.CSSProperties;

/** Embers breathe on the key art; nothing moves for people who prefer less motion. */
const motion = `@media (prefers-reduced-motion: no-preference){[data-site-shell] .ea-breathe{transform-box:fill-box;transform-origin:center;animation:ea-breathe 3.2s ease-in-out infinite}}@keyframes ea-breathe{0%,100%{transform:scale(.7);opacity:.12}50%{transform:scale(1.15);opacity:.3}}`;

/**
 * Game landing site, three pages: home (the generated topographic "atlas" key art behind the
 * title and the reveal-trailer facade, press quotes, three pillars with ember-toned stills, a
 * facts ledger, screenshot filmstrip, dev diary, launch-day email), media (all trailers as click-
 * to-load facades, screenshot mosaic with a lightbox) and press kit (fact sheet, copy-ready texts,
 * downloads — single files or a ZIP built in the browser, logos and key art generated as SVG —
 * team, review keys, embargo FAQ). Dark, extended heavy display, glass, ember accent. EN / TR.
 */
export default function SiteGame01() {
  return (
    <SiteShell accent="#F4511E" theme="dark" font={studio.id} material="glass" density="comfortable" pages={["home", "media", "press"]} className="min-h-dvh bg-scene" style={style}>
      {studioUrl ? <link rel="stylesheet" href={studioUrl} precedence="default" /> : null}
      <style>{motion}</style>
      <SiteShellLocale code="en">
        <GameSite locale="en" />
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <GameSite locale="tr" />
      </SiteShellLocale>
    </SiteShell>
  );
}
