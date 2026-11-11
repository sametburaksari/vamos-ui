/**
 * Gearline motion: workshop-quick and mechanical. Signature: on load the bay board's rows flip
 * down one after another like a departures board, and the hazard stripe rolls into place. The
 * ready-by time on the job card ticks over (a short roll) whenever it changes. CSS only, behind
 * the reduced-motion and data-motion guards; nothing loops except the board's live dot.
 */
export const garageMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .gl-board tr {
    transform-origin: 50% 0;
    animation: gl-flip 420ms var(--ease-out-quint) backwards;
    animation-delay: calc(520ms + var(--gl-i, 0) * 85ms);
  }
  [data-site-shell]:not([data-motion="off"]) .gl-hazard {
    animation: gl-roll 700ms var(--ease-out-expo) 200ms backwards;
  }
  [data-site-shell]:not([data-motion="off"]) .gl-tick {
    animation: gl-tick 260ms var(--ease-out-quint);
  }
}
@keyframes gl-flip { from { opacity: 0; transform: perspective(600px) rotateX(-80deg); } }
@keyframes gl-roll { from { background-position: -84px 0; opacity: 0.2; } }
@keyframes gl-tick { from { opacity: 0; transform: translateY(0.45em); } }
`;
