"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "../../lib/cn";

export interface HeroVideoProps {
  /** MP4 source. */
  src: string;
  /** Required: shown before playback, on failure and under reduced motion. */
  poster: string;
  pauseLabel: string;
  playLabel: string;
  className?: string;
}

/**
 * Muted, looping background video for the full-bleed hero (~1 KB island). Pause button for
 * WCAG 2.2.2; under `prefers-reduced-motion` it never autoplays and shows the poster.
 */
export function HeroVideo({ src, poster, pauseLabel, playLabel, className }: HeroVideoProps) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    v.play()?.then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  return (
    <>
      <video
        ref={ref}
        className={cn("absolute inset-0 size-full object-cover", className)}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        tabIndex={-1}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      <button
        type="button"
        aria-label={playing ? pauseLabel : playLabel}
        aria-pressed={!playing}
        className="vb-hero-video-toggle absolute end-(--gutter) top-[calc(var(--vb-nav-h,4.5rem)+1rem)] z-10 inline-flex size-9 items-center justify-center rounded-full border border-[color-mix(in_oklch,var(--fg)_35%,transparent)] text-fg transition-colors hover:bg-hover focus-ring"
        onClick={() => {
          const v = ref.current;
          if (!v) return;
          if (v.paused) void v.play()?.catch(() => undefined);
          else v.pause();
        }}
      >
        {playing ? <Pause aria-hidden strokeWidth={1.5} className="size-4" /> : <Play aria-hidden strokeWidth={1.5} className="size-4" />}
      </button>
    </>
  );
}
