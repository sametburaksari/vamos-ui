"use client";

import * as React from "react";
import { FontProvider, createFontPairing } from "@vamos-ui/react/fonts";

/**
 * Ostrand's industrial pairing: Saira Condensed headlines (drawing-sheet lettering), Commissioner
 * for text, JetBrains Mono for part numbers and every spec value. Scoped to the site.
 */
const pairing = createFontPairing({
  id: "ostrand",
  label: "Ostrand",
  heading: "Saira Condensed",
  body: "Commissioner",
  mono: "JetBrains Mono",
  display: { weight: 600, tracking: "-0.01em", em: "normal", scale: 1.04 },
});

export function FactoryType({ children }: { children: React.ReactNode }) {
  return (
    <FontProvider pairing={pairing} className="contents">
      {children}
    </FontProvider>
  );
}
