"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "../lib/cn";
import { motionLevel, type MotionLevel } from "./core";

const finePointer = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * Pointer-follow plumbing shared by Tilt and Magnetic: listens on the element, rAF-throttles,
 * writes CSS variables only (no React state, no re-render). Mouse/trackpad only, never on
 * touch, under reduced motion or below the required motion level.
 */
function usePointerVars(
  ref: React.RefObject<HTMLElement | null>,
  minLevel: Exclude<MotionLevel, "off">,
  write: (el: HTMLElement, x: number, y: number) => void,
  reset: (el: HTMLElement) => void,
) {
  const writeRef = React.useRef(write);
  writeRef.current = write;
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let active = false;
    let last: PointerEvent | null = null;
    const frame = () => {
      raf = 0;
      if (!last) return;
      const r = el.getBoundingClientRect();
      // -1…1 from the centre
      writeRef.current(el, ((last.clientX - r.left) / r.width) * 2 - 1, ((last.clientY - r.top) / r.height) * 2 - 1);
    };
    const enter = (e: PointerEvent) => {
      const level = motionLevel(el);
      active = e.pointerType === "mouse" && finePointer() && level !== "off" && (minLevel === "subtle" || level === "full");
      if (active) el.setAttribute("data-pointer", "");
    };
    const move = (e: PointerEvent) => {
      if (!active) return;
      last = e;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const leave = () => {
      if (!active) return;
      active = false;
      last = null;
      cancelAnimationFrame(raf);
      raf = 0;
      el.removeAttribute("data-pointer");
      reset(el);
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minLevel]);
}

function setRefs<T>(node: T | null, ...refs: (React.Ref<T> | undefined)[]) {
  for (const r of refs) {
    if (typeof r === "function") r(node);
    else if (r) (r as React.RefObject<T | null>).current = node;
  }
}

export interface TiltProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum rotation in degrees. Default 5 — enough to feel, not enough to read as a gimmick. */
  max?: number;
  /** A soft light that follows the pointer. Default false. */
  glare?: boolean;
  /** Lowest motion level that tilts. Default `"subtle"`; `"full"` keeps subtle sites flat. */
  level?: "subtle" | "full";
  asChild?: boolean;
}

/**
 * A card that leans toward the pointer in 3D. Mouse and trackpad only (`pointer: fine`); flat
 * on touch, under reduced motion and with `data-motion="off"`.
 *
 * ```tsx
 * <Tilt max={6} glare><article className="surface rounded-ui-lg p-6">…</article></Tilt>
 * ```
 */
export const Tilt = React.forwardRef<HTMLDivElement, TiltProps>(function Tilt({ max = 5, glare = false, level = "subtle", asChild, className, style, children, ...props }, ref) {
  const inner = React.useRef<HTMLDivElement | null>(null);
  usePointerVars(
    inner,
    level,
    (el, x, y) => {
      el.style.setProperty("--vm-tilt-x", `${(-y * max).toFixed(2)}deg`);
      el.style.setProperty("--vm-tilt-y", `${(x * max).toFixed(2)}deg`);
      el.style.setProperty("--vm-glare-x", `${((x + 1) * 50).toFixed(1)}%`);
      el.style.setProperty("--vm-glare-y", `${((y + 1) * 50).toFixed(1)}%`);
    },
    (el) => {
      el.style.removeProperty("--vm-tilt-x");
      el.style.removeProperty("--vm-tilt-y");
    },
  );
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp ref={(n: HTMLDivElement | null) => setRefs(n, ref, inner)} data-glare={glare ? "" : undefined} className={cn("vm-tilt", className)} style={style} {...props}>
      {children}
    </Comp>
  );
});

export interface MagneticProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Share of the pointer's offset the element follows, 0–1. Default 0.3. */
  strength?: number;
  /** Cap on the travel, in px. Default 10. */
  limit?: number;
  /** Lowest motion level that pulls. Default `"full"` — a call-to-action flourish, not a default. */
  level?: "subtle" | "full";
  /** Pull the single child (your Button or link) instead of wrapping it in an inline-block span. */
  asChild?: boolean;
}

/**
 * Pulls a call-to-action a few pixels toward the pointer and springs back on leave. Mouse
 * and trackpad only; still on touch, under reduced motion and below its `level`.
 *
 * ```tsx
 * <Magnetic><Button variant="primary" size="xl">Book a table</Button></Magnetic>
 * ```
 */
export const Magnetic = React.forwardRef<HTMLSpanElement, MagneticProps>(function Magnetic({ strength = 0.3, limit = 10, level = "full", asChild, className, children, ...props }, ref) {
  const inner = React.useRef<HTMLSpanElement | null>(null);
  usePointerVars(
    inner,
    level,
    (el, x, y) => {
      const r = el.getBoundingClientRect();
      const clamp = (v: number) => Math.max(-limit, Math.min(limit, v));
      el.style.setProperty("--vm-mag-x", `${clamp(((x * r.width) / 2) * strength).toFixed(1)}px`);
      el.style.setProperty("--vm-mag-y", `${clamp(((y * r.height) / 2) * strength).toFixed(1)}px`);
    },
    (el) => {
      el.style.removeProperty("--vm-mag-x");
      el.style.removeProperty("--vm-mag-y");
    },
  );
  const Comp = asChild ? Slot.Root : "span";
  return (
    <Comp ref={(n: HTMLSpanElement | null) => setRefs(n, ref, inner)} className={cn("vm-magnetic", className)} {...props}>
      {children}
    </Comp>
  );
});
