"use client";

import { AdSlot } from "@vamos-ui/react/blocks";
import { Button } from "@vamos-ui/react";
import { writeConsent } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// A leaderboard that becomes a mobile banner. The creative and onReady wait for marketing consent;
// the button grants it (in a site, the ConsentBanner does).
export default function AdSlotDemo() {
  return (
    <SiteFrame>
      <div className="vb-container flex flex-col items-center gap-6 py-10">
        <AdSlot size="leaderboard" mobileSize="mobile-banner" slotId="div-ad-demo" onReady={(el) => el.setAttribute("data-ready", "")}>
          <a href="/advertise" className="flex size-full items-center justify-center bg-accent font-display text-[1.375rem] italic text-accent-fg">Your campaign here, 728 × 90</a>
        </AdSlot>
        <Button variant="secondary" size="sm" onClick={() => writeConsent({ marketing: true })}>
          Allow marketing cookies
        </Button>
      </div>
    </SiteFrame>
  );
}
