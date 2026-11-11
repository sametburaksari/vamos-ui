"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useControllableState } from "../lib/use-controllable-state";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { usePortalContainer } from "../lib/theme-scope";
import { Layer } from "../lib/layer";
import { Button } from "./button";

export const tourLabels = {
  next: "Next",
  back: "Back",
  done: "Done",
  skip: "Skip tour",
  progress: "Step {current} of {total}",
};
export type TourLabels = typeof tourLabels;

export interface TourStep {
  /** Stable key (defaults to the index). */
  id?: string;
  /**
   * What to highlight: a CSS selector (`"[data-tour=new-order]"`), a ref, or a function.
   * Missing or not found → the card shows centred without a spotlight.
   */
  target?: string | React.RefObject<Element | null> | (() => Element | null);
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Extra body under the description (an illustration, a shortcut hint). */
  content?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** Space between the target and the spotlight edge, px. Default `6`. */
  padding?: number;
  /** Spotlight corner radius, px. Default `10`. */
  radius?: number;
}

export interface TourProps {
  steps: TourStep[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Current step index (controlled). */
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** "Done" on the last step. The tour closes afterwards. */
  onComplete?: () => void;
  /** Closed early (skip button or Escape) on step `index`. */
  onSkip?: (index: number) => void;
  /** Clicking the dimmed page closes the tour. Default `false`. */
  dismissible?: boolean;
  /** Card class (width, etc.). */
  className?: string;
  labels?: Partial<TourLabels>;
}

type Box = { top: number; left: number; width: number; height: number };

function resolveTarget(target: TourStep["target"]): Element | null {
  if (!target || typeof document === "undefined") return null;
  if (typeof target === "string") return document.querySelector(target);
  if (typeof target === "function") return target();
  return target.current;
}

const sameBox = (a: Box | null, b: Box | null) => a === b || (!!a && !!b && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height);

/**
 * Guided product tour: dims the page, cuts a spotlight around each target and anchors a step
 * card to it. Back / Next / Done, arrow keys between steps, Escape to skip. The card is a modal
 * dialog labelled by the step title; focus returns to where it was when the tour ends.
 *
 * ```tsx
 * <Tour open={open} onOpenChange={setOpen} steps={[
 *   { target: "[data-tour=search]", title: "Search everything", description: "Press ⌘K from any page." },
 *   { target: "[data-tour=new]", title: "Create", description: "Orders, customers and products start here.", side: "left" },
 * ]} />
 * ```
 */
export function Tour({ steps, open: openProp, defaultOpen = false, onOpenChange, step: stepProp, defaultStep = 0, onStepChange, onComplete, onSkip, dismissible = false, className, labels }: TourProps) {
  const t = useLabels("tour", tourLabels, labels);
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange, name: "Tour" });
  const [rawIndex, setIndex] = useControllableState({ value: stepProp, defaultValue: defaultStep, onChange: onStepChange, name: "Tour" });
  const index = Math.max(0, Math.min(steps.length - 1, rawIndex));
  const current = steps[index];
  const reduced = useReducedMotion();
  const container = usePortalContainer();
  const titleId = React.useId();
  const descId = React.useId();
  const [box, setBox] = React.useState<Box | null>(null);
  const boxRef = React.useRef<Box | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const pad = current?.padding ?? 6;
  const radius = current?.radius ?? 10;

  // Track the target's position every frame while open (layout shifts, scrolling, resizes).
  React.useEffect(() => {
    if (!open || !current) return;
    let frame = 0;
    let scrolled = false;
    const measure = () => {
      const el = resolveTarget(current.target);
      let next: Box | null = null;
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width || r.height) next = { top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 };
        if (!scrolled) {
          scrolled = true;
          const vh = window.innerHeight;
          const vw = window.innerWidth;
          if (r.top < 0 || r.bottom > vh || r.left < 0 || r.right > vw) el.scrollIntoView({ block: "center", inline: "nearest", behavior: reduced ? "auto" : "smooth" });
        }
        el.setAttribute("data-tour-active", "");
      }
      if (!sameBox(boxRef.current, next)) {
        boxRef.current = next;
        setBox(next);
      }
      frame = requestAnimationFrame(measure);
    };
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resolveTarget(current.target)?.removeAttribute("data-tour-active");
    };
  }, [open, current, pad, reduced]);

  // The card anchors to the spotlight, or to the viewport centre when there is no target.
  const anchorRef = React.useRef({
    getBoundingClientRect: () => {
      const b = boxRef.current;
      if (b) return DOMRect.fromRect({ x: b.left, y: b.top, width: b.width, height: b.height });
      return DOMRect.fromRect({ x: window.innerWidth / 2, y: window.innerHeight * 0.3, width: 0, height: 0 });
    },
  });

  if (!current) return null;
  const last = index === steps.length - 1;
  const close = (completed: boolean) => {
    setOpen(false);
    if (completed) onComplete?.();
    else onSkip?.(index);
  };
  const go = (to: number) => {
    if (to < 0) return;
    if (to >= steps.length) return close(true);
    setIndex(to);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
      e.preventDefault();
      go(index - 1);
    }
  };

  const transition = reduced ? undefined : "top 280ms cubic-bezier(.2,.7,.2,1), left 280ms cubic-bezier(.2,.7,.2,1), width 280ms cubic-bezier(.2,.7,.2,1), height 280ms cubic-bezier(.2,.7,.2,1)";

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(o) => (!o ? close(false) : setOpen(true))} modal>
      <PopoverPrimitive.Anchor virtualRef={anchorRef as unknown as React.RefObject<HTMLElement>} />
      {open ? (
        <PopoverPrimitive.Portal container={container}>
          <div data-slot="tour-overlay" aria-hidden="true" className="ui-fade pointer-events-auto fixed inset-0 z-(--z-overlay)">
            {box ? (
              <div
                data-slot="tour-spotlight"
                className="absolute outline-2 outline-offset-0 outline-[var(--ring)]"
                style={{ top: box.top, left: box.left, width: box.width, height: box.height, borderRadius: radius, boxShadow: "0 0 0 200vmax var(--overlay)", transition }}
              />
            ) : (
              <div className="absolute inset-0 bg-overlay" />
            )}
          </div>
        </PopoverPrimitive.Portal>
      ) : null}
      <PopoverPrimitive.Portal container={container}>
        <Layer asChild>
          <PopoverPrimitive.Content
            ref={contentRef}
            key={current.id ?? index}
            data-slot="tour-card"
            side={box ? (current.side ?? "bottom") : "bottom"}
            align={box ? (current.align ?? "center") : "center"}
            sideOffset={box ? 12 : 0}
            collisionPadding={16}
            updatePositionStrategy="always"
            aria-labelledby={titleId}
            aria-describedby={current.description ? descId : undefined}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              contentRef.current?.focus();
            }}
            onInteractOutside={(e) => {
              if (!dismissible) e.preventDefault();
            }}
            onKeyDown={onKeyDown}
            className={cn(
              "surface-popover ui-pop z-(--z-popover) w-80 max-w-[calc(100vw-2rem)] rounded-ui-lg p-4 outline-none",
              className,
            )}
          >
            <div className="flex items-start gap-3">
              <div className="grid min-w-0 flex-1 gap-1">
                <p className="text-[11px] font-medium tracking-[0.06em] text-fg-subtle uppercase tabular">{t("progress", { current: index + 1, total: steps.length })}</p>
                <h2 id={titleId} className="text-[15px] leading-snug font-semibold tracking-[-0.01em] text-fg">
                  {current.title}
                </h2>
              </div>
              <PopoverPrimitive.Close asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t("skip")} title={t("skip")} className="-me-1.5 -mt-1 shrink-0">
                  <X aria-hidden="true" />
                </Button>
              </PopoverPrimitive.Close>
            </div>
            {current.description ? (
              <p id={descId} className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                {current.description}
              </p>
            ) : null}
            {current.content ? <div className="mt-3">{current.content}</div> : null}
            <div className="mt-4 flex items-center gap-2">
              <ol aria-hidden="true" className="me-auto flex items-center gap-1">
                {steps.map((s, i) => (
                  <li
                    key={s.id ?? i}
                    className={cn("h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none", i === index ? "w-4 bg-accent" : i < index ? "w-1.5 bg-fg-muted" : "w-1.5 bg-track")}
                  />
                ))}
              </ol>
              {index > 0 ? (
                <Button size="sm" variant="ghost" onClick={() => go(index - 1)}>
                  {t("back")}
                </Button>
              ) : null}
              <Button size="sm" variant="primary" onClick={() => go(index + 1)}>
                {last ? t("done") : t("next")}
              </Button>
            </div>
          </PopoverPrimitive.Content>
        </Layer>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
