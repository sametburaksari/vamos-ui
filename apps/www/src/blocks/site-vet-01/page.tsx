import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { ACCENT } from "./components/content";
import { PetProvider } from "./components/pet-provider";
import { VetSite } from "./components/vet-site";

/** Rounded, friendly headlines (Nunito, heavy) over a clear rounded-terminal text face. */
const burrowType = createFontPairing({ id: "burrow", label: "Burrow", heading: "Nunito", body: "Figtree", mono: "DM Mono", display: { weight: 800, tracking: "-0.025em", em: "normal", scale: 0.84 } });

/**
 * Veterinary clinic, three pages: home (pet-aware hero, services for the chosen pet, what to
 * bring, vets, owners' words, map and hours, FAQ), services & fees (`?page=services`: grouped
 * list, first-year plan and an appointment request) and team (`?page=team`).
 * Signature: the pet switch — dog, cat, rabbit & small pets, bird — swaps the services, prices,
 * photo, waiting-room note, first-year plan and the team filter; it survives page and language changes.
 */
export default function SiteVet01() {
  return (
    <SiteShell accent={ACCENT} material="solid" density="comfortable" pages={["home", "services", "team"]} className="min-h-dvh bg-scene">
      <FontProvider pairing={burrowType}>
        <PetProvider>
          <SiteShellLocale code="en">
            <VetSite locale="en" />
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <VetSite locale="tr" />
          </SiteShellLocale>
        </PetProvider>
      </FontProvider>
    </SiteShell>
  );
}
