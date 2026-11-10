"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

export interface NavbarSubmenuProps {
  /** Trigger text. */
  label: React.ReactNode;
  /** Server-rendered links (the panel content). */
  children: React.ReactNode;
  /** The current page lives in this group (`aria-current` styling on the trigger). */
  active?: boolean;
  /** Wide panel with descriptions. */
  wide?: boolean;
  className?: string;
}

/**
 * Disclosure-pattern dropdown for navbar groups (~1 KB island; only rendered when an item has
 * children). Click / Enter / Space toggles, Escape closes and returns focus, focus or a click
 * leaving the group closes it, ArrowDown opens and moves into the panel.
 */
export function NavbarSubmenu({ label, children, active, wide, className }: NavbarSubmenuProps) {
  const [open, setOpen] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const panelId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const links = () => Array.from(root.current?.querySelectorAll<HTMLElement>("[data-nav-panel] a[href]") ?? []);

  return (
    <div
      ref={root}
      className={cn("relative", className)}
      data-state={open ? "open" : "closed"}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          const list = links();
          if (!list.length) return;
          e.preventDefault();
          if (!open) {
            setOpen(true);
            requestAnimationFrame(() => links()[0]?.focus());
            return;
          }
          const i = list.indexOf(document.activeElement as HTMLElement);
          const next = e.key === "ArrowDown" ? (i + 1) % list.length : i <= 0 ? list.length - 1 : i - 1;
          list[next]?.focus();
        }
      }}
      onBlur={(e) => {
        if (open && !root.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        data-active={active ? "" : undefined}
        className="vb-nav-link inline-flex items-center gap-1"
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        <ChevronDown aria-hidden strokeWidth={1.5} className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div
        id={panelId}
        data-nav-panel=""
        data-state={open ? "open" : "closed"}
        hidden={!open}
        className={cn(
          "surface-popover absolute start-0 top-[calc(100%+0.75rem)] z-(--z-popover) rounded-ui p-2 ui-pop",
          wide ? "w-[min(34rem,80vw)]" : "w-60",
        )}
      >
        {children}
      </div>
    </div>
  );
}
