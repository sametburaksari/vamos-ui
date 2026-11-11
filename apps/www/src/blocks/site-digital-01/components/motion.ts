/**
 * Gridwork motion: crisp and quick, like a good tool — short distances, no flourish. Signature:
 * the live preview — switching page or device swaps the frame with a fast settle (a slight scale
 * up from 98% and a fade), so you see the template re-render rather than jump. CSS only, behind
 * the reduced-motion and data-motion guards.
 */
export const digitalMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .gw-swap {
    transform-origin: 50% 0;
    animation: gw-swap 300ms var(--ease-out-quint);
  }
}
@keyframes gw-swap { from { opacity: 0.35; transform: scale(0.98); } }
`;
