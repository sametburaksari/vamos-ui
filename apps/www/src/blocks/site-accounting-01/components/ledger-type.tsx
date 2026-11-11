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
      <style>{ledgerMotion}</style>
    </FontProvider>
  );
}

/**
 * Motion, in the firm's register: slow, ruled, exact. The hero ledger is written in row by row —
 * each line wiped in from the margin like a pen stroke — then the partner's signature. New lines
 * on the fee statement ink in the same way and changed totals settle into place. Transform,
 * opacity and clip-path only; reduced motion and data-motion="off" get the final state.
 */
const ledgerMotion = `
@keyframes lg-ink { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes lg-ink-rtl { from { clip-path: inset(0 0 0 100%); } to { clip-path: inset(0 0 0 0); } }
@keyframes lg-stamp { from { opacity: 0; transform: scale(1.35); } }
@keyframes lg-settle { from { opacity: 0; transform: translate3d(0, -0.35em, 0); } }
@media screen and (prefers-reduced-motion: no-preference) {
  .lg-ink:where(:not([data-motion="off"] *)) {
    animation: lg-ink 820ms var(--ease-out-quint) backwards;
    animation-delay: calc(420ms + var(--vm-i, 0) * 150ms);
  }
  [dir="rtl"] .lg-ink:where(:not([data-motion="off"] *)) { animation-name: lg-ink-rtl; }
  .lg-stamp:where(:not([data-motion="off"] *)) {
    display: inline-flex;
    animation: lg-stamp 360ms var(--ease-spring) backwards;
    animation-delay: calc(820ms + var(--vm-i, 0) * 150ms);
  }
  .lg-line:where(:not([data-motion="off"] *)) { animation: lg-ink 420ms var(--ease-out-quint) backwards; }
  [dir="rtl"] .lg-line:where(:not([data-motion="off"] *)) { animation-name: lg-ink-rtl; }
  .lg-settle:where(:not([data-motion="off"] *)) { display: inline-block; animation: lg-settle 320ms var(--ease-out-quint) backwards; }
}
`;
