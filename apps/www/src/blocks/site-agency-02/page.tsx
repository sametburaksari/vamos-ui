import type * as React from "react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { AgencySite } from "./components/agency-site";
import { STUDIO_ACCENT } from "./components/content";
import { ProjectProvider } from "./components/project-provider";

/** Grotesk pushed to poster weight: heavy, tight, slightly larger display sizes. Tokens only. */
const posterType = {
  "--display-weight": "780",
  "--display-tracking": "-0.05em",
  "--display-scale": "1",
} as React.CSSProperties;

/**
 * Brand studio site, three pages: home (the colour stage — pick a client and the hero takes
 * its brand colour, mark, palette, type and result — services in oversized type, a work index
 * whose rows flood with each client's colour, numbers as colour blocks, team, quotes, CTA),
 * a case study for the chosen client (with next / previous) and a start-a-project brief that
 * adds itself up live. Grotesk at poster weight, solid, spacious, cobalt accent; every colour
 * block goes through `siteAccent` so text on it stays ≥ 4.5:1.
 */
export default function SiteAgency02() {
  return (
    <SiteShell accent={STUDIO_ACCENT} font="grotesk" material="solid" density="spacious" pages={["home", "case", "contact"]} className="min-h-dvh bg-scene [--container:var(--container-wide)]" style={posterType}>
      <ProjectProvider>
        <SiteShellLocale code="en">
          <AgencySite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <AgencySite locale="tr" />
        </SiteShellLocale>
      </ProjectProvider>
    </SiteShell>
  );
}
