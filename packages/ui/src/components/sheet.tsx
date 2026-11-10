"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useComposedRefs } from "../lib/compose-refs";
import { useLatest } from "../lib/use-controllable-state";
import {
  Dialog,
  DialogClose,
  DialogTrigger,
  LayerBody,
  LayerContentShell,
  LayerFooter,
  LayerHeader,
  useDialogRoot,
  type DialogProps,
  type LayerBodyProps,
  type LayerContentShellProps,
} from "./dialog";

/* ------------------------------------------------------------------ */
/* Sheet                                                                */
/* ------------------------------------------------------------------ */

export interface SheetProps extends DialogProps {}

/**
 * An edge panel that keeps the page behind it in view: quick edit, record preview, mobile
 * filters, mobile navigation. A positioned Dialog — same focus, Esc and close-guard behaviour.
 *
 * ```tsx
 * <Sheet>
 *   <SheetTrigger asChild><Button>Quick edit</Button></SheetTrigger>
 *   <SheetContent side="end" size="md">
 *     <SheetHeader title="Edit contact" />
 *     <SheetBody>…</SheetBody>
 *     <SheetFooter>…</SheetFooter>
 *   </SheetContent>
 * </Sheet>
 * ```
 *
 * `modal={false}` keeps the page interactive (no overlay, no focus trap; Esc still closes).
 */
export function Sheet(props: SheetProps) {
  return <Dialog {...props} />;
}

export const SheetTrigger = DialogTrigger;
export const SheetClose = DialogClose;
/** `LayerHeader` for sheets. */
export const SheetHeader = LayerHeader;
/** `LayerBody` for sheets — the only part that scrolls. */
export const SheetBody = LayerBody;
/** `LayerFooter` for sheets. */
export const SheetFooter = LayerFooter;

export type SheetSide = "start" | "end" | "top" | "bottom";

export interface SheetContentProps extends LayerContentShellProps {
  /** Logical edge — `start`/`end` flip in RTL. `left`/`right` are accepted as aliases of `start`/`end`. Default `"end"`. */
  side?: SheetSide | "left" | "right";
  /**
   * Width for `start`/`end`: 360 / 440 / 560 / 720 px or full. For `top`/`bottom` it caps the
   * height (40 / 60 / 75 / 85 % of the viewport, or full); the panel otherwise fits its content.
   * Default `"md"`.
   */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** 8px gutter and full radius — a floating panel. */
  inset?: boolean;
}

const sideAlias = { left: "start", right: "end" } as const;

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(function SheetContent(
  { side: sideProp = "end", size = "md", inset, className, ...props },
  ref,
) {
  const side: SheetSide = sideProp === "left" || sideProp === "right" ? sideAlias[sideProp] : sideProp;
  return (
    <LayerContentShell
      ref={ref}
      data-slot="sheet-content"
      data-side={side}
      data-size={size}
      data-inset={inset ? "" : undefined}
      className={cn("vui-sheet", `ui-sheet-${side}`, className)}
      {...props}
    />
  );
});

/* ------------------------------------------------------------------ */
/* Drag to dismiss                                                      */
/* ------------------------------------------------------------------ */

export interface UseDragDismissOptions {
  /** Called when the drag passes the threshold or is flicked. */
  onDismiss: () => void;
  enabled?: boolean;
  /** Fraction of the panel height to drag before it dismisses. Default 0.3. */
  threshold?: number;
  /** Flick speed in px/ms that dismisses regardless of distance. Default 0.5. */
  velocity?: number;
}

const INTERACTIVE = "button, a[href], input, select, textarea, label, [role=button], [role=slider], [contenteditable=true], [data-no-drag]";

/**
 * Pointer-driven vertical drag for a bottom panel. Moves the element through the CSS
 * `translate` property (so the close keyframes compose with it), sets `data-dragging` (which also
 * turns blur off) and springs back below the threshold. Drags never start on interactive
 * elements or inside a scrolled body.
 */
