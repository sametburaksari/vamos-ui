"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { LogoStrip, SiteShell, StatsBand } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { clientLogos } from "../_site-1/assets";

type Level = "full" | "subtle" | "off";

const notes: Record<Level, string> = {
  full: "Longer, wider moves, a wiping hero title, magnetic calls-to-action.",
  subtle: "The default: short fades and small rises, count-ups, the logo ticker.",
  off: "Final state everywhere — what reduced-motion visitors always get.",
};

// One prop sets the motion of a whole site: <SiteShell motion="full | subtle | off">. The
// blocks follow it — StatsBand counts up, LogoStrip's marquee runs (or wraps into a static
// row), sections reveal on scroll. prefers-reduced-motion beats every level.
export default function MotionLevels() {
  const [level, setLevel] = React.useState<Level>("subtle");
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <ToggleGroup aria-label="Motion level" value={level} onValueChange={(v) => v && setLevel(v as Level)}>
          <ToggleGroupItem value="full">full</ToggleGroupItem>
          <ToggleGroupItem value="subtle">subtle</ToggleGroupItem>
          <ToggleGroupItem value="off">off</ToggleGroupItem>
        </ToggleGroup>
        <p className="text-small text-fg-muted">{notes[level]}</p>
      </div>
      <SiteFrame>
        <SiteShell key={level} motion={level} routing="memory" accent="#2B4C7E" font="editorial">
          <StatsBand
            eyebrow="Atlas Dining Room · 2026"
            title="A year at the long table"
            items={[
              { value: 4.8, label: "Average rating", source: "1,240 reviews, Oct 2026" },
              { value: 1240, label: "Reviews" },
              { value: 38, unit: "%", label: "Bookings via WhatsApp" },
              { value: 11, unit: "min", unitLabel: "minutes", label: "Median first reply" },
            ]}
          />
          <LogoStrip variant="marquee" caption="Suppliers we cook with" logos={clientLogos} speed={40} />
        </SiteShell>
      </SiteFrame>
    </div>
  );
}
