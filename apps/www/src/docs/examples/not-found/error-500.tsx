"use client";

import { NotFound } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// app/error.tsx is a client component: NotFound renders there too and wires Next's reset().
// Maintenance pages use kind="maintenance" with a phone line for bookings.
export default function NotFoundError500() {
  return (
    <div className="grid w-full gap-6">
      <SiteFrame>
        <NotFound kind="500" reset={() => window.location.reload()} />
      </SiteFrame>
      <SiteFrame>
        <NotFound kind="maintenance" phone="+902160000000" theme={{ mode: "dark" }} />
      </SiteFrame>
    </div>
  );
}
