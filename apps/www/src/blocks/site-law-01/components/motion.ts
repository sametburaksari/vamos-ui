/**
 * Ardent & Vale motion: slow and exact — longer durations, short distances, no overshoot. The
 * shell's tokens are tuned (see page.tsx). Signature: the practice-area index — rows are set one
 * after another like lines of a contract, and the preview beside it changes practice with a
 * measured cross-fade. CSS only, behind the reduced-motion and data-motion guards.
 */
export const lawMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .lv-swap {
    animation: lv-swap 380ms var(--ease-out-quint);
  }
}
@keyframes lv-swap { from { opacity: 0; transform: translate3d(0, 6px, 0); } }
`;

/** Slower, shorter-travel reveal tokens for the firm (inline on the shell, so they beat the level defaults). */
export const lawMotionTokens = { "--motion-reveal": "920ms", "--motion-distance": "8px", "--motion-stagger": "110ms" };
