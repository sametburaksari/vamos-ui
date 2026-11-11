import { Toaster } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { FontProvider } from "@vamos-ui/react/fonts";
import { HelpProvider } from "./components/help-provider";
import { HelpSite } from "./components/help-site";

/**
 * Help centre for the Loam garden app, three pages: home (big search, six topics, most-read
 * articles, contact channels), a category (`?page=category`, or a shared `?topic=soil`) and an
 * article (`?page=article`, or `?article=frost-date`) with "was this helpful".
 * Signature: instant search — results, matching categories and an "ask support" row appear
 * under the field as you type, with the match highlighted; arrows + Enter open, "/" focuses.
 * Ocean accent, solid, the open "civic" sans. EN / TR.
 */
export default function SiteHelp01() {
  return (
    <SiteShell accent="ocean" material="solid" density="comfortable" pages={["home", "category", "article"]} className="min-h-dvh bg-scene">
      <FontProvider pairing="civic">
        <HelpProvider>
          <SiteShellLocale code="en">
            <HelpSite locale="en" />
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <HelpSite locale="tr" />
          </SiteShellLocale>
        </HelpProvider>
      </FontProvider>
      <Toaster />
    </SiteShell>
  );
}
