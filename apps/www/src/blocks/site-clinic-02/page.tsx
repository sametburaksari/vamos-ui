import type { CSSProperties } from "react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { ClinicSite } from "./components/clinic-site";
import { ACCENT } from "./components/content";
import { VisitProvider } from "./components/visit-provider";

/** Round, bold Quicksand headings over Outfit: friendly for children, still easy to read for parents. */
const kiteType = createFontPairing({ id: "paperkite", label: "Paperkite", heading: "Quicksand", body: "Outfit", mono: "DM Mono", display: { weight: 700, tracking: "-0.025em", em: "normal", scale: 0.9 } });

/** Big, soft corners everywhere: buttons, fields and cards inherit them from --radius. */
const rounded = { "--radius": "18px" } as CSSProperties;

/**
 * Children's clinic, three pages: home (illustrated hero with the open-now line, visit types with
 * fees, the check-up path, doctors as illustrated portraits, the picture-story teaser, parents'
 * words, map and hours, FAQ), your visit (`?page=visit`: a six-page picture story with page
 * turns and read-aloud, and a packing list) and book (`?page=book`: child → reason → day and time
 * → parent, with a live summary). Signature: the check-up path — a board-game road of fourteen
 * well-child visits; a birth date marks each stop done / due / next with real dates and books it.
 */
export default function SiteClinic02() {
  return (
    <SiteShell accent={ACCENT} material="solid" density="comfortable" pages={["home", "visit", "book"]} className="min-h-dvh bg-scene" style={rounded}>
      <FontProvider pairing={kiteType}>
        <VisitProvider>
          <SiteShellLocale code="en">
            <ClinicSite locale="en" />
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <ClinicSite locale="tr" />
          </SiteShellLocale>
        </VisitProvider>
      </FontProvider>
    </SiteShell>
  );
}
