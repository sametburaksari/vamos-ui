"use client";

import * as React from "react";
import { FontProvider, createFontPairing } from "@vamos-ui/react/fonts";

/**
 * Old Mill Hall's pairing: Spectral (a sharp book serif with a heritage feel) for headings,
 * Archivo for text and labels, IBM Plex Mono for capacities and measurements.
 */
const pairing = createFontPairing({
  id: "old-mill",
  label: "Old Mill",
  heading: "Spectral",
  body: "Archivo",
  mono: "IBM Plex Mono",
  display: { weight: 500, tracking: "-0.025em", em: "italic", scale: 0.92 },
});

export function VenueType({ children }: { children: React.ReactNode }) {
  return (
    <FontProvider pairing={pairing} className="contents">
      {children}
    </FontProvider>
  );
}
