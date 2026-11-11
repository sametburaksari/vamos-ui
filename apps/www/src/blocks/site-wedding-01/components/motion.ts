/**
 * Ece & Daniel motion: graceful and unhurried, like good stationery. Signature: the reply card —
 * every answer is written on to it with a short ink stroke (a left-to-right wipe) as you choose
 * it. The olive sprig draws itself wherever it appears (its stem first, then the leaves), and the
 * hairline arch slides into its offset behind the photograph. CSS only, behind the reduced-motion
 * and data-motion guards; a sprig inside a section that has not been revealed yet waits for it.
 */
export const weddingMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .wd-sprig path {
    stroke-dasharray: 1 1;
    animation: wd-draw 1100ms var(--ease-in-out) 500ms backwards;
  }
  [data-site-shell]:not([data-motion="off"]) .wd-sprig :is(ellipse, circle) {
    animation: wd-leaf 420ms var(--ease-out-quint) backwards;
    animation-delay: calc(900ms + var(--wd-i, 0) * 90ms);
  }
  [data-reveal-state="pending"] .wd-sprig :is(path, ellipse, circle) { animation-play-state: paused; }
  [data-site-shell]:not([data-motion="off"]) .wd-arch {
    animation: wd-arch 1200ms var(--ease-out-expo) 450ms backwards;
  }
  [data-site-shell]:not([data-motion="off"]) .wd-ink {
    animation: wd-ink 620ms var(--ease-in-out);
  }
}
@keyframes wd-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes wd-leaf { from { opacity: 0; } }
@keyframes wd-arch { from { translate: 0 0; opacity: 0; } }
@keyframes wd-ink { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
[dir="rtl"] .wd-ink { animation-name: wd-ink-rtl; }
@keyframes wd-ink-rtl { from { clip-path: inset(0 0 0 100%); } to { clip-path: inset(0 0 0 0); } }
`;
