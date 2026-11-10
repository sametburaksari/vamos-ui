"use client";

/**
 * Pointer-driven dragging for time grids, bars and handles (Agenda, Resource calendar, Gantt,
 * Hierarchy chart pan, cropper handles). Pointer Events + `setPointerCapture`, a movement
 * threshold, axis lock, snapping, Esc to cancel and auto-scroll near the scroll container edges.
 * It is not a sortable engine; lists use `Sortable`.
 */
import * as React from "react";
import { useLatest } from "../lib/use-controllable-state";

export interface PointerDragPoint {
  x: number;
  y: number;
}

export interface PointerDragState {
  /** Pointer position at press, in client coordinates. */
  origin: PointerDragPoint;
  /** Movement since press, including container auto-scroll, after axis lock and `snap`. */
  delta: PointerDragPoint;
  /** Movement before `snap`. */
  rawDelta: PointerDragPoint;
  pointerType: string;
  /** Modifier keys at the last event (e.g. Alt to disable snapping). */
  altKey: boolean;
  shiftKey: boolean;
  /** The element the drag started on. */
  target: HTMLElement;
}

export interface UsePointerDragOptions {
  /** Lock movement to one axis. Default `"both"`. */
  axis?: "x" | "y" | "both";
  /** Pixels before a press becomes a drag (clicks stay clicks). Default 3; touch 6. */
  threshold?: number;
  /** Map the raw delta to a snapped delta (e.g. to a 15-minute grid). */
  snap?: (delta: PointerDragPoint, state: Omit<PointerDragState, "delta">) => PointerDragPoint;
  /** Only the primary button / single touch starts a drag. Default true. */
  primaryOnly?: boolean;
  disabled?: boolean;
  /** Scroll container to auto-scroll near its edges. */
  scrollContainer?: React.RefObject<HTMLElement | null> | (() => HTMLElement | null);
  /** Edge size in px that triggers auto-scroll. Default 32. */
  autoScrollEdge?: number;
  /** Max auto-scroll speed in px per frame. Default 14. */
  autoScrollSpeed?: number;
  onStart?(state: PointerDragState): void;
  onMove?(state: PointerDragState): void;
  onEnd?(state: PointerDragState): void;
  /** Esc, `pointercancel` or `cancel()`. */
  onCancel?(state: PointerDragState): void;
  /** A press released before the threshold (a click). */
  onTap?(event: PointerEvent): void;
}

export interface UsePointerDragResult {
  /** Spread on the element that starts the drag. */
  bind: { onPointerDown: (e: React.PointerEvent<HTMLElement>) => void; style: React.CSSProperties };
  isDragging: boolean;
  cancel(): void;
}

interface Session {
  pointerId: number;
  target: HTMLElement;
  origin: PointerDragPoint;
  last: PointerDragPoint;
  scrollStart: PointerDragPoint;
  started: boolean;
  pointerType: string;
  altKey: boolean;
  shiftKey: boolean;
  raf: number;
  cleanup: () => void;
}

const resolveContainer = (c: UsePointerDragOptions["scrollContainer"]) => (typeof c === "function" ? c() : (c?.current ?? null));

/**
 * ```tsx
 * const { bind, isDragging } = usePointerDrag({
 *   axis: "y",
 *   snap: (d) => ({ x: 0, y: Math.round(d.y / slotPx) * slotPx }),
 *   onMove: (s) => setPreview(s.delta.y),
 *   onEnd: (s) => commit(s.delta.y),
 * });
 * <div {...bind} />
 * ```
 */
