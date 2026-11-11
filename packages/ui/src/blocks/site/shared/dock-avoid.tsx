"use client";

import * as React from "react";

/**
 * What the dock must never cover: explicit `[data-dock-avoid]` regions (a sticky booking bar,
 * a checkout summary) plus the kit's own conversion parts — the booking form, the hero's aside
 * card and every CTA row. `data-dock-avoid="items"` (CTA rows) tests each link/button inside
 * instead of the full-width row.
 */
export const DOCK_AVOID_SELECTOR = "[data-dock-avoid], .vb-booking, .vb-hero-aside";
const CONTROLS = "a[href], button, input, select, textarea";

interface Box {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const isShown = (el: HTMLElement | null): el is HTMLElement => !!el && (typeof el.checkVisibility === "function" ? el.checkVisibility() : getComputedStyle(el).display !== "none");
const overlaps = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

let pinnedCache = new WeakMap<Element, boolean>();

function isPinned(el: Element): boolean {
  const cached = pinnedCache.get(el);
  if (cached !== undefined) return cached;
  const pinned = isPinnedUncached(el);
  pinnedCache.set(el, pinned);
  return pinned;
}

function isPinnedUncached(el: Element): boolean {
  for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) {
    const pos = getComputedStyle(n).position;
    if (pos === "fixed" || pos === "sticky") return true;
  }
  return false;
}

/**
 * Keeps the Contact dock off CTAs (~0.6 KB island). A fixed or sticky region pinned to the
 * bottom of the viewport lifts the fab above it (and hides the mobile bar, two bottom bars
 * never stack); an in-flow CTA passing under the fab hides the fab until it has scrolled by.
 * The fab never hides while it has focus.
 */
export function DockAvoid() {
  const ref = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    const dock = ref.current?.closest<HTMLElement>("[data-contact-dock]");
    if (!dock || typeof window === "undefined") return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const vh = window.innerHeight;
      const fab = dock.querySelector<HTMLElement>(".vb-dock-fab");
      const bar = dock.querySelector<HTMLElement>(".vb-dock-bar");
      const fabVisible = isShown(fab);
      const barVisible = isShown(bar);
      const currentLift = parseFloat(dock.style.getPropertyValue("--vb-dock-lift")) || 0;
      // Where the fab sits without any lift.
      const fr = fabVisible ? fab!.getBoundingClientRect() : null;
      const fabBox: Box | null = fr ? { top: fr.top + currentLift, bottom: fr.bottom + currentLift, left: fr.left, right: fr.right } : null;
      let lift = 0;
      let hideFab = false;
      let hideBar = false;
      for (const region of document.querySelectorAll<HTMLElement>(DOCK_AVOID_SELECTOR)) {
        if (dock.contains(region) || region.closest("[hidden], [inert]")) continue;
        const r = region.getBoundingClientRect();
        if (!r.width || !r.height || r.bottom <= 0 || r.top >= vh) continue;
        if (isPinned(region) && r.bottom >= vh - 2) {
          // A bar pinned to the bottom edge: step above it.
          lift = Math.max(lift, vh - r.top);
          if (barVisible) hideBar = true;
          continue;
        }
        if (!fabBox || hideFab) continue;
        const boxes = region.dataset.dockAvoid === "items" ? Array.from(region.querySelectorAll(CONTROLS), (c) => c.getBoundingClientRect()) : [r];
        if (boxes.some((b) => b.width && overlaps(fabBox, b))) hideFab = true;
      }
      if (fab?.contains(document.activeElement)) hideFab = false;
      dock.style.setProperty("--vb-dock-lift", `${Math.round(lift)}px`);
      dock.toggleAttribute("data-avoiding", hideFab);
      dock.toggleAttribute("data-bar-avoiding", hideBar);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    const onResize = () => {
      pinnedCache = new WeakMap();
      schedule();
    };
    window.addEventListener("resize", onResize);
    dock.addEventListener("focusin", schedule);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    ro?.observe(document.body);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", onResize);
      dock.removeEventListener("focusin", schedule);
      ro?.disconnect();
    };
  }, []);
  return <span ref={ref} hidden data-dock-avoid-island="" />;
}
