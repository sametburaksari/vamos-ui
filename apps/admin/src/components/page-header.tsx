export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="mb-1.5 text-[11.5px] font-medium uppercase tracking-[0.14em] text-fg-subtle">{eyebrow}</div>}
        <h1 className="font-display text-[length:calc(40px*var(--display-scale))] leading-[1.05] tracking-[-0.01em] text-fg">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-[14px] text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
