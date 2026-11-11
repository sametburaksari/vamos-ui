import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { podcastMotion } from "./components/motion";
import { PodcastSite } from "./components/podcast-site";

/**
 * Food-culture podcast, two pages: home (the newest episode in a glass player beside the show
 * name, a searchable episode archive with topic filter, hosts, how it is recorded, generic
 * follow links, guest suggestion form) and the episode page (full player, transcript that
 * follows playback, show notes / recipes / credits).
 * Signature: chapter markers on the scrubber and a transcript synced to the playhead — click a
 * chapter or a line to jump. Dark by default, grotesk, glass, saffron accent.
 *
 * Motion (full — lively, conversational): the show name unveils, the plate behind the player
 * ripples out ring by ring and the waveform rises bar by bar; the episode count counts up;
 * episodes, hosts and follow links come in turn; filtered episodes rise in; play presses.
 */
export default function SitePodcast01() {
  return (
    <SiteShell accent="#EAB308" theme="dark" font="grotesk" material="glass" density="comfortable" motion="full" pages={["home", "episode"]} className="min-h-dvh bg-scene">
      <style>{podcastMotion}</style>
      <SiteShellLocale code="en">
        <LocaleProvider locale="en-GB">
          <PodcastSite locale="en" />
        </LocaleProvider>
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <LocaleProvider locale="tr-TR" messages={tr}>
          <PodcastSite locale="tr" />
        </LocaleProvider>
      </SiteShellLocale>
    </SiteShell>
  );
}
