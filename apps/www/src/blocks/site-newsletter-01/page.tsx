import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { DeskProvider } from "./components/desk-provider";
import { NewsletterSite } from "./components/newsletter-site";

/** An old-style book serif for headlines, a screen serif for long reading, Plex Mono for the dateline. */
const deskType = createFontPairing({ id: "slow-desk", label: "Slow Desk", heading: "Crimson Pro", body: "Spectral", mono: "IBM Plex Mono", display: { weight: 500, em: "italic", tracking: "-0.015em" } });

/**
 * A writer's newsletter, three pages: home (nameplate, subscribe form beside the postmarked
 * latest letter, recent letters + topic index, about the writer, reader replies, FAQ), the
 * archive (`?page=archive`: full-text search in both languages, topic and year switches,
 * highlighted matches) and one issue (`?page=issue`). Signature: subscribe + archive search.
 * SiteShell owns the ink-and-red accent, solid material, spacious density, EN / TR and the pages.
 */
export default function SiteNewsletter01() {
  return (
    <SiteShell accent="#B3261E" material="solid" density="spacious" pages={["home", "archive", "issue"]} className="min-h-dvh bg-scene">
      <FontProvider pairing={deskType}>
        <DeskProvider>
          <SiteShellLocale code="en">
            <NewsletterSite locale="en" />
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <NewsletterSite locale="tr" />
          </SiteShellLocale>
        </DeskProvider>
      </FontProvider>
    </SiteShell>
  );
}
