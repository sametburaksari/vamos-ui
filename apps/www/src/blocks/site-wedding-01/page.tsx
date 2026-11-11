import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { WeddingSite, weddingPages } from "./components/wedding-site";
import { WeddingType } from "./components/wedding-type";

/**
 * Wedding invitation site for Ece & Daniel, three pages: home (an arched photo beside a typeset
 * invitation card, the story in four years, the weekend at a glance, the estate, a note on
 * gifts), details (schedule timeline, map, travel, hotels with room-block codes, dress code,
 * gifts, FAQ) and RSVP. Signature: the reply flow — find the invitation by name, accept or
 * decline per guest, a plus-one when the invitation allows it, a main course and dietary needs
 * per guest with clash hints — with a stationery reply card filling in beside it.
 * Script-free serif, sage on ivory, solid, comfortable. EN / TR.
 */
export default function SiteWedding01() {
  return (
    <SiteShell
      accent="#6B8E6B"
      material="solid"
      density="comfortable"
      pages={weddingPages}
      className="min-h-dvh bg-scene [--scene:color-mix(in_oklch,var(--surface)_95%,var(--warning))]"
    >
      <WeddingType>
        <SiteShellLocale code="en">
          <LocaleProvider locale="en-GB">
            <WeddingSite locale="en" />
          </LocaleProvider>
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <LocaleProvider locale="tr-TR" messages={tr}>
            <WeddingSite locale="tr" />
          </LocaleProvider>
        </SiteShellLocale>
      </WeddingType>
    </SiteShell>
  );
}
