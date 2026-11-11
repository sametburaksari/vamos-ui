import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { ACCENT } from "./components/content";
import { DevtoolSite } from "./components/devtool-site";
import { LangProvider } from "./components/lang-provider";

/** Mono headings over a neutral grotesk: code is the voice of the brand. */
const relayType = createFontPairing({ id: "relay", label: "Relay", heading: "Geist Mono", body: "Geist", mono: "Geist Mono", display: { weight: 600, tracking: "-0.05em", scale: 0.8 } });

/**
 * Webhooks API site ("Relay"), three pages: home (code-first hero with a delivery log, quick
 * start with code per step, features, measured uptime, a per-event cost estimator, plans, FAQ),
 * docs landing (search with a "/" shortcut, guides by job, SDK table) and a changelog teaser.
 * Signature: every code window has language tabs, and picking one switches every sample, the
 * install line and the SDK table on every page (remembered per browser). Graphite + cyan,
 * solid, compact. EN / TR.
 */
export default function SiteDevtool01() {
  return (
    <SiteShell accent={ACCENT} material="solid" density="compact" pages={["home", "docs", "changelog"]} className="min-h-dvh bg-scene">
      <FontProvider pairing={relayType}>
        <LangProvider>
          <SiteShellLocale code="en">
            <DevtoolSite locale="en" />
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <DevtoolSite locale="tr" />
          </SiteShellLocale>
        </LangProvider>
      </FontProvider>
    </SiteShell>
  );
}
