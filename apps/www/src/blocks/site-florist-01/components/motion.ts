/**
 * Petal & Stem motion: soft, like paper and petals — blurred fades, long ease, no snapping.
 * Signature: the price tag tied to the hero photograph drops on its string and swings to rest,
 * once. CSS only, behind the reduced-motion and data-motion guards.
 */
export const floristMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .ps-tag {
    transform-origin: 2.25rem -2rem;
    animation: ps-swing 1700ms var(--ease-out-quint) 650ms backwards;
  }
  [dir="rtl"] [data-site-shell]:not([data-motion="off"]) .ps-tag { transform-origin: calc(100% - 2.25rem) -2rem; }
}
@keyframes ps-swing {
  0% { opacity: 0; transform: translateY(-14px) rotate(9deg); }
  18% { opacity: 1; transform: translateY(0) rotate(-6deg); }
  38% { transform: rotate(3.5deg); }
  58% { transform: rotate(-1.8deg); }
  78% { transform: rotate(0.7deg); }
  100% { transform: none; }
}
`;
