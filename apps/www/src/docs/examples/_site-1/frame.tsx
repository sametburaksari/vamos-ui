"use client";

import * as React from "react";

/**
 * Docs-only preview frame (not part of the kit). Site blocks lay out by container width, so this
 * renders them at a real desktop width (1280px) and scales the result to fit the preview box.
 * Pass `width={390}` to see the phone layout. In your site, render the block directly.
 */
export function SiteFrame({ children, width = 1280, className }: { children: React.ReactNode; width?: number; className?: string }) {
  const outer = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState<number | null>(null);
  React.useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox(e!.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const zoom = box && box < width ? box / width : 1;
  return (
    <div ref={outer} className={`w-full ${className ?? ""}`}>
      <div
        className="vb-scope relative mx-auto overflow-hidden rounded-ui border border-line bg-scene"
        style={{ width: box ? Math.min(width, box / zoom) : "100%", zoom, "--vb-unzoom": 1 / zoom } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
