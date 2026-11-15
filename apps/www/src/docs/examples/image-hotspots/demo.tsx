"use client";

import * as React from "react";
import { ImageHotspots, type Hotspot } from "@vamos-ui/react";

const rooms: (Hotspot & { seats: number; gear: string })[] = [
  { id: "atrium", x: 22, y: 70, label: "Atrium", seats: 40, gear: "Stage lights, two wireless mics" },
  { id: "loft", x: 22, y: 24, label: "Loft", seats: 12, gear: "Whiteboard wall, 65″ screen" },
  { id: "studio", x: 60, y: 30, label: "Recording studio", seats: 4, gear: "Booth, two condenser mics" },
  { id: "library", x: 82, y: 72, label: "Library", seats: 18, gear: "Quiet zone, no calls" },
];

function FloorPlan() {
  const room = "fill-[var(--surface-2)] stroke-[var(--line)]";
  return (
    <svg viewBox="0 0 400 250" aria-hidden="true" className="rounded-ui border border-line bg-surface">
      <g strokeWidth="2" className={room}>
        <rect x="16" y="16" width="150" height="100" />
        <rect x="16" y="124" width="150" height="110" />
        <rect x="174" y="16" width="210" height="120" />
        <rect x="174" y="144" width="210" height="90" />
      </g>
      <g className="fill-[var(--fg-subtle)] text-[9px]">
        <text x="24" y="32">3.1</text>
        <text x="24" y="140">3.2</text>
        <text x="182" y="32">3.3</text>
        <text x="182" y="160">3.4</text>
      </g>
    </svg>
  );
}

/** Single select with the detail in a panel beside the plan (`callout={false}`). */
export default function ImageHotspotsDemo() {
  const [id, setId] = React.useState<string | null>("studio");
  const picked = rooms.find((r) => r.id === id);
  return (
    <div className="grid w-full gap-5 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] sm:items-start">
      <ImageHotspots aria-label="Third floor rooms" aspectRatio={400 / 250} hotspots={rooms} value={id} onValueChange={setId} callout={false}>
        <FloorPlan />
      </ImageHotspots>
      <div aria-live="polite" className="rounded-ui border border-line bg-surface p-4">
        {picked ? (
          <>
            <p className="font-semibold text-fg">{picked.label}</p>
            <p className="mt-1 text-small text-fg-muted">
              {picked.seats} seats · {picked.gear}
            </p>
          </>
        ) : (
          <p className="text-small text-fg-muted">Pick a room on the plan.</p>
        )}
      </div>
    </div>
  );
}
