/**
 * Urban Studies motion: measured and scholarly — fades and short rises, no bounce. Bespoke: the
 * masthead's city plan is surveyed on to the page (the avenue, the river and the square draw in
 * as hairlines, then the street blocks settle). Rows that appear in the course finder after a
 * filter change ease in. CSS only, behind the reduced-motion and data-motion guards.
 */
export const departmentMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .dus-plan .dus-line {
    stroke-dasharray: 1 1;
    animation: dus-draw 1600ms var(--ease-in-out) 350ms backwards;
  }
  [data-site-shell]:not([data-motion="off"]) .dus-plan .dus-line:nth-of-type(3) { animation-delay: 650ms; }
  [data-site-shell]:not([data-motion="off"]) .dus-plan .dus-blocks {
    animation: dus-blocks 900ms linear 1100ms backwards;
  }
  [data-site-shell]:not([data-motion="off"]) .dus-plan .dus-square {
    transform-box: fill-box;
    transform-origin: center;
    animation: dus-square 620ms var(--ease-out-quint) 1500ms backwards;
  }
}
@keyframes dus-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes dus-blocks { from { opacity: 0; } }
@keyframes dus-square { from { opacity: 0; transform: scale(0.4); } }
`;
