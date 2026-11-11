/**
 * The forum mark: four squares set on a circle — four makers at one bench — and the name.
 * Decorative SVG in the accent; the name is real text.
 */
export function CircleMark() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg aria-hidden viewBox="0 0 24 24" className="size-6 shrink-0">
        <circle cx="12" cy="12" r="10.5" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        <rect x="9.5" y="2.5" width="5" height="5" rx="1" fill="var(--accent)" />
        <rect x="16.5" y="9.5" width="5" height="5" rx="1" fill="var(--accent)" />
        <rect x="9.5" y="16.5" width="5" height="5" rx="1" fill="var(--accent)" />
        <rect x="2.5" y="9.5" width="5" height="5" rx="1" fill="var(--fg)" />
      </svg>
      <span className="text-[0.9375rem] font-bold tracking-[-0.015em] text-fg">Builders Circle</span>
    </span>
  );
}
