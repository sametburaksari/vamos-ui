"use client";

import * as React from "react";
import { ChevronDown, Contrast, RotateCcw, Type } from "lucide-react";
import { Button, Switch, ToggleGroup, ToggleGroupItem, cn } from "@vamos-ui/react";

/**
 * The accessibility toolbar (signature element). Text size, contrast and link underlines are
 * applied to the whole site by overriding the kit's own tokens on one wrapper — so every block,
 * in both languages and on every page, follows without knowing about it:
 *
 *   text size  → the root font size (115 % / 130 %), the way a browser's own text-size setting
 *                works: every rem-based size in the kit grows and layouts reflow, nothing overflows
 *   contrast   → muted text becomes full-strength text, hairlines become solid rules
 *   underline  → every link inside the site is underlined
 *
 * The choice is remembered on this device (localStorage, read after mount so the server HTML
 * and the first client render always match).
 */

export type TextSize = "standard" | "large" | "larger";
export type ContrastMode = "standard" | "high";

interface A11yState {
  size: TextSize;
  contrast: ContrastMode;
  underline: boolean;
}

const DEFAULTS: A11yState = { size: "standard", contrast: "standard", underline: false };
const STORAGE_KEY = "riverside-a11y";

const A11yContext = React.createContext<{ state: A11yState; set: (patch: Partial<A11yState>) => void } | null>(null);

function useA11y() {
  const ctx = React.useContext(A11yContext);
  if (!ctx) throw new Error("The accessibility toolbar must be inside <A11yProvider>.");
  return ctx;
}

const FACTOR: Record<TextSize, number> = { standard: 1, large: 1.15, larger: 1.3 };

/** High contrast: every grey becomes full-strength text, every hairline a visible rule. */
const HIGH_CONTRAST = {
  "--fg-muted": "var(--fg)",
  "--fg-subtle": "var(--fg)",
  "--line": "color-mix(in oklch, var(--fg) 55%, transparent)",
  "--surface-border": "color-mix(in oklch, var(--fg) 70%, transparent)",
  "--field-border": "var(--fg)",
  "--field-border-hover": "var(--fg)",
  "--surface-2": "var(--surface)",
  "--scene": "var(--surface)",
  "--surface-shadow": "none",
} as React.CSSProperties;

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<A11yState>(DEFAULTS);

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<A11yState> | null;
      if (saved) setState((s) => ({ ...s, ...saved }));
    } catch {
      /* storage blocked: keep the defaults */
    }
  }, []);

  const set = React.useCallback((patch: Partial<A11yState>) => {
    setState((s) => {
      const next = { ...s, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* not persisted, still applied */
      }
      return next;
    });
  }, []);

  const ctx = React.useMemo(() => ({ state, set }), [state, set]);
  // Text size lives on <html>: the kit's type scale is in rem, so this is the one switch that
  // reaches every block, overlay and portal. Restored when the site unmounts.
  React.useEffect(() => {
    const root = document.documentElement;
    const f = FACTOR[state.size];
    root.style.fontSize = f === 1 ? "" : `${f * 100}%`;
    return () => {
      root.style.fontSize = "";
    };
  }, [state.size]);

  const style = state.contrast === "high" ? HIGH_CONTRAST : undefined;

  return (
    <A11yContext.Provider value={ctx}>
      <div
        data-a11y-size={state.size}
        data-a11y-contrast={state.contrast}
        data-a11y-underline={state.underline ? "" : undefined}
        style={style}
        className={cn(
          "min-h-dvh bg-scene text-fg",
          state.underline && "[&_a]:underline [&_a]:decoration-[0.08em] [&_a]:underline-offset-[0.2em]",
          state.contrast === "high" && "[&_:focus-visible]:outline-[3px] [&_:focus-visible]:outline-offset-2 [&_:focus-visible]:outline-fg",
        )}
      >
        {children}
      </div>
    </A11yContext.Provider>
  );
}

