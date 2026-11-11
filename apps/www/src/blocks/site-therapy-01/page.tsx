import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { ACCENT } from "./components/content";
import { TherapySite } from "./components/therapy-site";

/** Calm editorial: a light, bookish serif (Spectral 300, italic emphasis) over a quiet humanist sans. */
const harbourType = createFontPairing({ id: "harbour", label: "Harbour", heading: "Spectral", body: "Commissioner", mono: "IBM Plex Mono", display: { weight: 300, tracking: "-0.02em", em: "italic", scale: 0.9 } });

/**
 * Counselling practice, three pages: home (hero, what people bring, fees, rooms, therapists,
 * FAQ, map), approach (`?page=approach`: how therapy works and the limits of confidentiality)
 * and contact (`?page=contact`).
 * Signature: the privacy-first contact form — a name and one way back are all that is required,
 * discreet-sender and voicemail switches, a live "what we will receive" panel that marks every
 * field sent / not sent, a "Leave this site" button and a "Clear this page" after sending.
 */
export default function SiteTherapy01() {
  return (
    <SiteShell accent={ACCENT} material="solid" density="spacious" pages={["home", "approach", "contact"]} className="min-h-dvh bg-scene">
      <FontProvider pairing={harbourType}>
        <SiteShellLocale code="en">
          <TherapySite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <TherapySite locale="tr" />
        </SiteShellLocale>
      </FontProvider>
    </SiteShell>
  );
}
