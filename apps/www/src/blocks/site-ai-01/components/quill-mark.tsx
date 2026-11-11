/** The Quill wordmark: a split nib drawn from two strokes, then the name. Server component. */
export function QuillMark({ className }: { className?: string }) {
  return (
    <span className={["inline-flex items-center gap-2 font-display text-lg font-semibold tracking-[-0.03em]", className].filter(Boolean).join(" ")}>
      <svg viewBox="0 0 20 24" aria-hidden className="h-5 w-auto">
        <path d="M10 1.5 C 15 6, 17 11, 10 22.5 C 3 11, 5 6, 10 1.5 Z" fill="var(--accent)" />
        <path d="M10 8 V 17" stroke="var(--accent-fg)" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="10" cy="8" r="1.6" fill="var(--accent-fg)" />
      </svg>
      Quill
    </span>
  );
}
