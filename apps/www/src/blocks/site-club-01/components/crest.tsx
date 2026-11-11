import { cn } from "@vamos-ui/react";

/** The club crest: a shield with harbour hoops and a lighthouse star. Drawn in tokens only. */
export function Crest({ className, title, id = "hcfc-shield" }: { className?: string; title?: string; /** Unique per instance on a page. */ id?: string }) {
  return (
    <svg viewBox="0 0 40 48" className={cn("shrink-0", className)} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <clipPath id={id}>
          <path d="M20 1 38 6v17c0 12-8 20-18 24C10 43 2 35 2 23V6Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="40" height="48" fill="var(--scene)" />
        {[14, 24, 34].map((y) => (
          <rect key={y} y={y} width="40" height="5" fill="var(--accent)" />
        ))}
        <path d="m20 4 1.9 4.6 4.9.4-3.7 3.2 1.1 4.8L20 14.4 15.8 17l1.1-4.8L13.2 9l4.9-.4Z" fill="var(--fg)" />
      </g>
      <path d="M20 1 38 6v17c0 12-8 20-18 24C10 43 2 35 2 23V6Z" fill="none" stroke="var(--fg)" strokeWidth="2" />
    </svg>
  );
}

/** Horizontal hoops — the club's kit, used as a divider and on photos. */
export function Hoops({ className }: { className?: string }) {
  return <div aria-hidden className={cn("[background:repeating-linear-gradient(180deg,var(--accent)_0_10px,transparent_10px_20px)]", className)} />;
}
