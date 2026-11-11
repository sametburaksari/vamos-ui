/**
 * Tempo Run motion. Signature: on load the accent lap draws itself round the hero track and the
 * pace dot runs it, finishing where the static design has it. Plain CSS (SVG stroke-dashoffset
 * and a rotation about the bend's centre), behind the reduced-motion and data-motion guards.
 */
export const appMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .tr-lap {
    stroke-dasharray: 1 1;
    animation: tr-lap 1100ms var(--ease-in-out) 420ms backwards;
  }
  [data-site-shell]:not([data-motion="off"]) .tr-pacer {
    transform-box: view-box;
    transform-origin: 200px 200px;
    animation: tr-pacer 1100ms var(--ease-in-out) 420ms backwards;
  }
}
@keyframes tr-lap { from { stroke-dashoffset: -1; } to { stroke-dashoffset: 0; } }
@keyframes tr-pacer { from { transform: rotate(-90deg); } to { transform: rotate(0deg); } }
`;
