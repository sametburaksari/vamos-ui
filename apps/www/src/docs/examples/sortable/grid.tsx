"use client";

import * as React from "react";
import { Image as ImageIcon, Star } from "lucide-react";
import { SortableGrid } from "@vamos-cms/ui/sortable";

interface Photo {
  id: string;
  file: string;
  caption: string;
  size: string;
  tint: string;
}

const initial: Photo[] = [
  { id: "p1", file: "harbour-dawn.jpg", caption: "Harbour at dawn", size: "2400 × 1600", tint: "var(--chart-1)" },
  { id: "p2", file: "spice-market.jpg", caption: "Spice market, Eminönü", size: "1800 × 1200", tint: "var(--chart-3)" },
  { id: "p3", file: "ferry-deck.jpg", caption: "Ferry deck at noon", size: "2048 × 1365", tint: "var(--chart-2)" },
  { id: "p4", file: "galata-rooftops.jpg", caption: "Galata rooftops", size: "2400 × 1600", tint: "var(--chart-4)" },
  { id: "p5", file: "tea-garden.jpg", caption: "Tea garden in Moda", size: "1600 × 1067", tint: "var(--chart-5)" },
  { id: "p6", file: "night-bridge.jpg", caption: "Bridge lights", size: "2400 × 1350", tint: "var(--chart-6)" },
];

export default function SortableGridExample() {
  const [photos, setPhotos] = React.useState(initial);
  return (
    <div className="w-full">
      <SortableGrid
        aria-label="Article gallery"
        items={photos}
        getLabel={(p) => p.caption}
        minItemWidth="9.5rem"
        onReorder={setPhotos}
        renderItem={(p, { index }) => (
          <figure className="m-0">
            <div
              className="relative grid aspect-[4/3] place-items-center text-fg-subtle"
              style={{ background: `color-mix(in srgb, ${p.tint} 34%, var(--surface-2))` }}
            >
              {/* stands in for the thumbnail <img> */}
              <ImageIcon className="size-5 opacity-60" aria-hidden />
              {index === 0 && (
                <span className="absolute bottom-1.5 start-1.5 inline-flex items-center gap-1 rounded-ui-sm bg-popover px-1.5 py-0.5 text-[11px] font-medium shadow-sm">
                  <Star className="size-3" /> Cover
                </span>
              )}
            </div>
            <figcaption className="px-2.5 py-2">
              <span className="block truncate text-[13px] font-medium">{p.caption}</span>
              <span className="block truncate font-mono text-[11px] text-fg-subtle">
                {p.file} · {p.size}
              </span>
            </figcaption>
          </figure>
        )}
      />
      <p className="mt-2 text-xs text-fg-muted">The first image becomes the article cover.</p>
    </div>
  );
}
