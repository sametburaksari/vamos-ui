import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { LocalizedText } from "../lib/islands";

export const skeletonVariants = cva("block bg-skeleton", {
  variants: {
    shape: {
      rect: "rounded-ui-sm",
      /** One line of text: height follows the font size. */
      text: "h-[0.8em] rounded-full",
      circle: "aspect-square rounded-full",
    },
    shimmer: { true: "ui-shimmer", false: "" },
  },
  defaultVariants: { shape: "rect", shimmer: true },
});

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

/**
 * A placeholder block while content loads. Size it with classes (`h-4 w-32`).
 * Skeletons are hidden from assistive tech; wrap a loading region in `SkeletonGroup` so it is
 * announced once (`aria-busy` + one hidden "Loading…").
 *
 * The shimmer runs in the reading direction (RTL-aware) and stops under `prefers-reduced-motion`.
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton({ className, shape, shimmer, ...props }, ref) {
  return <div ref={ref} aria-hidden data-slot="skeleton" className={cn(skeletonVariants({ shape, shimmer }), className)} {...props} />;
});

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Default 3. */
  lines?: number;
  /** Width of the last line. Default `"62%"`. */
  lastLineWidth?: string;
  shimmer?: boolean;
  /** Classes for every line (e.g. `h-3`). */
  lineClassName?: string;
}

/** Paragraph placeholder: full-width lines with a shorter last line. */
export const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(function SkeletonText(
  { lines = 3, lastLineWidth = "62%", shimmer, lineClassName, className, ...props },
  ref,
) {
  return (
    <div ref={ref} aria-hidden data-slot="skeleton-text" className={cn("grid gap-2.5 text-sm", className)} {...props}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          shape="text"
          shimmer={shimmer}
          className={lineClassName}
          style={i === lines - 1 && lines > 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
    </div>
  );
});

const AVATAR = { xs: "size-5", sm: "size-6", md: "size-8", lg: "size-10", xl: "size-14" } as const;

/** Round placeholder matching the Avatar sizes (20/24/32/40/56). */
export function SkeletonAvatar({ size = "md", shape = "circle", className, ...props }: Omit<SkeletonProps, "shape"> & { size?: keyof typeof AVATAR; shape?: "circle" | "square" }) {
  return <Skeleton shape={shape === "circle" ? "circle" : "rect"} className={cn(AVATAR[size], className)} {...props} />;
}

export interface SkeletonRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Default 4. */
  columns?: number;
  /** Leading avatar + two lines in the first column. */
  avatar?: boolean;
  shimmer?: boolean;
}

const COLUMN_WIDTHS = ["72%", "48%", "60%", "36%", "54%", "40%"];

/** A table/list row placeholder; height follows `--row-h`, padding `--cell-px`. */
export const SkeletonRow = React.forwardRef<HTMLDivElement, SkeletonRowProps>(function SkeletonRow(
  { columns = 4, avatar, shimmer, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden
      data-slot="skeleton-row"
      className={cn("grid h-(--row-h) items-center gap-4 border-b border-line px-(--cell-px) text-sm last:border-b-0", className)}
      style={{ gridTemplateColumns: `minmax(0,2fr) repeat(${Math.max(columns - 1, 0)}, minmax(0,1fr))` }}
      {...props}
    >
      {Array.from({ length: columns }, (_, i) =>
        i === 0 && avatar ? (
          <div key={i} className="flex min-w-0 items-center gap-3">
            <SkeletonAvatar size="md" shimmer={shimmer} />
            <div className="grid min-w-0 flex-1 gap-1.5">
              <Skeleton shape="text" shimmer={shimmer} style={{ width: "70%" }} />
              <Skeleton shape="text" shimmer={shimmer} className="h-[0.65em]" style={{ width: "45%" }} />
            </div>
          </div>
        ) : (
          <Skeleton key={i} shape="text" shimmer={shimmer} style={{ width: COLUMN_WIDTHS[i % COLUMN_WIDTHS.length] }} />
        ),
      )}
    </div>
  );
});

const skeletonLabels = { loading: "Loading…" };

export interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Announced once for the whole region. Default from the dictionary (`skeleton.loading`). */
  label?: string;
  /** While `false`, children render normally and the region is no longer busy. Default `true`. */
  loading?: boolean;
}

/**
 * Wraps a loading region: sets `aria-busy` and announces one hidden status text instead of
 * reading every skeleton.
 *
 * ```tsx
 * <SkeletonGroup loading={isLoading}>{isLoading ? <SkeletonText /> : <Article />}</SkeletonGroup>
 * ```
 */
export const SkeletonGroup = React.forwardRef<HTMLDivElement, SkeletonGroupProps>(function SkeletonGroup(
  { label, loading = true, children, ...props },
  ref,
) {
  return (
    <div ref={ref} data-slot="skeleton-group" aria-busy={loading || undefined} {...props}>
      {loading ? (
        <span role="status" className="sr-only">
          {label ?? <LocalizedText namespace="skeleton" id="loading" defaults={skeletonLabels} />}
        </span>
      ) : null}
      {children}
    </div>
  );
});
