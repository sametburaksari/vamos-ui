/**
 * Lumen Room motion: photographic and exact — short, precise, black and white. Signature: the
 * hero frame develops like a print: the crop marks close in on the picture, the photograph comes
 * up out of an over-exposed white, and the frame counter appears last. The contact-sheet total
 * re-develops (a quick fade from light) whenever the quote changes. CSS only, behind the
 * reduced-motion and data-motion guards.
 */
export const studioMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .lr-mark { animation: lr-mark 520ms var(--ease-out-quint) 380ms backwards; }
  [data-site-shell]:not([data-motion="off"]) .lr-mark-ts { --lr-x: -14px; --lr-y: -14px; }
  [data-site-shell]:not([data-motion="off"]) .lr-mark-te { --lr-x: 14px; --lr-y: -14px; }
  [data-site-shell]:not([data-motion="off"]) .lr-mark-bs { --lr-x: -14px; --lr-y: 14px; }
  [data-site-shell]:not([data-motion="off"]) .lr-mark-be { --lr-x: 14px; --lr-y: 14px; }
  [data-site-shell]:not([data-motion="off"]) .lr-develop img { animation: lr-develop 1100ms var(--ease-out-quint) 520ms backwards; }
  [data-site-shell]:not([data-motion="off"]) .lr-counter { animation: lr-fade 260ms linear 1500ms backwards; }
  [data-site-shell]:not([data-motion="off"]) .lr-tick { animation: lr-tick 320ms var(--ease-out-quint); }
}
@keyframes lr-mark { from { opacity: 0; transform: translate(var(--lr-x, 0), var(--lr-y, 0)); } }
@keyframes lr-develop { from { filter: grayscale(1) brightness(2.4) contrast(0.5); } }
@keyframes lr-fade { from { opacity: 0; } }
@keyframes lr-tick { from { opacity: 0.25; filter: blur(2px); } }
`;
