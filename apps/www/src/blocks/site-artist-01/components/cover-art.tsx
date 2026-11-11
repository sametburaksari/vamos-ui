import { cn } from "@vamos-ui/react";
import type { Release } from "./content";

/**
 * Typographic sleeve drawn with tokens only (no image): each release has its own pattern —
 * a setting sun, stripes, a grid, a wave or a single dot — and the title set small in a corner.
 */
export function CoverArt({ release, className, size = "md" }: { release: Release; className?: string; size?: "md" | "lg" }) {
  const p = release.cover;
  return (
    <div aria-hidden className={cn("relative aspect-square w-full overflow-hidden bg-fg text-scene", className)} data-cover={p}>
      {p === "sun" ? (
        <>
          <div className="absolute inset-x-[12%] top-[22%] aspect-square rounded-full bg-accent" />
          <div className="absolute inset-x-0 bottom-0 h-[42%] bg-fg" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="absolute inset-x-0 h-[2.2%] bg-fg" style={{ top: `${36 + i * 4.4}%` }} />
          ))}
        </>
      ) : null}
      {p === "stripes" ? <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(90deg, var(--accent) 0 9%, transparent 9% 18%)" }} /> : null}
      {p === "grid" ? (
        <div className="absolute inset-[10%] grid grid-cols-4 grid-rows-4 gap-[4%]">
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} className={cn("block", i % 5 === 0 ? "bg-accent" : "border border-scene opacity-60")} />
          ))}
        </div>
      ) : null}
      {p === "wave" ? (
        <div className="absolute inset-0 flex flex-col justify-center gap-[5%] px-[8%]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[7%] rounded-full bg-accent" style={{ marginInlineStart: `${i * 9}%`, opacity: 1 - i * 0.2 }} />
          ))}
        </div>
      ) : null}
      {p === "dot" ? <div className="absolute end-[16%] bottom-[16%] size-[18%] rounded-full bg-accent" /> : null}
      <span className={cn("absolute start-[6%] top-[5%] font-display leading-none lowercase", size === "lg" ? "text-[clamp(1.25rem,4cqi,2.25rem)]" : "text-[clamp(0.8rem,3cqi,1.1rem)]")}>
        {release.title}
      </span>
      <span className="absolute start-[6%] bottom-[5%] font-mono text-[10px] tracking-[0.12em] uppercase">mira sol</span>
    </div>
  );
}
