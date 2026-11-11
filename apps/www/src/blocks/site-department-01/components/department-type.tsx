"use client";

import * as React from "react";
import { FontProvider, createFontPairing } from "@vamos-ui/react/fonts";

/**
 * The department's "corporate serif": Lora headings (upright, medium weight, italic emphasis)
 * over Source Sans 3 for reading and IBM Plex Mono for course codes and rooms.
 * Loaded from Google Fonts and scoped to the site.
 */
const pairing = createFontPairing({
  id: "halden-urban",
  label: "Halden Urban Studies",
  heading: "Lora",
  body: "Source Sans 3",
  mono: "IBM Plex Mono",
  display: { weight: 500, tracking: "-0.015em", em: "italic", scale: 0.9 },
});

export function DepartmentType({ children }: { children: React.ReactNode }) {
  return (
    <FontProvider pairing={pairing} className="contents">
      {children}
    </FontProvider>
  );
}