/** The chosen option must be unmistakable: full-strength ink, not a tint. */
const PRESSED = "data-[state=on]:bg-fg data-[state=on]:text-scene data-[state=on]:hover:bg-fg";

export interface A11yToolbarLabels {
  region: string;
  title: string;
  size: string;
  sizes: Record<TextSize, string>;
  contrast: string;
  contrasts: Record<ContrastMode, string>;
  underline: string;
  reset: string;
  /** Shown next to the collapsed phone toggle when something is changed. */
  on: string;
  statement: string;
  statementHref: string;
}

/** The bar itself: a labelled region at the very top of every page, before the navigation. */
export function A11yToolbar({ labels }: { labels: A11yToolbarLabels }) {
  const { state, set } = useA11y();
  const [open, setOpen] = React.useState(false);
  const changed = state.size !== DEFAULTS.size || state.contrast !== DEFAULTS.contrast || state.underline !== DEFAULTS.underline;

  return (
    <section aria-label={labels.region} data-a11y-toolbar="" className="border-b-2 border-fg bg-surface">
      <div className="mx-auto flex max-w-[76rem] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <p className="m-0 hidden items-center gap-2 text-small font-semibold text-fg lg:flex">
          <span aria-hidden className="grid size-6 place-items-center rounded-full bg-fg text-scene">
            <Type className="size-3.5" />
          </span>
          {labels.title}
        </p>
        {/* Phones: one line that opens the settings, so the toolbar never pushes the page down. */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="a11y-controls"
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-10 flex-1 items-center gap-2 rounded-ui-sm text-small font-semibold text-fg focus-ring lg:hidden"
        >
          <span aria-hidden className="grid size-6 place-items-center rounded-full bg-fg text-scene">
            <Type className="size-3.5" />
          </span>
          {labels.title}
          {changed ? <span className="font-normal text-fg-muted">· {labels.on}</span> : null}
          <ChevronDown aria-hidden className={cn("ms-auto size-4 transition-transform motion-reduce:transition-none", open && "rotate-180")} />
        </button>

        <div id="a11y-controls" className={cn("w-full flex-wrap items-center gap-x-6 gap-y-3 pb-2 lg:contents", open ? "flex" : "hidden")}>
        <div className="flex items-center gap-2.5">
          <span id="a11y-size-label" className="text-small text-fg">
            {labels.size}
          </span>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            aria-labelledby="a11y-size-label"
            value={state.size}
            onValueChange={(v) => v && set({ size: v as TextSize })}
          >
            {(["standard", "large", "larger"] as const).map((s, i) => (
              <ToggleGroupItem key={s} value={s} aria-label={labels.sizes[s]} title={labels.sizes[s]} className={cn("min-w-9 font-semibold", PRESSED)}>
                <span aria-hidden style={{ fontSize: `${0.8 + i * 0.18}rem` }}>
                  A
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex items-center gap-2.5">
          <span id="a11y-contrast-label" className="flex items-center gap-1.5 text-small text-fg">
            <Contrast aria-hidden className="size-4" />
            {labels.contrast}
          </span>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            aria-labelledby="a11y-contrast-label"
            value={state.contrast}
            onValueChange={(v) => v && set({ contrast: v as ContrastMode })}
          >
            {(["standard", "high"] as const).map((c) => (
              <ToggleGroupItem key={c} value={c} className={PRESSED}>
                {labels.contrasts[c]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <Switch id="a11y-underline" size="sm" checked={state.underline} onCheckedChange={(v) => set({ underline: v })} label={labels.underline} />

        <div className="ms-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" disabled={!changed} onClick={() => set(DEFAULTS)}>
            <RotateCcw aria-hidden className="size-3.5" />
            {labels.reset}
          </Button>
          <a href={labels.statementHref} className="text-small font-medium text-accent-ink underline underline-offset-[0.2em] focus-ring rounded-[2px]">
            {labels.statement}
          </a>
        </div>
        </div>
      </div>
    </section>
  );
}
