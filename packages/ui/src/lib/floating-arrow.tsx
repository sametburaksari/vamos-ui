import * as React from "react";

export interface FloatingArrowProps extends React.SVGAttributes<SVGSVGElement> {
  /** Fill colour (a CSS value, usually a token). Default: `var(--popover)`. */
  fill?: string;
  /** Hairline colour along the two slanted edges. `"none"` for no edge. Default: `var(--popover-border)`. */
  stroke?: string;
}

/**
 * The arrow shape used by floating layers (Popover, Tooltip, Hover Card). Pass it through the
 * Radix `Arrow` part with `asChild` so Radix positions it:
 *
 * ```tsx
 * <Popover.Arrow asChild width={14} height={7}><FloatingArrow /></Popover.Arrow>
 * ```
 *
 * Only the two slanted edges are stroked, so the arrow melts into the layer's own border.
 */
export const FloatingArrow = /*#__PURE__*/ React.forwardRef<SVGSVGElement, FloatingArrowProps>(function FloatingArrow(
  { fill = "var(--popover)", stroke = "var(--popover-border)", width = 14, height = 7, style, ...props },
  ref,
) {
  return (
    <svg ref={ref} width={width} height={height} viewBox="0 0 14 7" aria-hidden focusable="false" style={{ display: "block", overflow: "visible", ...style }} {...props}>
      {/* overlap the layer edge by 1px so the border line under the arrow is covered */}
      <path d="M0 -1 L7 6.2 L14 -1 Z" fill={fill} />
      {stroke !== "none" ? <path d="M0 0 L7 6.2 L14 0" fill="none" stroke={stroke} strokeWidth={1} vectorEffect="non-scaling-stroke" /> : null}
    </svg>
  );
});
