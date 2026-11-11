import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { FontProvider } from "@vamos-ui/react/fonts";
import { BlogSite } from "./components/blog-site";
import { ACCENT } from "./components/content";

/**
 * Magazine site, three pages: the issue home (masthead with contents, lead story, latest essays
 * with topic chips, most read, editor's letter, newsletter), one essay with a reading-progress
 * bar and footnotes that become side notes on wide screens (`?page=article`), and the archive
 * filtered by topic, author or search (`?page=archive#topic-transit`).
 * SiteShell owns the ink-blue accent, solid material, EN / TR and the page switch; the
 * "bookish" pairing (Garamond headings over a screen serif) comes from FontProvider.
 */
export default function SiteBlog01() {
  return (
    <SiteShell accent={ACCENT} material="solid" density="comfortable" pages={["home", "article", "archive"]} className="min-h-dvh bg-scene">
      <FontProvider pairing="bookish">
        <SiteShellLocale code="en">
          <BlogSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <BlogSite locale="tr" />
        </SiteShellLocale>
      </FontProvider>
    </SiteShell>
  );
}
