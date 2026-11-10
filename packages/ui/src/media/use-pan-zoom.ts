"use client";

import * as React from "react";

export interface PanZoomState {
  scale: number;
  x: number;
  y: number;
}

export interface UsePanZoomOptions {
  /** Default 1. */
  min?: number;
  /** Default 3. */
  max?: number;
  /** Button / key step. Default 0.5. */
  step?: number;
  /** Double click / double tap toggles between 1× and this. Default 2. */
  doubleTapScale?: number;
  /** Turn the gestures off (state is kept at 1×). */
  disabled?: boolean;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Pointer pan + pinch + wheel zoom + double-tap for one element (Lightbox stage, cropper preview,
 * hierarchy chart). Put `bind` on the viewport and `style` on the content.
 *
 * ```tsx
 * const pz = usePanZoom({ max: 4 });
 * <div {...pz.bind}><img style={pz.style} /></div>
 * ```
 */
export function usePanZoom({ min = 1, max = 3, step = 0.5, doubleTapScale = 2, disabled = false }: UsePanZoomOptions = {}) {
  const [state, setState] = React.useState<PanZoomState>({ scale: 1, x: 0, y: 0 });
  const [panning, setPanning] = React.useState(false);
  const viewport = React.useRef<HTMLElement | null>(null);
  const pointers = React.useRef(new Map<number, { x: number; y: number }>());
  const gesture = React.useRef<{ dist: number; scale: number; x: number; y: number; px: number; py: number } | null>(null);
  const lastTap = React.useRef(0);
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const bound = React.useCallback(
    (s: PanZoomState): PanZoomState => {
      const el = viewport.current;
      const scale = clamp(s.scale, min, max);
      if (!el || scale <= 1) return { scale, x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      const mx = (r.width * (scale - 1)) / 2;
      const my = (r.height * (scale - 1)) / 2;
      return { scale, x: clamp(s.x, -mx, mx), y: clamp(s.y, -my, my) };
    },
    [min, max],
  );

  /** Zoom to `scale`, keeping the point `origin` (px from the viewport centre) still. */
  const zoomTo = React.useCallback(
    (scale: number, origin: { x: number; y: number } = { x: 0, y: 0 }) => {
      setState((prev) => {
        const next = clamp(scale, min, max);
        const k = next / prev.scale;
        return bound({ scale: next, x: origin.x - (origin.x - prev.x) * k, y: origin.y - (origin.y - prev.y) * k });
      });
    },
    [bound, min, max],
  );

  const reset = React.useCallback(() => setState({ scale: 1, x: 0, y: 0 }), []);
  const zoomIn = React.useCallback(() => zoomTo(stateRef.current.scale + step), [zoomTo, step]);
  const zoomOut = React.useCallback(() => zoomTo(stateRef.current.scale - step), [zoomTo, step]);

  const originOf = (clientX: number, clientY: number) => {
    const r = viewport.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: clientX - (r.left + r.width / 2), y: clientY - (r.top + r.height / 2) };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (disabled || (e.pointerType === "mouse" && e.button !== 0)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const s = stateRef.current;
    if (pts.length === 2) {
      const [a, b] = pts as [{ x: number; y: number }, { x: number; y: number }];
      gesture.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: s.scale, x: s.x, y: s.y, px: (a.x + b.x) / 2, py: (a.y + b.y) / 2 };
    } else if (pts.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 280) {
        lastTap.current = 0;
        if (s.scale > 1) reset();
        else zoomTo(doubleTapScale, originOf(e.clientX, e.clientY));
        return;
      }
      lastTap.current = now;
      gesture.current = { dist: 0, scale: s.scale, x: s.x, y: s.y, px: e.clientX, py: e.clientY };
      if (s.scale > 1) {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        setPanning(true);
      }
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (disabled || !pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const g = gesture.current;
    if (pts.length >= 2 && g.dist > 0) {
      const [a, b] = pts as [{ x: number; y: number }, { x: number; y: number }];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const scale = clamp((g.scale * dist) / g.dist, min, max);
      const o = originOf(g.px, g.py);
      const k = scale / g.scale;
      setState(bound({ scale, x: o.x - (o.x - g.x) * k + ((a.x + b.x) / 2 - g.px), y: o.y - (o.y - g.y) * k + ((a.y + b.y) / 2 - g.py) }));
    } else if (stateRef.current.scale > 1) {
      setState(bound({ scale: stateRef.current.scale, x: g.x + (e.clientX - g.px), y: g.y + (e.clientY - g.py) }));
    }
  };

  const end = (e: React.PointerEvent<HTMLElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) {
      gesture.current = null;
      setPanning(false);
    } else {
      const [p] = [...pointers.current.values()];
      const s = stateRef.current;
      if (p) gesture.current = { dist: 0, scale: s.scale, x: s.x, y: s.y, px: p.x, py: p.y };
    }
  };

  // Wheel needs a non-passive listener to prevent page scroll.
  const wheelHandler = React.useRef<(e: WheelEvent) => void>(() => {});
  wheelHandler.current = (e: WheelEvent) => {
    if (disabled) return;
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025));
    zoomTo(stateRef.current.scale * factor, originOf(e.clientX, e.clientY));
  };
  const listener = React.useRef<((e: WheelEvent) => void) | null>(null);
  const ref = React.useCallback((node: HTMLElement | null) => {
    if (viewport.current && listener.current) viewport.current.removeEventListener("wheel", listener.current);
    viewport.current = node;
    if (node) {
      listener.current = (e: WheelEvent) => wheelHandler.current(e);
      node.addEventListener("wheel", listener.current, { passive: false });
    }
  }, []);

  React.useEffect(() => {
    if (disabled) reset();
  }, [disabled, reset]);

  return {
    state,
    scale: state.scale,
    zoomed: state.scale > 1.001,
    panning,
    zoomTo,
    zoomIn,
    zoomOut,
    reset,
    canZoomIn: state.scale < max - 0.001,
    canZoomOut: state.scale > min + 0.001,
    bind: {
      ref,
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
      style: { touchAction: state.scale > 1 ? "none" : "pan-y" } as React.CSSProperties,
    },
    style: {
      transform: `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`,
      transition: panning ? "none" : "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      cursor: state.scale > 1 ? (panning ? "grabbing" : "grab") : "zoom-in",
    } as React.CSSProperties,
  };
}
