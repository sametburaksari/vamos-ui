/**
 * Paperkite motion: calm and kind, never startling. Signature: the check-up path — the road
 * unrolls down the board and the fourteen stops pop on to it one by one as it scrolls into view.
 * The hero kite lifts into the sky once and settles (no endless sway). CSS only, behind the
 * reduced-motion and data-motion guards; the board's reveal state comes from <Reveal>.
 */
export const clinicMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .pk-kite {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation: pk-lift 1500ms var(--ease-spring) 450ms backwards;
  }
  [data-site-shell]:not([data-motion="off"]) .pk-board[data-reveal-state="pending"] .pk-road { clip-path: inset(0 0 100% 0); }
  [data-site-shell]:not([data-motion="off"]) .pk-board[data-reveal-state="pending"] .pk-stop { scale: 0; }
  [data-site-shell]:not([data-motion="off"]) .pk-board[data-reveal-state="in"] .pk-road { clip-path: inset(0 0 0 0); transition: clip-path 900ms var(--ease-in-out); }
  [data-site-shell]:not([data-motion="off"]) .pk-board[data-reveal-state="in"] .pk-stop {
    transition: scale 420ms var(--ease-spring);
    transition-delay: calc(260ms + var(--pk-i, 0) * 50ms);
  }
}
@keyframes pk-lift { from { opacity: 0; transform: translate(-24px, 120px) rotate(-16deg) scale(0.8); } }
`;
