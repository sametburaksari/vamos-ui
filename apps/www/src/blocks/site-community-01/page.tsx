import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { CommunitySite, communityPages } from "./components/community-site";

/**
 * Community forum home, three pages: home (compact header with live counters, the latest
 * discussions and a sidebar of categories, meetups and top helpers), all topics with a category
 * rail and paging, and one solved thread with likes, quoting and a reply box. Signature: the
 * topic list with activity — participants, replies, views, a 14-day sparkline per topic and
 * four sort orders. System fonts, compact, workshop rust accent, solid.
 */
export default function SiteCommunity01() {
  return (
    <SiteShell accent="#B45309" motion="subtle" font="system" material="solid" density="compact" pages={communityPages} className="min-h-dvh bg-scene">
      <SiteShellLocale code="en">
        <LocaleProvider locale="en-GB">
          <CommunitySite locale="en" />
        </LocaleProvider>
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <LocaleProvider locale="tr-TR" messages={tr}>
          <CommunitySite locale="tr" />
        </LocaleProvider>
      </SiteShellLocale>
    </SiteShell>
  );
}
