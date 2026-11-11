"use client";

import * as React from "react";
import { FontProvider, createFontPairing } from "@vamos-ui/react/fonts";

/**
 * Fernway's calm corporate pairing: Geist for headings and text, Geist Mono for figures.
 * Tight, medium-weight headlines; loaded from Google Fonts and scoped to the site.
 */
const pairing = createFontPairing({
  id: "fernway",
  label: "Fernway",
  heading: "Geist",
  body: "Geist",
  mono: "Geist Mono",
  display: { weight: 560, tracking: "-0.035em", em: "normal", scale: 0.86 },
});

export function FernwayType({ children }: { children: React.ReactNode }) {
  return (
    <FontProvider pairing={pairing} className="contents">
      {children}
    </FontProvider>
  );
}
