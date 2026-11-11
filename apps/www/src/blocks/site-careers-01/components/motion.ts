/**
 * Northpoint motion: steady and exact, like the product. Signature: on load the compass needle
 * swings in from a search sweep and settles on north with a small spring, while the team dots
 * light up round the dial. Rows entering the filtered job board rise in. CSS only, behind the
 * reduced-motion and data-motion guards.
 */
export const careersMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .np-needle {
    animation: np-sweep 1200ms var(--ease-spring) 380ms backwards;
  }
  [data-site-shell]:not([data-motion="off"]) .np-dot {
    transform-box: fill-box;
    transform-origin: center;
    animation: np-dot 380ms var(--ease-out-quint) backwards;
    animation-delay: calc(700ms + var(--np-i, 0) * 70ms);
  }
}
@keyframes np-sweep { from { transform: rotate(-200deg); } }
@keyframes np-dot { from { transform: scale(0); opacity: 0; } }
`;
