/** The Loam wordmark with a "Help" tag (same seed mark as the Loam waitlist site). Server component. */
export function LoamHelpMark({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 24 24" aria-hidden className="size-6">
        <path d="M12 21 V 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M12 12 C 12 7, 8 4, 3.5 4.5 C 3.5 9, 7 12.5, 12 12 Z" fill="var(--accent)" />
        <path d="M12 14.5 C 12 10.5, 15.5 8, 20.5 8.5 C 20 12.5, 16.5 15, 12 14.5 Z" fill="currentColor" opacity="0.85" />
      </svg>
      <span className="text-lg font-semibold tracking-[-0.02em]">loam</span>{" "}
      <span className="rounded-full border border-line px-2 py-0.5 text-xs font-medium text-fg-muted">{label}</span>
    </span>
  );
}
