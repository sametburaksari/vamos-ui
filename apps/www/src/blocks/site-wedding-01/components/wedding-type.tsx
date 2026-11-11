"use client";

import * as React from "react";
import { FontProvider, createFontPairing } from "@vamos-ui/react/fonts";

/**
 * The invitation pairing: Playfair Display for names and headings (italic for the ampersand and
 * emphasis, never a script), Work Sans for reading, DM Mono for times. Scoped to the site.
 */
const pairing = createFontPairing({
  id: "ece-daniel",
  label: "Ece & Daniel",
  heading: "Playfair Display",
  body: "Work Sans",
  mono: "DM Mono",
  display: { weight: 400, tracking: "-0.012em", em: "italic", scale: 0.94 },
});

export function WeddingType({ children }: { children: React.ReactNode }) {
  return (
    <FontProvider pairing={pairing} className="contents">
      {children}
    </FontProvider>
  );
}
