/**
 * The office mark: a plain shield with three wave lines for the river, drawn in the accent,
 * next to the name in two weights. Decorative SVG; the name is real text.
 */
export function DistrictMark({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg aria-hidden viewBox="0 0 28 32" className="h-8 w-7 shrink-0">
        <path d="M2 2h24v14c0 8-6 12.5-12 14C8 28.5 2 24 2 16Z" fill="var(--accent)" />
        <path d="M6 13c2.7-2 5.3 2 8 0s5.3-2 8 0M6 18c2.7-2 5.3 2 8 0s5.3-2 8 0M8 23c2-1.5 4 1.5 6 0s4-1.5 6 0" fill="none" stroke="var(--accent-fg)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="text-[0.9375rem] leading-[1.1] font-bold tracking-[-0.01em] text-fg">{name}</span>
    </span>
  );
}
