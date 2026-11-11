/**
 * Little Orchard motion: cheerful but grown-up — springy, short, never silly. Signature: the
 * daily rhythm — the day's blocks grow up from the timeline one after another when it scrolls
 * into view and again whenever you switch group. The hero's three photographs land like pinned
 * prints (a small spring and tilt), and the soft circles pop in behind them. CSS only, behind the
 * reduced-motion and data-motion guards; the timeline's reveal state comes from <Reveal>.
 */
export const schoolMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .lo-print {
    animation: lo-print 760ms var(--ease-spring) backwards;
    animation-delay: calc(260ms + var(--lo-i, 0) * 140ms);
  }
  [data-site-shell]:not([data-motion="off"]) .lo-dot {
    animation: lo-dot 640ms var(--ease-spring) 720ms backwards;
  }
  [data-site-shell]:not([data-motion="off"]) .lo-day [role="tab"] {
    transform-origin: 50% 100%;
    animation: lo-grow 460ms var(--ease-spring) backwards;
    animation-delay: calc(var(--lo-i, 0) * 45ms);
  }
  [data-site-shell]:not([data-motion="off"]) .lo-day[data-reveal-state="pending"] [role="tab"] { scale: 1 0; }
  [data-site-shell]:not([data-motion="off"]) .lo-day[data-reveal-state="in"] [role="tab"] {
    transition: scale 480ms var(--ease-spring);
    transition-delay: calc(var(--lo-i, 0) * 55ms);
  }
}
@keyframes lo-print { from { opacity: 0; transform: translateY(18px) rotate(-4deg) scale(0.92); } }
@keyframes lo-dot { from { opacity: 0; scale: 0.4; } }
@keyframes lo-grow { from { scale: 1 0; } }
`;
