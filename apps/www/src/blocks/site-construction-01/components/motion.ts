/**
 * Stonebridge motion: heavy and deliberate, like a crane — long, even ease, nothing bouncy.
 * Signature: the project timeline's phase bars are laid down one after another as the Gantt
 * scrolls into view. On the home hero the site board's progress bars pour in and the hazard
 * tape slides into place. CSS only, behind the reduced-motion and data-motion guards; the
 * Gantt's reveal state comes from <Reveal>.
 */
export const buildMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .sb-board .vui-progress-indicator {
    animation: sb-pour 1300ms var(--ease-in-out) backwards;
    animation-delay: calc(700ms + var(--sb-i, 0) * 140ms);
  }
  [data-site-shell]:not([data-motion="off"]) .sb-tape {
    animation: sb-tape 1100ms var(--ease-out-expo) 300ms backwards;
  }
  [data-site-shell]:not([data-motion="off"]) .sb-gantt[data-reveal-state="pending"] .sb-bar { scale: 0 1; }
  [data-site-shell]:not([data-motion="off"]) .sb-gantt[data-reveal-state="in"] .sb-bar {
    transition: scale 640ms var(--ease-in-out);
    transition-delay: calc(var(--sb-i, 0) * 90ms);
  }
}
.sb-bar { transform-origin: left center; }
[dir="rtl"] .sb-bar { transform-origin: right center; }
@keyframes sb-pour { from { scale: 0 1; } }
@keyframes sb-tape { from { background-position: -160px 0; } }
`;
