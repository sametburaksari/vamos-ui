import * as React from "react";
import * as Slot from "radix-ui/slot";
import type { MotionLevel } from "./core";

export interface MotionScopeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** full: longer, wider, word-by-word · subtle: short fades and small rises (default) · off: final state, no animation. */
  level: MotionLevel;
  asChild?: boolean;
}

/**
 * Sets the motion level for everything inside (`data-motion`). SiteShell does this for a site
 * via its `motion` prop; use MotionScope for any other subtree. `data-motion="off"` on `<html>`
 * overrides every scope, and so does the reduced-motion setting.
 *
 * ```tsx
 * <MotionScope level="full"><Stagger>…</Stagger></MotionScope>
 * ```
 */
export const MotionScope = /*#__PURE__*/ React.forwardRef<HTMLDivElement, MotionScopeProps>(function MotionScope({ level, asChild, ...props }, ref) {
  const Comp = asChild ? Slot.Root : "div";
  return <Comp ref={ref} data-motion={level} {...props} />;
});
