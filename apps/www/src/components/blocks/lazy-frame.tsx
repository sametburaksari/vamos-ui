"use client";

import * as React from "react";
import { Skeleton } from "@vamos-ui/react";

/**
 * An iframe that mounts only when it scrolls near the viewport (600px ahead), so a page of
 * twenty full-screen blocks doesn't boot twenty apps at once. Once mounted it stays mounted.
 */
export function LazyFrame({ src, title, className }: { src: string; title: string; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`} aria-busy={!loaded || undefined}>
      {!loaded ? (
        <div aria-hidden className="absolute inset-0 grid grid-cols-[200px_minmax(0,1fr)] gap-4 p-4 max-md:grid-cols-1">
          <Skeleton className="h-full rounded-ui max-md:hidden" />
          <div className="grid content-start gap-3">
            <Skeleton className="h-10 rounded-ui" />
            <Skeleton className="h-28 rounded-ui" />
            <Skeleton className="h-64 rounded-ui" />
          </div>
        </div>
      ) : null}
      {visible ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className="relative block h-full w-full border-0 bg-scene transition-opacity duration-300 motion-reduce:transition-none"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      ) : null}
    </div>
  );
}
