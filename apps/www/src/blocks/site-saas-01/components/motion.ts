/**
 * Relay motion: crisp and quick — a product that answers fast. Signature: the inbox in the hero
 * plays its one conversation once on load: threads slide into the list, the guest's message
 * arrives, then the front desk's reply and the "booking created" note, then the tags snap on.
 * CSS only, behind the reduced-motion and data-motion guards; nothing loops.
 */
export const relayMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  [data-site-shell]:not([data-motion="off"]) .rl-thread {
    animation: rl-in 380ms var(--ease-out-quint) backwards;
    animation-delay: calc(700ms + var(--rl-i, 0) * 70ms);
  }
  [data-site-shell]:not([data-motion="off"]) .rl-msg-in { transform-origin: 0 100%; animation: rl-bubble 360ms var(--ease-spring) 1150ms backwards; }
  [data-site-shell]:not([data-motion="off"]) .rl-msg-out { transform-origin: 100% 100%; animation: rl-bubble 360ms var(--ease-spring) 1750ms backwards; }
  [data-site-shell]:not([data-motion="off"]) .rl-note { animation: rl-fade 300ms linear 2050ms backwards; }
  [data-site-shell]:not([data-motion="off"]) .rl-tag { animation: rl-tag 280ms var(--ease-spring) backwards; animation-delay: calc(2200ms + var(--rl-i, 0) * 90ms); }
  [dir="rtl"] [data-site-shell]:not([data-motion="off"]) .rl-msg-in { transform-origin: 100% 100%; }
  [dir="rtl"] [data-site-shell]:not([data-motion="off"]) .rl-msg-out { transform-origin: 0 100%; }
}
@keyframes rl-in { from { opacity: 0; transform: translate3d(-10px, 0, 0); } }
@keyframes rl-bubble { from { opacity: 0; transform: scale(0.86) translate3d(0, 6px, 0); } }
@keyframes rl-fade { from { opacity: 0; } }
@keyframes rl-tag { from { opacity: 0; transform: scale(0.7); } }
`;
