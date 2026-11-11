import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { BuildProvider } from "./components/build-provider";
import { ACCENT } from "./components/content";
import { studioMotion } from "./components/motion";
import { StudioSite } from "./components/studio-site";

/** A wide technical mono for headlines and numbers, a sturdy news grotesk for text. */
const darkroomType = createFontPairing({ id: "darkroom", label: "Darkroom", heading: "Martian Mono", body: "Schibsted Grotesk", mono: "Martian Mono", display: { weight: 500, tracking: "-0.06em", em: "normal", scale: 0.8 } });

/**
 * Photo studio, three pages: home (oversized mono wordmark over a framed studio photo, recent
 * work, the room, preset packages, the photographer, clients, visit info, FAQ), packages
 * (`?page=packages`: presets + the builder) and booking (`?page=booking`: calendar, start
 * times, details, with the package summary and deposit).
 * Signature: the package builder — session, studio time, images, people and extras feed a live
 * "contact sheet" quote (lines, VAT, total, deposit, delivery) that carries over to booking.
 * Black and white only; square corners via a scoped `--radius`.
 *
 * Motion (subtle and compact — exact, like a good camera): the wordmark rises in, the hero frame
 * develops (crop marks close in, the photograph comes up out of white, the frame counter last),
 * work and packages come in frame by frame, the contact-sheet total re-develops on every change,
 * buttons press and arrows nudge.
 */
export default function SiteStudio01() {
  return (
    <SiteShell accent={ACCENT} material="solid" density="compact" motion="subtle" pages={["home", "packages", "booking"]} className="min-h-dvh bg-scene" style={{ "--radius": "3px" } as React.CSSProperties}>
      <style>{studioMotion}</style>
      <FontProvider pairing={darkroomType}>
        <BuildProvider>
          <SiteShellLocale code="en">
            <StudioSite locale="en" />
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <StudioSite locale="tr" />
          </SiteShellLocale>
        </BuildProvider>
      </FontProvider>
    </SiteShell>
  );
}
