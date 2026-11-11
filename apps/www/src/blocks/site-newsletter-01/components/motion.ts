/**
 * Slow Desk motion: quiet, like turning a page — gentle fades, longer ease, nothing that flashes.
 * Signature: the postmark lands on the latest letter (a soft stamp — down from a little above
 * and larger, once) after the nameplate's double rule has been drawn across the page. CSS only,
 * behind the reduced-motion and data-motion guards.
 */
export const deskMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .sd-rule {
    animation: sd-rule 1100ms var(--ease-in-out) 250ms backwards;
  }
  [data-site-shell]:not([data-motion="off"]) .sd-stamp {
    animation: sd-stamp 460ms var(--ease-out-quint) 1150ms backwards;
  }
}
@keyframes sd-rule { from { transform: scaleX(0); } }
@keyframes sd-stamp {
  0% { opacity: 0; transform: scale(1.5); }
  70% { opacity: 1; transform: scale(0.96); }
  100% { transform: none; }
}
`;
