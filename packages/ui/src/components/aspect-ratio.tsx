import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/** `"16/9"`, `"4/3"`, `"1/1"`… or a number (`1.5`). */
export type AspectRatioValue = `${number}/${number}` | number;

/** `"16/9"` → 1.777…, `"16:9"` → 1.777…, `1.5` → 1.5. Invalid values return `undefined`. */
export function parseAspectRatio(ratio: AspectRatioValue | string | undefined): number | undefined {
  if (typeof ratio === "number") return Number.isFinite(ratio) && ratio > 0 ? ratio : undefined;
  if (!ratio) return undefined;
  const [w, h] = ratio.split(/[/:]/).map((s) => Number(s.trim()));
  if (w && h && w > 0 && h > 0) return w / h;
  const n = Number(ratio);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export const aspectRatioVariants = cva("relative isolate block w-full overflow-hidden", {
  variants: {
    rounded: { none: "", ui: "rounded-ui", "ui-lg": "rounded-ui-lg", full: "rounded-full" },
    /** How a direct `img` / `video` child fills the box. */
    fit: { cover: "[&>img]:object-cover [&>video]:object-cover", contain: "[&>img]:object-contain [&>video]:object-contain", fill: "[&>img]:object-fill [&>video]:object-fill" },
    /** `inset`: a `surface-2` backdrop (letterboxing for `contain`, a frame while an iframe loads). */
    tone: { none: "", inset: "bg-surface-2" },
  },
  defaultVariants: { rounded: "none", fit: "cover", tone: "none" },
});

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof aspectRatioVariants> {
  /** Width ÷ height. `"16/9"` (default), `"4/3"`, `"1/1"`, `"21/9"` or a number. */
  ratio?: AspectRatioValue;
}

/**
 * Keeps a box at a fixed ratio whatever its width, and stretches the direct child to fill it —
 * an iframe, a video, a map, an image or any element. Pure CSS (`aspect-ratio`), server-safe.
 *
 * ```tsx
 * <AspectRatio ratio="16/9" rounded="ui-lg">
 *   <iframe src="https://www.youtube-nocookie.com/embed/…" title="Product tour" />
 * </AspectRatio>
 * ```
 */
export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = "16/9", rounded, fit, tone, className, style, children, ...props },
  ref,
) {
  const value = parseAspectRatio(ratio) ?? 16 / 9;
  return (
    <div
      ref={ref}
      data-slot="aspect-ratio"
      className={cn(
        aspectRatioVariants({ rounded, fit, tone }),
        // The child fills the box; iframes lose their default border.
        "[&>*]:absolute [&>*]:inset-0 [&>*]:size-full [&>iframe]:border-0",
        className,
      )}
      style={{ aspectRatio: String(value), ...style }}
      {...props}
    >
      {children}
    </div>
  );
});