export function usePointerDrag(options: UsePointerDragOptions = {}): UsePointerDragResult {
  const opts = useLatest(options);
  const session = React.useRef<Session | null>(null);
  const [isDragging, setDragging] = React.useState(false);

  const stateOf = React.useCallback(
    (s: Session): PointerDragState => {
      const o = opts.current;
      const container = resolveContainer(o.scrollContainer);
      const scrollX = container ? container.scrollLeft - s.scrollStart.x : 0;
      const scrollY = container ? container.scrollTop - s.scrollStart.y : 0;
      let raw = { x: s.last.x - s.origin.x + scrollX, y: s.last.y - s.origin.y + scrollY };
      if (o.axis === "x") raw = { x: raw.x, y: 0 };
      else if (o.axis === "y") raw = { x: 0, y: raw.y };
      const base = { origin: s.origin, rawDelta: raw, pointerType: s.pointerType, altKey: s.altKey, shiftKey: s.shiftKey, target: s.target };
      return { ...base, delta: o.snap ? o.snap(raw, base) : raw };
    },
    [opts],
  );

  const finish = React.useCallback(
    (kind: "end" | "cancel" | "tap", event?: PointerEvent) => {
      const s = session.current;
      if (!s) return;
      session.current = null;
      s.cleanup();
      cancelAnimationFrame(s.raf);
      try {
        if (s.target.hasPointerCapture?.(s.pointerId)) s.target.releasePointerCapture(s.pointerId);
      } catch {
        /* already released */
      }
      if (s.started) {
        setDragging(false);
        const st = stateOf(s);
        if (kind === "cancel") opts.current.onCancel?.(st);
        else opts.current.onEnd?.(st);
      } else if (kind !== "cancel" && event) {
        opts.current.onTap?.(event);
      }
    },
    [opts, stateOf],
  );

  const cancel = React.useCallback(() => finish("cancel"), [finish]);

  React.useEffect(() => () => finish("cancel"), [finish]);

  const autoScroll = React.useCallback(() => {
    const s = session.current;
    if (!s || !s.started) return;
    const o = opts.current;
    const container = resolveContainer(o.scrollContainer);
    if (container) {
      const r = container.getBoundingClientRect();
      const edge = o.autoScrollEdge ?? 32;
      const speed = o.autoScrollSpeed ?? 14;
      const ramp = (dist: number) => (dist < edge ? Math.ceil(((edge - dist) / edge) * speed) : 0);
      const dx = o.axis === "y" ? 0 : ramp(s.last.x - r.left) * -1 + ramp(r.right - s.last.x);
      const dy = o.axis === "x" ? 0 : ramp(s.last.y - r.top) * -1 + ramp(r.bottom - s.last.y);
      if (dx || dy) {
        const bx = container.scrollLeft;
        const by = container.scrollTop;
        container.scrollLeft += dx;
        container.scrollTop += dy;
        if (container.scrollLeft !== bx || container.scrollTop !== by) o.onMove?.(stateOf(s));
      }
    }
    s.raf = requestAnimationFrame(autoScroll);
  }, [opts, stateOf]);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const o = opts.current;
      if (o.disabled || session.current) return;
      if ((o.primaryOnly ?? true) && (e.button !== 0 || !e.isPrimary)) return;
      const target = e.currentTarget;
      const container = resolveContainer(o.scrollContainer);
      const threshold = o.threshold ?? (e.pointerType === "touch" ? 6 : 3);
      const s: Session = {
        pointerId: e.pointerId,
        target,
        origin: { x: e.clientX, y: e.clientY },
        last: { x: e.clientX, y: e.clientY },
        scrollStart: { x: container?.scrollLeft ?? 0, y: container?.scrollTop ?? 0 },
        started: false,
        pointerType: e.pointerType,
        altKey: e.altKey,
        shiftKey: e.shiftKey,
        raf: 0,
        cleanup: () => {},
      };
      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== s.pointerId) return;
        s.last = { x: ev.clientX, y: ev.clientY };
        s.altKey = ev.altKey;
        s.shiftKey = ev.shiftKey;
        if (!s.started) {
          if (Math.hypot(s.last.x - s.origin.x, s.last.y - s.origin.y) < threshold) return;
          s.started = true;
          setDragging(true);
          try {
            target.setPointerCapture(s.pointerId);
          } catch {
            /* jsdom / detached */
          }
          opts.current.onStart?.(stateOf(s));
          s.raf = requestAnimationFrame(autoScroll);
        }
        ev.preventDefault();
        opts.current.onMove?.(stateOf(s));
      };
      const onUp = (ev: PointerEvent) => {
        if (ev.pointerId !== s.pointerId) return;
        if (s.started) s.last = { x: ev.clientX, y: ev.clientY };
        finish("end", ev);
      };
      const onCancelEv = (ev: PointerEvent) => ev.pointerId === s.pointerId && finish("cancel");
      const onKey = (ev: KeyboardEvent) => {
        if (ev.key === "Escape" && s.started) {
          ev.preventDefault();
          ev.stopPropagation();
          finish("cancel");
        }
      };
      // Window listeners: work with and without pointer capture.
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancelEv);
      window.addEventListener("keydown", onKey, true);
      s.cleanup = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancelEv);
        window.removeEventListener("keydown", onKey, true);
      };
      session.current = s;
    },
    [opts, stateOf, finish, autoScroll],
  );

  const bind = React.useMemo(() => ({ onPointerDown, style: { touchAction: options.axis === "x" ? "pan-y" : options.axis === "y" ? "pan-x" : "none" } as React.CSSProperties }), [onPointerDown, options.axis]);
  return { bind, isDragging, cancel };
}

/** Snap helper: rounds a delta to a pixel grid per axis (`snapToGrid({ y: slotPx })`). */
export function snapToGrid(grid: { x?: number; y?: number }) {
  return (d: PointerDragPoint): PointerDragPoint => ({
    x: grid.x ? Math.round(d.x / grid.x) * grid.x : d.x,
    y: grid.y ? Math.round(d.y / grid.y) * grid.y : d.y,
  });
}
