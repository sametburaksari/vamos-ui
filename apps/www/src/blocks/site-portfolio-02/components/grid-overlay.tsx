"use client";

import * as React from "react";
import { cn } from "@vamos-ui/react";
import { Container, useSiteShell } from "@vamos-ui/react/blocks";

const GridContext = React.createContext<{ on: boolean; toggle: () => void } | null>(null);

/**
 * Half of the signature: the 12-column grid every page is set on can be shown over the site
 * (navbar button, or the G key when no field has focus). The overlay uses the same Container
 * and gap as the layouts, so the columns line up with the real content.
 */
export function GridProvider({ children }: { children: React.ReactNode }) {
  const [on, setOn] = React.useState(false);
  const toggle = React.useCallback(() => setOn((v) => !v), []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "g" && e.key !== "G") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      setOn((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = React.useMemo(() => ({ on, toggle }), [on, toggle]);
  return (
    <GridContext.Provider value={value}>
      {children}
      <div className="fixed end-4 bottom-4 z-50">
        <GridToggle />
      </div>
      <div aria-hidden data-grid-overlay={on ? "on" : "off"} className={cn("pointer-events-none fixed inset-0 z-40 transition-opacity duration-300 motion-reduce:transition-none", on ? "opacity-100" : "opacity-0")}>
        <Container size="wide" className="h-full">
          <div className="grid h-full grid-cols-4 gap-x-5 @3xl:grid-cols-12">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className={cn("relative h-full border-x border-accent/40 bg-accent/[0.06]", i >= 4 && "hidden @3xl:block")}>
                <span className="absolute start-1 bottom-2 font-mono text-[10px] text-accent-ink">{String(i + 1).padStart(2, "0")}</span>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </GridContext.Provider>
  );
}

/** The floating "Grid" switch in the corner of the drawing, with its shortcut. */
function GridToggle() {
  const ctx = React.useContext(GridContext);
  const { locale } = useSiteShell();
  if (!ctx) return null;
  return (
    <button
      type="button"
      aria-pressed={ctx.on}
      onClick={ctx.toggle}
      data-grid-toggle
      className={cn(
        "inline-flex h-8 items-center gap-2 border px-2.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors focus-ring",
        ctx.on ? "border-accent bg-accent text-accent-fg" : "border-fg bg-scene text-fg shadow-sm hover:bg-hover",
      )}
    >
      <svg aria-hidden viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M2.5 0v12M6 0v12M9.5 0v12" />
      </svg>
      {locale === "tr" ? "Izgara" : "Grid"}
      <kbd className="hidden border border-current px-1 text-[10px] leading-4 opacity-70 @3xl:inline">G</kbd>
    </button>
  );
}
