import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { FontProvider } from "@vamos-ui/react/fonts";
import { NewsSite } from "./components/news-site";
import { ACCENT } from "./components/content";

/**
 * News site ("The Harbour Ledger" / "Kıyı Gazetesi"), three pages: the front page (top bar with
 * date, weather and sign-in, masthead with mega menus, trending ticker, lead grid, tabbed
 * "Don't miss", section modules, ads, latest with pagination, sticky sidebar), a section front
 * (`?page=category`) and a story (`?page=article`).
 * SiteShell owns the ink-red accent, EN / TR and the page switch; the "newsroom" pairing
 * (Newsreader headlines over Source Sans) comes from FontProvider. Dark mode follows the page.
 */
export default function SiteNews01() {
  return (
    <SiteShell accent={ACCENT} material="solid" density="compact" pages={["home", "category", "article"]} className="min-h-dvh bg-scene">
      <FontProvider pairing="newsroom">
        <SiteShellLocale code="en">
          <NewsSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <NewsSite locale="tr" />
        </SiteShellLocale>
      </FontProvider>
    </SiteShell>
  );
}
