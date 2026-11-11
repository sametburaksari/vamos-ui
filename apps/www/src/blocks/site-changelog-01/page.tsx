import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { ChangelogProvider } from "./components/changelog-provider";
import { ChangelogSite } from "./components/changelog-site";

/** A reading serif for release notes; Relay's Geist and Geist Mono underneath (brand continuity). */
const notesType = createFontPairing({ id: "relay-notes", label: "Relay notes", heading: "Source Serif 4", body: "Geist", mono: "Geist Mono", display: { weight: 500, tracking: "-0.02em", em: "italic", scale: 0.92 } });

/**
 * Product changelog for "Relay" (the webhooks API of site-devtool-01), two pages: the release
 * list (masthead, kind filters, subscribe + RSS) and one release as an article (`?page=entry`).
 * Signature: a sticky date rail — each release’s date and version stay pinned beside it while it
 * scrolls past; on narrow screens a date bar under the navbar follows the release in view.
 * Editorial, narrow column, a deep ocean accent (#0B6FA4, contrast-checked), solid. EN / TR.
 */
export default function SiteChangelog01() {
  return (
    <SiteShell accent="#0B6FA4" material="solid" density="comfortable" pages={["home", "entry"]} className="min-h-dvh bg-scene">
      <FontProvider pairing={notesType}>
        <ChangelogProvider>
          <SiteShellLocale code="en">
            <ChangelogSite locale="en" />
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <ChangelogSite locale="tr" />
          </SiteShellLocale>
        </ChangelogProvider>
      </FontProvider>
    </SiteShell>
  );
}
