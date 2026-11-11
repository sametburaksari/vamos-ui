import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { AppSite } from "./components/app-site";

/**
 * Mobile app landing, three pages: home (store badges, a hero with two phones on a drawn track,
 * the scroll-driven phone that swaps screens per feature, sourced stats, plan tabs with a synced
 * phone, store reviews, CTA band), pricing (monthly/yearly plans, comparison, billing FAQ) and
 * download (store badges, requirements, setup steps, FAQ). Near-black by default: the shell
 * forces dark mode, grotesk type, glass and an electric-green accent. EN / TR.
 */
export default function SiteApp01() {
  return (
    <SiteShell accent="#22C55E" theme="dark" font="grotesk" material="glass" density="comfortable" pages={["home", "pricing", "download"]} className="min-h-dvh bg-scene">
      <SiteShellLocale code="en">
        <AppSite locale="en" />
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <AppSite locale="tr" />
      </SiteShellLocale>
    </SiteShell>
  );
}
