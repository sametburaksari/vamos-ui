/** The Loam wordmark: a seed splitting into two leaves, then the name. Server component. */
export function LoamMark({ className }: { className?: string }) {
  return (
    <span className={["inline-flex items-center gap-2 font-display text-[1.35rem] leading-none tracking-[-0.02em]", className].filter(Boolean).join(" ")}>
      <svg viewBox="0 0 24 24" aria-hidden className="size-6">
        <path d="M12 21 V 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M12 12 C 12 7, 8 4, 3.5 4.5 C 3.5 9, 7 12.5, 12 12 Z" fill="var(--accent)" />
        <path d="M12 14.5 C 12 10.5, 15.5 8, 20.5 8.5 C 20 12.5, 16.5 15, 12 14.5 Z" fill="currentColor" opacity="0.85" />
      </svg>
      loam
    </span>
  );
}
