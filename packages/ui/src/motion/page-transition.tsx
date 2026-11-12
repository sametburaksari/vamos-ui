"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { cn } from "../lib/cn";
import { motionAllowed } from "./core";

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };

export const viewTransitionsSupported = () => typeof document !== "undefined" && typeof (document as ViewTransitionDoc).startViewTransition === "function";

export interface StartPageTransitionOptions {
  /**
   * The element that changes. It gets `view-transition-name: vm-page` for the length of the
   * transition, so only it cross-fades and the rest of the page stays live underneath.
   */
  scope?: HTMLElement | null;
}

/**
 * Run a state update as a page transition: a View Transition (cross-fade + slight rise) where
 * the browser has the API and motion is allowed, a plain synchronous update otherwise.
 * Returns `"view-transition"` or `"none"`, so a caller can add its own fallback fade.
 *
 * ```ts
 * startPageTransition(() => setPage("pricing"), { scope: rootRef.current });
 * ```
 */
export function startPageTransition(update: () => void, { scope }: StartPageTransitionOptions = {}): "view-transition" | "none" {
  const doc = typeof document === "undefined" ? undefined : (document as ViewTransitionDoc);
  if (!doc?.startViewTransition || !motionAllowed(scope ?? doc.documentElement)) {
    update();
    return "none";
  }
  if (scope) scope.style.setProperty("view-transition-name", "vm-page");
  doc.documentElement.setAttribute("data-vm-transition", "");
  try {
    const t = doc.startViewTransition(() => flushSync(update));
    t.finished.finally(() => {
      scope?.style.removeProperty("view-transition-name");
      doc.documentElement.removeAttribute("data-vm-transition");
    });
  } catch {
    scope?.style.removeProperty("view-transition-name");
    doc.documentElement.removeAttribute("data-vm-transition");
    update();
    return "none";
  }
  return "view-transition";
}

export interface PageTransitionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Changes when the page changes (a route, a tab id). The content fades in on every change after the first. */
  pageKey: string;
}

/**
 * Fades its content in whenever `pageKey` changes — the fallback for apps that switch content
 * without View Transitions. Pair it with `startPageTransition` when you control the update.
 * The first render never animates, so server-rendered content stays put.
 *
 * ```tsx
 * <PageTransition pageKey={tab}>{panels[tab]}</PageTransition>
 * ```
 */
export const PageTransition = /*#__PURE__*/ React.forwardRef<HTMLDivElement, PageTransitionProps>(function PageTransition({ pageKey, className, children, ...props }, ref) {
  const first = React.useRef(pageKey);
  // Inside a View Transition the browser already cross-fades: no second fade on top.
  const inViewTransition = typeof document !== "undefined" && document.documentElement.hasAttribute("data-vm-transition");
  const entering = first.current !== pageKey && !inViewTransition;
  React.useEffect(() => {
    // From the second key on, every change animates.
    if (first.current !== pageKey) first.current = "\u0000";
  }, [pageKey]);
  return (
    <div ref={ref} key={pageKey} data-page-enter={entering ? "" : undefined} className={cn("vm-page", className)} {...props}>
      {children}
    </div>
  );
});
