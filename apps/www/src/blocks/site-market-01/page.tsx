import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { OCEAN } from "./components/content";
import { MarketProvider } from "./components/market-provider";
import { MarketSite } from "./components/market-site";

/**
 * Multi-seller marketplace for independent makers, three pages: home (search-first hero with a
 * rated collage, craft row, top makers, new listings, how buying works, figures, sell CTA, FAQ),
 * search results (seller-rating filter with live counts, Top maker switch, category, price range,
 * dispatch, sort, removable chips; a sheet on phones) and a seller page (rating card whose bars
 * filter the reviews, shop / reviews / about tabs). Signature: seller rating + filters — every
 * card carries the maker's rating, which opens its breakdown.
 * System fonts, a deep ocean blue (contrast-checked by the shell), glass, comfortable.
 */
export default function SiteMarket01() {
  return (
    <SiteShell accent={OCEAN} font="system" material="glass" density="comfortable" pages={["home", "search", "seller"]} className="min-h-dvh bg-scene">
      <MarketProvider>
        <SiteShellLocale code="en">
          <MarketSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <MarketSite locale="tr" />
        </SiteShellLocale>
      </MarketProvider>
    </SiteShell>
  );
}
