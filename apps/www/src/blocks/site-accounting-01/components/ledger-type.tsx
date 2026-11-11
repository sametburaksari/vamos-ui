"use client";

import * as React from "react";
import { FontProvider, createFontPairing } from "@vamos-ui/react/fonts";

/**
 * Ledgerly's "corporate serif" pairing: Literata headlines (a book face, steady at large sizes)
 * over Source Sans 3 text, IBM Plex Mono for every figure. Scoped to the site.
 */
const pairing = createFontPairing({
  id: "ledgerly",
  label: "Ledgerly",
  heading: "Literata",
  body: "Source Sans 3",
  mono: "IBM Plex Mono",
  display: { weight: 500, tracking: "-0.022em", em: "italic", scale: 0.9 },
});

export function LedgerType({ children }: { children: React.ReactNode }) {
  return (
    <FontProvider pairing={pairing} className="contents">
      {children}
    </FontProvider>
  );
}
