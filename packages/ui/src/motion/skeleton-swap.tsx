"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { motionAllowed } from "./core";
import { useIsoLayoutEffect } from "./reveal";

export interface SkeletonSwapProps extends React.HTMLAttributes<HTMLDivElement> {
  /** While true the skeleton shows; when it turns false the content cross-fades in over it. */
  loading: boolean;
  /** The placeholder. Give it the content's size so the box does not jump when it leaves. */
  skeleton: React.ReactNode;
}

/**
 * Skeleton → content without a flash: both share one grid cell, the content fades in while the
 * skeleton fades out, then the skeleton unmounts. `aria-busy` while loading. Content that is
 * there from the first render never animates; reduced motion swaps at once.
 *
 * ```tsx
 * <SkeletonSwap loading={isLoading} skeleton={<InvoiceSkeleton />}><InvoiceTable rows={rows} /></SkeletonSwap>
 * ```
 */
export const SkeletonSwap = /*#__PURE__*/ React.forwardRef<HTMLDivElement, SkeletonSwapProps>(function SkeletonSwap({ loading, skeleton, className, children, ...props }, ref) {
  const inner = React.useRef<HTMLDivElement | null>(null);
  const [prevLoading, setPrevLoading] = React.useState(loading);
  const [leaving, setLeaving] = React.useState(false);
  // Derived from the previous prop (React's "adjust state while rendering" pattern): the frame
  // that flips loading → false already renders both layers, so nothing blinks.
  if (prevLoading !== loading) {
    setPrevLoading(loading);
    setLeaving(!loading);
  }

  useIsoLayoutEffect(() => {
    if (!leaving) return;
    if (!motionAllowed(inner.current)) {
      setLeaving(false);
      return;
    }
    const t = setTimeout(() => setLeaving(false), 700); // safety net if animationend never fires
    return () => clearTimeout(t);
  }, [leaving]);

  return (
    <div
      ref={(node) => {
        inner.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      aria-busy={loading || undefined}
      data-loading={loading ? "" : undefined}
      className={cn("vm-swap", className)}
      {...props}
    >
      {loading ? null : (
        <div className="vm-swap-content" data-entering={leaving ? "" : undefined}>
          {children}
        </div>
      )}
      {loading || leaving ? (
        <div className="vm-swap-skeleton" aria-hidden={!loading || undefined} data-leaving={loading ? undefined : ""} onAnimationEnd={(e) => e.target === e.currentTarget && setLeaving(false)}>
          {skeleton}
        </div>
      ) : null}
    </div>
  );
});