export function useDragDismiss<T extends HTMLElement>({ onDismiss, enabled = true, threshold = 0.3, velocity = 0.5 }: UseDragDismissOptions) {
  const ref = React.useRef<T | null>(null);
  const drag = React.useRef<{ y: number; t: number; id: number; dy: number } | null>(null);
  const dismiss = useLatest(onDismiss);

  const settle = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute("data-settling", "");
    el.style.translate = "";
    const done = () => el.removeAttribute("data-settling");
    el.addEventListener("transitionend", done, { once: true });
    window.setTimeout(done, 260);
  }, []);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<T>) => {
      const el = ref.current;
      if (!enabled || !el || (e.pointerType === "mouse" && e.button !== 0)) return;
      const target = e.target as HTMLElement;
      if (target.closest(INTERACTIVE)) return;
      const body = target.closest<HTMLElement>(".vui-layer-body");
      if (body && body.scrollTop > 0) return;
      drag.current = { y: e.clientY, t: performance.now(), id: e.pointerId, dy: 0 };
    },
    [enabled],
  );

  const onPointerMove = React.useCallback((e: React.PointerEvent<T>) => {
    const d = drag.current;
    const el = ref.current;
    if (!d || !el || e.pointerId !== d.id) return;
    const raw = e.clientY - d.y;
    if (!el.hasAttribute("data-dragging")) {
      if (Math.abs(raw) < 4) return;
      el.setAttribute("data-dragging", "");
      el.setPointerCapture?.(e.pointerId);
    }
    // Upward drags resist (rubber band); downward follows the finger.
    d.dy = raw < 0 ? -Math.sqrt(-raw) * 2 : raw;
    el.style.translate = `0 ${d.dy}px`;
  }, []);

  const end = React.useCallback(
    (e: React.PointerEvent<T>, cancelled: boolean) => {
      const d = drag.current;
      const el = ref.current;
      drag.current = null;
      if (!d || !el || !el.hasAttribute("data-dragging")) return;
      el.removeAttribute("data-dragging");
      el.releasePointerCapture?.(e.pointerId);
      const speed = d.dy / Math.max(1, performance.now() - d.t);
      const height = el.getBoundingClientRect().height || 1;
      if (!cancelled && d.dy > 0 && (d.dy > height * threshold || (speed > velocity && d.dy > 24))) {
        dismiss.current();
        // If a close guard keeps the panel open, spring back.
        window.setTimeout(() => el.isConnected && el.getAttribute("data-state") === "open" && settle(), 320);
      } else settle();
    },
    [threshold, velocity, dismiss, settle],
  );

  return {
    ref,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (e: React.PointerEvent<T>) => end(e, false),
      onPointerCancel: (e: React.PointerEvent<T>) => end(e, true),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Drawer                                                               */
/* ------------------------------------------------------------------ */

export interface DrawerProps extends SheetProps {}

/**
 * A bottom sheet that closes by dragging down — mobile actions, filters, pickers. Dragging is an
 * extra way to close: Esc and the close button always work.
 *
 * ```tsx
 * <Drawer>
 *   <DrawerTrigger asChild><Button>Filters</Button></DrawerTrigger>
 *   <DrawerContent>
 *     <DrawerHeader title="Filter orders" />
 *     <DrawerBody>…</DrawerBody>
 *     <DrawerFooter>…</DrawerFooter>
 *   </DrawerContent>
 * </Drawer>
 * ```
 */
export function Drawer(props: DrawerProps) {
  return <Dialog {...props} />;
}

export const DrawerTrigger = DialogTrigger;
export const DrawerClose = DialogClose;
export const DrawerHeader = LayerHeader;
export const DrawerFooter = LayerFooter;

/** The scrolling body of a drawer; dragging starts from it only while it is scrolled to the top. */
export const DrawerBody = React.forwardRef<HTMLDivElement, LayerBodyProps>(function DrawerBody(props, ref) {
  return <LayerBody ref={ref} data-slot="drawer-body" {...props} />;
});

/** The grab line at the top of a drawer. Decorative (`aria-hidden`). */
export function DrawerHandle({ className }: { className?: string }) {
  return <div aria-hidden data-slot="drawer-handle" className={cn("vui-drawer-handle", className)} />;
}

export interface DrawerContentProps extends Omit<SheetContentProps, "side"> {
  /** Close by dragging down. Default `true`. */
  dragToDismiss?: boolean;
  /** Show the grab handle. Default `true`. */
  handle?: boolean;
}

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(function DrawerContent(
  { dragToDismiss = true, handle = true, size = "lg", className, children, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, ...props },
  ref,
) {
  const root = useDialogRoot();
  const { ref: dragRef, handlers } = useDragDismiss<HTMLDivElement>({ onDismiss: () => root.requestOpenChange(false), enabled: dragToDismiss });
  const composed = useComposedRefs(ref, dragRef);
  return (
    <SheetContent
      ref={composed}
      side="bottom"
      size={size}
      data-slot="drawer-content"
      className={cn("vui-drawer", className)}
      onPointerDown={(e) => {
        onPointerDown?.(e);
        handlers.onPointerDown(e);
      }}
      onPointerMove={(e) => {
        onPointerMove?.(e);
        handlers.onPointerMove(e);
      }}
      onPointerUp={(e) => {
        onPointerUp?.(e);
        handlers.onPointerUp(e);
      }}
      onPointerCancel={(e) => {
        onPointerCancel?.(e);
        handlers.onPointerCancel(e);
      }}
      {...props}
    >
      {handle ? <DrawerHandle /> : null}
      {children}
    </SheetContent>
  );
});
