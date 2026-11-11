"use client";

import * as React from "react";
import { FontProvider, createFontPairing } from "@vamos-ui/react/fonts";

/**
 * Stonebridge's site-hoarding pairing: Antonio (tall, condensed signage capitals) for headlines,
 * Plus Jakarta Sans for text, DM Mono for dates and figures. Scoped to the site.
 */
const pairing = createFontPairing({
  id: "stonebridge",
  label: "Stonebridge",
  heading: "Antonio",
  body: "Plus Jakarta Sans",
  mono: "DM Mono",
  display: { weight: 600, tracking: "-0.005em", em: "normal", scale: 1.08 },
});

export function BuildType({ children }: { children: React.ReactNode }) {
  return (
    <FontProvider pairing={pairing} className="contents">
      {children}
    </FontProvider>
  );
}
