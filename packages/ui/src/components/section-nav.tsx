"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";

export const sectionNavLabels = { label: "On this page" };
export type SectionNavLabels = typeof sectionNavLabels;

export interface SectionNavItem {
  /** The `id` of the section on the page. */
  id: string;
  label: React.ReactNode;
  /** Small leading text: a number, a count, an icon. */
  meta?: React.ReactNode;
}

export interface SectionNavProps extends Omit<React.HTMLAttributes<HTMLElement>, "children" | "title"> {
  items: SectionNavItem[];
  /** Stick to the top while the page scrolls. Default `true`. */
  sticky?: boolean;
  /** Distance from the top when sticky (any CSS length or px number). Default `"1.5rem"`. */
  top?: number | string;
  /**
   * The band of the window that counts as "being read" (IntersectionObserver rootMargin).
   * Default `"-20% 0px -55% 0px"`: the section crossing the upper third is current.
   */
  rootMargin?: string;
  /** Called when the current section changes. */
  onActiveChange?: (id: string | null) => void;
  /** Visible heading above the list (also names the landmark). */
  title?: React.ReactNode;
  labels?: Partial<SectionNavLabels>;
}

/**
 * Scroll-spy table of contents: a sticky in-page nav that marks the section in view with
 * `aria-current="location"` and slides an accent rule to it. Links are plain `#id` anchors (they
 * work without JavaScript); with it, clicks scroll smoothly (instantly under reduced motion),
 * update the URL hash and move focus to the section.
 *
 * ```tsx
 * <SectionNav items={[{ id: "intro", label: "Introduction" }, { id: "setup", label: "Setup" }]} />
 * ```
 */
export const SectionNav = /*#__PURE__*/ React.forwardRef<HTMLElement, SectionNavProps>(function SectionNav(
  { items, sticky = true, top = "1.5rem", rootMargin = "-20% 0px -55% 0px", onActiveChange, title, labels, className, style, "aria-label": ariaLabel, ...props },
  ref,
) {
  const t = useLabels("sectionNav", sectionNavLabels, labels);
  const titleId = React.useId();
  const listRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState<string | null>(null);
  const [rule, setRule] = React.useState<{ y: number; h: number } | null>(null);
  const onActiveRef = React.useRef(onActiveChange);
  onActiveRef.current = onActiveChange;
  const ids = items.map((i) => i.id).join("\u0000");

  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        }
        let best: string | null = null;
        let y = Infinity;
        for (const [id, top] of visible) if (top < y) [best, y] = [id, top];
        // Between sections (nothing in the band) the last one stays current.
        if (best) setActive(best);
      },
      { rootMargin },
    );
    for (const id of ids.split("\u0000")) {
      const el = id ? document.getElementById(id) : null;
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [ids, rootMargin]);

  React.useEffect(() => {
    onActiveRef.current?.(active);
    const a = active ? listRef.current?.querySelector<HTMLElement>(`a[data-id="${CSS.escape(active)}"]`) : null;
    setRule(a ? { y: a.offsetTop, h: a.offsetHeight } : null);
  }, [active]);

  const onClick = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const off = reduced || el.closest('[data-motion="off"]') !== null || document.documentElement.getAttribute("data-motion") === "off";
    el.scrollIntoView?.({ behavior: off ? "auto" : "smooth", block: "start" });
    if (window.location.hash !== `#${id}`) window.history.pushState(null, "", `#${id}`);
    // Move focus so the next Tab continues from the section, not the nav.
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
    setActive(id);
  };

  return (
    <nav
      ref={ref}
      aria-label={title ? undefined : (ariaLabel ?? t("label"))}
      aria-labelledby={title ? titleId : undefined}
      data-slot="section-nav"
      className={cn(sticky && "sticky self-start", className)}
      style={sticky ? { top: typeof top === "number" ? `${top}px` : top, ...style } : style}
      {...props}
    >
      {title ? (
        <p id={titleId} className="mb-3 text-xs font-medium tracking-[0.08em] text-fg-subtle uppercase">
          {title}
        </p>
      ) : null}
      <div ref={listRef} className="relative border-s border-line">
        <span
          aria-hidden="true"
          data-slot="section-nav-indicator"
          className={cn(
            "absolute -start-px top-0 w-px bg-accent motion-safe:transition-[translate,height,opacity] motion-safe:duration-300 motion-safe:ease-out in-data-[motion=off]:transition-none",
            rule ? "opacity-100" : "opacity-0",
          )}
          style={{ height: rule?.h ?? 0, translate: `0 ${rule?.y ?? 0}px` }}
        />
        <ul className="m-0 flex list-none flex-col p-0">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              data-id={item.id}
              aria-current={active === item.id ? "location" : undefined}
              onClick={onClick(item.id)}
              className="flex items-baseline gap-3 rounded-e-ui-sm py-1.5 ps-4 pe-2 text-sm text-fg-muted transition-colors hover:text-fg focus-ring aria-[current]:text-fg"
            >
              {item.meta != null ? <span className="text-xs text-fg-subtle tabular">{item.meta}</span> : null}
              <span className="min-w-0">{item.label}</span>
            </a>
          </li>
        ))}
        </ul>
      </div>
    </nav>
  );
});
