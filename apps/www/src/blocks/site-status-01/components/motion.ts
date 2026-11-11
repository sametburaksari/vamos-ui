/**
 * Relay Status motion: functional and quiet — a status page must never look busy. Signature:
 * each component's 90-day uptime bars scan in from the oldest day to today as the row scrolls
 * into view (a fast left-to-right rise, under half a second). The banner's live dot keeps its
 * pulse: it is the only loop. CSS only, behind the reduced-motion and data-motion guards; the
 * row's reveal state comes from <Reveal>.
 */
export const statusMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .st-up[data-reveal-state="pending"] .st-bar { scale: 1 0.12; }
  [data-site-shell]:not([data-motion="off"]) .st-up[data-reveal-state="in"] .st-bar {
    transform-origin: 50% 100%;
    transition: scale 260ms var(--ease-out-quint);
    transition-delay: calc(var(--st-i, 0) * 4ms);
  }
}
`;
