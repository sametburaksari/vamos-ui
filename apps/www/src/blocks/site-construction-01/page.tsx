import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { BuildType } from "./components/build-type";
import { ConstructionSite, constructionPages } from "./components/construction-site";

/**
 * Contractor and developer, six pages: home (huge signage headline beside a site photo with a
 * live "site board", hazard-tape rule, figures, projects, services, safety, four promises, people,
 * clients, FAQ, tender enquiry, offices), projects (status and type filters) and one page per
 * project. Signature: the project progress timeline — drag through the build month by month;
 * planned phases fill against the site diary, months after today switch to a hatched forecast.
 * Antonio · Plus Jakarta Sans · DM Mono, concrete grey with amber, glass, spacious.
 */
export default function SiteConstruction01() {
  return (
    <SiteShell
      accent="#D97706"
      material="glass"
      density="spacious"
      pages={constructionPages}
      className="min-h-dvh bg-scene bg-[radial-gradient(color-mix(in_oklch,var(--fg)_6%,transparent)_0.6px,transparent_0.9px),radial-gradient(color-mix(in_oklch,var(--fg)_4%,transparent)_0.6px,transparent_0.9px)] bg-[size:7px_7px,11px_13px] bg-[position:0_0,3px_5px]"
    >
      <BuildType>
        <SiteShellLocale code="en">
          <ConstructionSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <ConstructionSite locale="tr" />
        </SiteShellLocale>
      </BuildType>
    </SiteShell>
  );
}
