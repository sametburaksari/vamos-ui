"use client";

import * as React from "react";
import * as RadixScrollArea from "radix-ui/scroll-area";
import { cn } from "../lib/cn";
import { useComposedRefs } from "../lib/compose-refs";
import { useEdgeFade } from "../lib/use-edge-fade";
import { useIsomorphicLayoutEffect } from "../lib/use-controllable-state";

type BarSize = "sm" | "md";
const BarSizeContext = /*#__PURE__*/ React.createContext<BarSize>("sm");

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';

export interface ScrollAreaProps extends Omit<React.ComponentPropsWithoutRef<typeof RadixScrollArea.Root>, "dir"> {
  /** Which scrollbars to render. Default `"vertical"`. */
  orientation?: "vertical" | "horizontal" | "both";
  /** Max height of the viewport (number = px). The area grows with content up to this. */
  maxHeight?: number | string;
  /** Edge fade mask on the scrolling axis; removed at the edges. */
  fade?: boolean;
  /** Scrollbar thickness. Default `"sm"`. */
  size?: BarSize;
  /** Ref to the scrolling viewport (for scroll position, virtualisation, scroll-to-top). */
  viewportRef?: React.Ref<HTMLDivElement>;
  /** Class names for the viewport element. */
  viewportClassName?: string;
  /** Names the scroll region for screen readers (adds `role="region"`). Recommended when the region is focusable. */
  "aria-label"?: string;
  dir?: "ltr" | "rtl";
}

/**
 * A consistent thin scrollbar for bounded, embedded regions: popover and command lists, the
 * notification panel, kanban columns, horizontal chip strips, code blocks.
 *
 * ```tsx
 * <ScrollArea maxHeight={320} fade aria-label="Recent activity">…</ScrollArea>
 * <ScrollArea orientation="horizontal" fade><div className="flex gap-2 w-max">…</div></ScrollArea>
 * ```
 *
 * Native scrolling is preserved. Keep the page body and Sidebar on native scrolling — ScrollArea is
 * only for embedded regions (performance and iOS momentum). The viewport is keyboard-focusable only
 * when its content has nothing focusable of its own.
 */
export const ScrollArea = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  {
    orientation = "vertical",
    maxHeight,
    fade,
    size = "sm",
    type = "hover",
    viewportRef,
    viewportClassName,
    className,
    children,
    style,
    "aria-label": ariaLabel,
    ...props
  },
  ref,
) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const composed = useComposedRefs<HTMLDivElement>(viewportRef, innerRef);
  const axis = orientation === "horizontal" ? "x" : "y";
  useEdgeFade(innerRef, axis, Boolean(fade) && orientation !== "both");

  // Focusable only when nothing inside can take focus (keyboard users can still scroll).
  const [focusable, setFocusable] = React.useState(false);
  useIsomorphicLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const check = () => {
      const scrolls = el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
      setFocusable(scrolls && !el.querySelector(FOCUSABLE));
    };
    check();
    const mo = typeof MutationObserver !== "undefined" ? new MutationObserver(check) : undefined;
    mo?.observe(el, { childList: true, subtree: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(check) : undefined;
    ro?.observe(el);
    return () => {
      mo?.disconnect();
      ro?.disconnect();
    };
  }, []);

  return (
    <BarSizeContext.Provider value={size}>
      <RadixScrollArea.Root ref={ref} type={type} data-slot="scroll-area" className={cn("relative overflow-hidden", className)} style={style} {...props}>
        <RadixScrollArea.Viewport
          ref={composed}
          data-slot="scroll-area-viewport"
          data-orientation={orientation}
          data-edge-fade={fade && orientation !== "both" ? axis : undefined}
          tabIndex={focusable ? 0 : undefined}
          role={ariaLabel ? "region" : undefined}
          aria-label={ariaLabel}
          className={cn("size-full rounded-[inherit] outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring", viewportClassName)}
          style={maxHeight !== undefined ? { maxHeight } : undefined}
        >
          {children}
        </RadixScrollArea.Viewport>
        {orientation !== "horizontal" ? <ScrollBar orientation="vertical" /> : null}
        {orientation !== "vertical" ? <ScrollBar orientation="horizontal" /> : null}
        <RadixScrollArea.Corner />
      </RadixScrollArea.Root>
    </BarSizeContext.Provider>
  );
});

export interface ScrollBarProps extends React.ComponentPropsWithoutRef<typeof RadixScrollArea.Scrollbar> {
  size?: BarSize;
}

/** A scrollbar for `ScrollArea`. Rendered automatically from `orientation`; use it directly for custom layouts. */
export const ScrollBar = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ScrollBarProps>(function ScrollBar({ orientation = "vertical", size, className, ...props }, ref) {
  const ctxSize = React.useContext(BarSizeContext);
  const s = size ?? ctxSize;
  return (
    <RadixScrollArea.Scrollbar
      ref={ref}
      orientation={orientation}
      data-slot="scroll-area-bar"
      className={cn(
        "z-(--z-sticky) flex touch-none select-none p-px transition-[opacity,background-color] duration-150",
        "data-[state=hidden]:opacity-0 data-[state=visible]:opacity-100",
        orientation === "vertical" ? (s === "sm" ? "w-2" : "w-2.5") : s === "sm" ? "h-2 flex-col" : "h-2.5 flex-col",
        orientation === "vertical" ? "h-full border-s border-s-transparent" : "border-t border-t-transparent",
        "hover:bg-[color-mix(in_srgb,var(--track)_50%,transparent)]",
        className,
      )}
      {...props}
    >
      <RadixScrollArea.Thumb data-slot="scroll-area-thumb" className="relative flex-1 rounded-full before:absolute before:top-1/2 before:left-1/2 before:size-full before:min-h-8 before:min-w-8 before:-translate-x-1/2 before:-translate-y-1/2" />
    </RadixScrollArea.Scrollbar>
  );
});
