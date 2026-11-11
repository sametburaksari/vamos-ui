import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { SaasSite } from "./components/saas-site";

/**
 * SaaS site, two pages: home (announcement, rail navbar with a submenu, product hero, customer
 * marquee, feature tabs, sourced stats, setup steps, quote, pricing, FAQ, CTA band) and
 * “What’s new” (release notes). The SiteShell owns the look (accent from one colour, editorial
 * type, glass), the EN / TR switch and the page switch (`?page=changelog`).
 */
export default function SiteSaas01() {
  return (
    <SiteShell accent="#C6F432" font="editorial" material="glass" density="comfortable" pages={["home", "changelog"]} className="min-h-dvh bg-scene">
      <SiteShellLocale code="en">
        <SaasSite locale="en" />
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <SaasSite locale="tr" />
      </SiteShellLocale>
    </SiteShell>
  );
}
