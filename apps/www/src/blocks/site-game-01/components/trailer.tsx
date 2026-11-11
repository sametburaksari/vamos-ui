import { cn } from "@vamos-ui/react";
import { EmbedFacade } from "@vamos-ui/react/blocks";
import { Play } from "lucide-react";

/** "2:14" from seconds. */
export const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** A still in the game's look: desaturated photo, ember-toned, with a soft vignette. */
export function EmberStill({ src, width, height, alt, className, priority }: { src: string; width: number; height: number; alt: string; className?: string; priority?: boolean }) {
  return (
    <span className={cn("relative block overflow-hidden bg-scene", className)}>
      <img src={src} width={width} height={height} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} className="size-full object-cover brightness-[0.8] contrast-[1.15] grayscale" />
      <span aria-hidden className="absolute inset-0 bg-accent opacity-55 mix-blend-color" />
      <span aria-hidden className="absolute inset-0 [background:radial-gradient(120%_90%_at_50%_45%,transparent_40%,var(--scene)_100%)] opacity-80" />
    </span>
  );
}

/**
 * The signature of the Ember Atlas site: a trailer facade. A static still with a play button —
 * the video (and its network requests) load only when someone presses play; focus moves into it.
 */
export function TrailerFacade({
  src,
  title,
  playLabel,
  duration,
  meta,
  poster,
  size = "lg",
  className,
}: {
  src: string;
  title: string;
  playLabel: string;
  duration: number;
  meta?: string;
  poster: { src: string; width: number; height: number; alt: string };
  size?: "lg" | "sm";
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-ui border border-line bg-scene", className)} data-trailer="">
      <EmbedFacade kind="video" src={src} title={title} buttonLabel={`${playLabel}: ${title} (${clock(duration)})`}>
        <EmberStill {...poster} alt="" className="absolute inset-0 transition-transform duration-700 group-hover/facade:scale-[1.03] motion-reduce:transition-none" priority={size === "lg"} />
        <span className="absolute inset-0 grid place-items-center">
          <span
            className={cn(
              "grid place-items-center rounded-full bg-accent text-accent-fg shadow-[0_0_0_10px_color-mix(in_srgb,var(--accent)_22%,transparent)] transition-transform group-hover/facade:scale-105 motion-reduce:transition-none",
              size === "lg" ? "size-20 [&_svg]:size-8" : "size-12 [&_svg]:size-5",
            )}
          >
            <Play aria-hidden className="ms-1 fill-current" />
          </span>
        </span>
        <span className={cn("absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4", size === "lg" && "sm:p-6")}>
          <span className="min-w-0">
            <span className={cn("block font-display leading-tight text-fg", size === "lg" ? "text-xl sm:text-2xl" : "text-base")}>{title}</span>
            {meta ? <span className="mt-0.5 block font-mono text-[11px] text-fg-muted">{meta}</span> : null}
          </span>
          <span className="shrink-0 rounded-ui-sm bg-scene/80 px-2 py-1 font-mono text-xs text-fg tabular">{clock(duration)}</span>
        </span>
      </EmbedFacade>
    </div>
  );
}
