import { Toaster } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { ACCENT } from "./components/content";
import { WaitlistProvider } from "./components/waitlist-provider";
import { WaitlistSite } from "./components/waitlist-site";

/** A soft, slightly wonky serif for the promise and the numbers; a calm geometric sans for the rest. */
const loamType = createFontPairing({ id: "loam", label: "Loam", heading: "Fraunces", body: "Manrope", mono: "DM Mono", display: { weight: 360, tracking: "-0.025em", em: "italic", scale: 0.96 } });

/**
 * Pre-launch waitlist for a garden-planning app: one page (promise and email form in a glass
 * card over a soft photo, countdown to the first wave, three proof points, FAQ) and the
 * "you're on the list" state (`?page=joined`).
 * Signature: the referral position counter — your place in line counts in after sign-up and
 * rolls up 250 places for every friend who joins with your link. Earthy green, glass, editorial
 * serif. EN / TR.
 */
export default function SiteWaitlist01() {
  return (
    <SiteShell accent={ACCENT} motion="full" material="glass" density="comfortable" pages={["home", "joined"]} className="min-h-dvh bg-scene">
      <FontProvider pairing={loamType}>
        <WaitlistProvider>
          <SiteShellLocale code="en">
            <WaitlistSite locale="en" />
          </SiteShellLocale>
          <SiteShellLocale code="tr">
            <WaitlistSite locale="tr" />
          </SiteShellLocale>
        </WaitlistProvider>
      </FontProvider>
      <Toaster />
    </SiteShell>
  );
}
