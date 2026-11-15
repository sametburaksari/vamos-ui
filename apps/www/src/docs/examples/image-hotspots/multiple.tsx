"use client";

import * as React from "react";
import { ImageHotspots, type Hotspot } from "@vamos-ui/react";

const stops: Hotspot[] = [
  { id: "gate", x: 12, y: 80, label: "North gate" },
  { id: "hall", x: 34, y: 40, label: "Main hall" },
  { id: "lab", x: 58, y: 22, label: "Robotics lab" },
  { id: "garden", x: 60, y: 66, label: "Garden" },
  { id: "dorms", x: 86, y: 44, label: "Residences" },
  { id: "pool", x: 86, y: 82, label: "Pool", disabled: true },
];

function Campus() {
  return (
    <svg viewBox="0 0 400 220" aria-hidden="true" className="rounded-ui border border-line bg-surface">
      <path d="M20 190 C120 150 160 120 230 110 S360 80 390 60" fill="none" className="stroke-[var(--line)]" strokeWidth="14" strokeLinecap="round" />
      <g className="fill-[var(--surface-2)] stroke-[var(--line)]" strokeWidth="2">
        <rect x="110" y="60" width="60" height="40" rx="4" />
        <rect x="200" y="20" width="70" height="36" rx="4" />
        <circle cx="240" cy="145" r="26" />
        <rect x="320" y="70" width="56" height="54" rx="4" />
        <rect x="318" y="160" width="60" height="40" rx="10" />
      </g>
    </svg>
  );
}

/** `type="multiple"`: build a tour; labels stay visible. */
export default function ImageHotspotsMultiple() {
  const [tour, setTour] = React.useState<string[]>(["hall"]);
  return (
    <div className="grid w-full max-w-xl gap-3">
      <ImageHotspots type="multiple" aria-label="Campus tour stops" aspectRatio={400 / 220} hotspots={stops} value={tour} onValueChange={setTour} showLabels>
        <Campus />
      </ImageHotspots>
      <p className="text-small text-fg-muted" aria-live="polite">
        {tour.length ? `Tour: ${tour.map((id) => stops.find((s) => s.id === id)!.label).join(" → ")}` : "No stops picked yet."}
      </p>
    </div>
  );
}
