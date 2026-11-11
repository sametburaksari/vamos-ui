import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { relayMotion } from "./components/motion";
import { SaasSite } from "./components/saas-site";

/**
 * SaaS site, two pages: home (announcement, rail navbar with a submenu, product hero, customer
 * marquee, feature tabs, sourced stats, setup steps, quote, pricing, FAQ, CTA band) and
 * “What’s new” (release notes). The SiteShell owns the look (accent from one colour, editorial
 * type, glass), the EN / TR switch and the page switch (`?page=changelog`).
 *
 * Motion (full, but quick): the hero cascades in and the inbox plays its conversation once —
 * threads slide in, the message arrives, the reply and tags follow; the customer strip runs as a
 * pausable ticker; figures count; features, plans and quotes stagger in; the page switch to
 * "What's new" cross-fades.
 */
export default function SiteSaas01() {
  return (
    <SiteShell accent="#C6F432" font="editorial" material="glass" density="comfortable" motion="full" pages={["home", "changelog"]} className="min-h-dvh bg-scene">
      <style>{relayMotion}</style>
      <SiteShellLocale code="en">
        <SaasSite locale="en" />
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <SaasSite locale="tr" />
      </SiteShellLocale>
    </SiteShell>
  );
}
