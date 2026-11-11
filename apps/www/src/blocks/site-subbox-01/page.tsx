import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { BoxProvider } from "./components/box-provider";
import { SubboxSite } from "./components/subbox-site";

/** A high-contrast display serif for the labels and prices, a warm sans for the rest. */
const brewcraftType = createFontPairing({ id: "brewcraft", label: "Brewcraft", heading: "DM Serif Display", body: "Figtree", mono: "DM Mono", display: { weight: 400, em: "italic" } });

/**
 * Coffee subscription site, three pages: home (box-number hero, tasting cards, the size ×
 * frequency price grid, a week in the life of a bag, roasters, reviews, FAQ, gift band), plans
 * (`?page=plans`: grid + roast + grind with live bags, price per delivery and per cup, the next
 * four shipping Wednesdays) and gift (`?page=gift`: length, size, start, a live card preview).
 * Signature: the plan builder — one grid of nine plans whose choice carries across pages.
 * SiteShell owns the coffee-brown accent, solid material, EN / TR and the pages.
 */
export default function SiteSubbox01() {
  return (
    <SiteShell accent="#78350F" material="solid" density="comfortable" pages={["home", "plans", "gift"]} className="min-h-dvh bg-scene">
      <FontProvider pairing={brewcraftType}>
        <BoxProvider>
          <SiteShellLocale code="en">
            <SubboxSite locale="en" />
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <SubboxSite locale="tr" />
          </SiteShellLocale>
        </BoxProvider>
      </FontProvider>
    </SiteShell>
  );
}
