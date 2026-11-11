/**
 * Old Mill Hall motion: confident, an events place — bigger moves, but heavy like the building.
 * Signature: the capacity plan — every room that takes your head-count fills with terracotta from
 * the floor up, again each time the layout or numbers change. CSS only, behind the reduced-motion
 * and data-motion guards.
 */
export const venueMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .om-flood {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation: om-flood 520ms var(--ease-out-expo) backwards;
  }
}
@keyframes om-flood { from { transform: scaleY(0); } }
`;
