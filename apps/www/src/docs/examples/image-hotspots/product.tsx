"use client";

import { ImageHotspots, type Hotspot } from "@vamos-ui/react";

const parts: Hotspot[] = [
  { id: "handle", x: 50, y: 14, label: "Handle", description: "Folds flat; oak, oiled." },
  { id: "lid", x: 28, y: 36, label: "Lid", description: "Seals with a silicone ring." },
  { id: "valve", x: 74, y: 40, label: "Steam valve", description: "Twist a quarter turn to vent." },
  { id: "base", x: 50, y: 82, label: "Base", description: "Works on induction." },
];

function Kettle() {
  return (
    <svg viewBox="0 0 300 220" aria-hidden="true" className="rounded-ui bg-surface-2">
      <g className="fill-[var(--surface)] stroke-[var(--fg-subtle)]" strokeWidth="2">
        <path d="M110 40 Q150 10 190 40" fill="none" strokeWidth="6" strokeLinecap="round" />
        <rect x="70" y="60" width="160" height="24" rx="8" />
        <path d="M80 84 H220 L236 170 Q150 196 64 170 Z" />
        <rect x="76" y="176" width="148" height="14" rx="4" />
      </g>
    </svg>
  );
}

/** Numbered markers with the default callout (label + description) and a matching legend. */
export default function ImageHotspotsProduct() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <ImageHotspots aria-label="Parts of the stovetop kettle" aspectRatio={300 / 220} hotspots={parts} defaultValue="valve" numbered>
        <Kettle />
      </ImageHotspots>
      <ol className="grid list-decimal gap-1 ps-5 text-small text-fg-muted">
        {parts.map((p) => (
          <li key={p.id}>{p.label}</li>
        ))}
      </ol>
    </div>
  );
}
