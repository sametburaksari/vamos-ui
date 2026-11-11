import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { AppSite } from "./components/app-site";
import { appMotion } from "./components/motion";

/**
 * Mobile app landing, three pages: home (store badges, a hero with two phones on a drawn track,
 * the scroll-driven phone that swaps screens per feature, sourced stats, plan tabs with a synced
 * phone, store reviews, CTA band), pricing (monthly/yearly plans, comparison, billing FAQ) and
 * download (store badges, requirements, setup steps, FAQ). Near-black by default: the shell
 * forces dark mode, grotesk type, glass and an electric-green accent. EN / TR.
 *
 * Motion (full — a sports app should feel quick on its feet): the hero cascades in while the
 * accent lap draws itself round the track and the pace dot runs it; hero figures count up; the
 * feature chapters rise point by point beside the scroll-driven phone; plan tabs re-enter and
 * recount on every switch; buttons press, store badges lift.
 */
export default function SiteApp01() {
  return (
    <SiteShell accent="#22C55E" theme="dark" font="grotesk" material="glass" density="comfortable" motion="full" pages={["home", "pricing", "download"]} className="min-h-dvh bg-scene">
      <style>{appMotion}</style>
      <SiteShellLocale code="en">
        <AppSite locale="en" />
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <AppSite locale="tr" />
      </SiteShellLocale>
    </SiteShell>
  );
}
