"use client";

import * as React from "react";
import { FontProvider, createFontPairing } from "@vamos-ui/react/fonts";

/**
 * The firm's "corporate serif" pairing: Source Serif 4 headlines over IBM Plex Sans text,
 * IBM Plex Mono for figures. Loaded from Google Fonts and scoped to the site.
 */
const pairing = createFontPairing({
  id: "ardent-vale",
  label: "Ardent & Vale",
  heading: "Source Serif 4",
  body: "IBM Plex Sans",
  mono: "IBM Plex Mono",
  display: { weight: 460, tracking: "-0.018em", em: "italic", scale: 0.92 },
});

export function LawType({ children }: { children: React.ReactNode }) {
  return (
    <FontProvider pairing={pairing} className="contents">
      {children}
    </FontProvider>
  );
}
