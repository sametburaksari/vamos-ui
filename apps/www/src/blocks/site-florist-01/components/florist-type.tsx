"use client";

import * as React from "react";
import { FontProvider, createFontPairing } from "@vamos-ui/react/fonts";

/**
 * Petal & Stem's magazine pairing: DM Serif Display headlines with italic emphasis over
 * Familjen Grotesk text, DM Mono for stem lists and prices. Scoped to the site.
 */
const pairing = createFontPairing({
  id: "petal-stem",
  label: "Petal & Stem",
  heading: "DM Serif Display",
  body: "Familjen Grotesk",
  mono: "DM Mono",
  display: { weight: 400, tracking: "-0.018em", em: "italic", scale: 0.96 },
});

export function FloristType({ children }: { children: React.ReactNode }) {
  return (
    <FontProvider pairing={pairing} className="contents">
      {children}
    </FontProvider>
  );
}
