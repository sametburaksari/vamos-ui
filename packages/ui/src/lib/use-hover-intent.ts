import * as React from "react";
import { useControllableState, useLatest } from "./use-controllable-state";

export interface UseHoverIntentOptions {
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** ms the pointer must rest on the trigger before opening. Default 150. */
  openDelay?: number;
  /** ms after leaving before closing. Default 200. */
  closeDelay?: number;
  /** Keep open while the pointer travels from the trigger towards the content ("safe triangle"). Default `true`. */
  safeTriangle?: boolean;
  /** Also open on keyboard focus. Default `true`. */
  openOnFocus?: boolean;
  disabled?: boolean;
}

type Point = { x: number; y: number };

function insideTriangle(p: Point, a: Point, b: Point, c: Point): boolean {
  const s = (p1: Point, p2: Point, p3: Point) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  const d1 = s(p, a, b);
  const d2 = s(p, b, c);
  const d3 = s(p, c, a);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

/** The two corners of `rect` that face `from`, forming a triangle with it. */
function facingCorners(from: Point, r: DOMRect): [Point, Point] {
  if (from.x <= r.left) return [{ x: r.left, y: r.top }, { x: r.left, y: r.bottom }];
  if (from.x >= r.right) return [{ x: r.right, y: r.top }, { x: r.right, y: r.bottom }];
  if (from.y <= r.top) return [{ x: r.left, y: r.top }, { x: r.right, y: r.top }];
  return [{ x: r.left, y: r.bottom }, { x: r.right, y: r.bottom }];
}

/**
 * Hover-to-open with delays and a safe triangle — for sidebar flyouts, hover cards and
 * navigation menus. Touch pointers are ignored (tap the trigger instead).
 *
 * ```tsx
 * const hover = useHoverIntent({ openDelay: 120 });
 * <button {...hover.triggerProps}>Posts</button>
 * {hover.open && <div ref={hover.contentRef} {...hover.contentProps}>…</div>}
 * ```
 */
export function useHoverIntent(options: UseHoverIntentOptions = {}) {
  const { openDelay = 150, closeDelay = 200, safeTriangle = true, openOnFocus = true, disabled = false } = options;
  const [open, setOpen] = useControllableState({ value: options.open, defaultValue: options.defaultOpen ?? false, onChange: options.onOpenChange, name: "useHoverIntent" });
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const contentEl = React.useRef<HTMLElement | null>(null);
  const moveCleanup = React.useRef<(() => void) | null>(null);
  const setOpenRef = useLatest(setOpen);

  const clear = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = undefined;
  }, []);
  const stopTracking = React.useCallback(() => {
    moveCleanup.current?.();
    moveCleanup.current = null;
  }, []);
  const schedule = React.useCallback(
    (next: boolean, delay: number) => {
      clear();
      if (delay <= 0) setOpenRef.current(next);
      else timer.current = setTimeout(() => setOpenRef.current(next), delay);
    },
    [clear, setOpenRef],
  );

  React.useEffect(() => () => (clear(), stopTracking()), [clear, stopTracking]);

  const isMouse = (e: React.PointerEvent) => e.pointerType === "mouse" || e.pointerType === "pen";

  const onTriggerLeave = (e: React.PointerEvent) => {
    if (!isMouse(e) || disabled) return;
    const el = contentEl.current;
    if (!safeTriangle || !el || !open) return schedule(false, closeDelay);
    const exit = { x: e.clientX, y: e.clientY };
    const [b, c] = facingCorners(exit, el.getBoundingClientRect());
    stopTracking();
    const onMove = (ev: PointerEvent) => {
      const p = { x: ev.clientX, y: ev.clientY };
      if (insideTriangle(p, exit, b, c)) schedule(false, closeDelay * 2);
      else {
        stopTracking();
        schedule(false, closeDelay);
      }
    };
    document.addEventListener("pointermove", onMove);
    moveCleanup.current = () => document.removeEventListener("pointermove", onMove);
    schedule(false, closeDelay * 2);
  };

  return {
    open,
    setOpen,
    /** Cancel any pending open/close. */
    cancel: clear,
    /** Attach to the floating element so the safe triangle can be computed. */
    contentRef: React.useCallback((node: HTMLElement | null) => {
      contentEl.current = node;
    }, []),
    triggerProps: {
      onPointerEnter: (e: React.PointerEvent) => {
        if (!isMouse(e) || disabled) return;
        stopTracking();
        schedule(true, open ? 0 : openDelay);
      },
      onPointerLeave: onTriggerLeave,
      onFocus: () => {
        if (openOnFocus && !disabled) schedule(true, 0);
      },
      onBlur: (e: React.FocusEvent) => {
        if (!openOnFocus) return;
        if (contentEl.current?.contains(e.relatedTarget as Node | null)) return;
        schedule(false, closeDelay);
      },
    },
    contentProps: {
      onPointerEnter: () => {
        stopTracking();
        clear();
      },
      onPointerLeave: (e: React.PointerEvent) => {
        if (isMouse(e)) schedule(false, closeDelay);
      },
    },
  };
}
