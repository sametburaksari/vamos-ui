import * as React from "react";
import { cn } from "../lib/cn";

export interface TickerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Seconds for one full loop. Default 40. */
  duration?: number;
  /** Which way the strip travels (mirrored in RTL). Default `"start"`. */
  direction?: "start" | "end";
  /** Element for each copy of the items, e.g. `"ul"` when the children are `li`. Default `"div"`. */
  as?: "div" | "ul" | "ol";
  /** Space between items (any CSS length). Default `clamp(2.5rem, 6cqi, 4.5rem)`. */
  gap?: string;
  /** Fade the start and end edges. Default true. */
  fade?: boolean;
  /**
   * A small pause control (a native checkbox — works without JavaScript). Moving content that
   * lasts longer than five seconds needs one (WCAG 2.2.2). Default true.
   */
  controls?: boolean;
  /** Accessible name of the pause control. Default `"Pause animation"`. */
  pauseLabel?: string;
  /** Names the list of items (it lands on the first copy, e.g. the `ul`). */
  "aria-label"?: string;
  /** Classes for each copy of the items. */
  groupClassName?: string;
}

/**
 * The motion kit's marquee: an endless strip of logos or words that follows the motion level. Pure CSS (server component): the items are rendered
 * twice and the track slides by one copy. The copy is `aria-hidden` and `inert`, so assistive
 * tech and the keyboard meet every item once. Pauses on hover and focus and with its pause
 * control; under reduced motion or `data-motion="off"` it becomes a static, wrapped row.
 *
 * ```tsx
 * <Ticker as="ul" duration={30}>{logos.map((l) => <li key={l.name}>…</li>)}</Ticker>
 * ```
 */
export const Ticker = React.forwardRef<HTMLDivElement, TickerProps>(function Ticker(
  { duration = 40, direction = "start", as: Group = "div", gap, fade = true, controls = true, pauseLabel = "Pause animation", groupClassName, className, style, children, "aria-label": ariaLabel, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-direction={direction}
      data-fade={fade ? "" : undefined}
      className={cn("vm-marquee", className)}
      style={{ "--vm-marquee-duration": `${duration}s`, ...(gap ? { "--vm-marquee-gap": gap } : null), ...style } as React.CSSProperties}
      {...props}
    >
      <div className="vm-marquee-viewport">
        <div className="vm-marquee-track">
          <Group className={cn("vm-marquee-group", groupClassName)} aria-label={ariaLabel}>
            {children}
          </Group>
          <Group className={cn("vm-marquee-group", groupClassName)} aria-hidden="true" inert data-marquee-copy="">
            {children}
          </Group>
        </div>
      </div>
      {controls ? (
        <label className="vm-marquee-toggle">
          <input type="checkbox" className="vm-marquee-pause sr-only" aria-label={pauseLabel} />
          <svg aria-hidden="true" viewBox="0 0 16 16" className="vm-marquee-icon-pause">
            <rect x="4" y="3" width="2.5" height="10" rx="0.5" />
            <rect x="9.5" y="3" width="2.5" height="10" rx="0.5" />
          </svg>
          <svg aria-hidden="true" viewBox="0 0 16 16" className="vm-marquee-icon-play">
            <path d="M5 3.2v9.6a.5.5 0 0 0 .77.42l7.2-4.8a.5.5 0 0 0 0-.84l-7.2-4.8A.5.5 0 0 0 5 3.2Z" />
          </svg>
        </label>
      ) : null}
    </div>
  );
});
