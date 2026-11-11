/**
 * Long Table motion: warm and lively, like a good conversation. Signature: the player's waveform
 * wakes up — its bars rise from the baseline left to right, once, when the player appears — while
 * the plate behind it ripples out ring by ring. CSS only, behind the reduced-motion and
 * data-motion guards; the plate and the waveform keep still after that.
 */
export const podcastMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .lt-wave > span {
    transform-origin: 50% 50%;
    animation: lt-wave 520ms var(--ease-spring) backwards;
    animation-delay: calc(500ms + var(--lt-i, 0) * 7ms);
  }
  [data-site-shell]:not([data-motion="off"]) .lt-plate,
  [data-site-shell]:not([data-motion="off"]) .lt-plate > * {
    animation: lt-ripple 1300ms var(--ease-out-expo) backwards;
  }
  [data-site-shell]:not([data-motion="off"]) .lt-plate { animation-delay: 150ms; }
  [data-site-shell]:not([data-motion="off"]) .lt-plate > :nth-child(1) { animation-delay: 280ms; }
  [data-site-shell]:not([data-motion="off"]) .lt-plate > :nth-child(2) { animation-delay: 410ms; }
  [data-site-shell]:not([data-motion="off"]) .lt-plate > :nth-child(3) { animation-delay: 540ms; }
}
@keyframes lt-wave { from { scale: 1 0.08; opacity: 0.3; } }
@keyframes lt-ripple { from { opacity: 0; transform: scale(0.82); } }
`;
