"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { SiteShell } from "@vamos-ui/react/blocks";
import type { CodeLang } from "./content";

type Mode = "light" | "dark";

interface BlogFrameValue {
  mode: Mode;
  setMode: (mode: Mode) => void;
  /** The language every code sample on the page shows. */
  lang: CodeLang;
  setLang: (lang: CodeLang) => void;
}

const BlogFrameContext = React.createContext<BlogFrameValue | null>(null);

export function useBlogFrame(): BlogFrameValue {
  const ctx = React.useContext(BlogFrameContext);
  if (!ctx) throw new Error("useBlogFrame must be used inside <BlogFrame>.");
  return ctx;
}

const STORE = "cold-path:prefs";

function readPrefs(): Partial<{ mode: Mode; lang: CodeLang }> {
  try {
    return JSON.parse(window.localStorage.getItem(STORE) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

function writePrefs(prefs: { mode: Mode; lang: CodeLang }) {
  try {
    window.localStorage.setItem(STORE, JSON.stringify(prefs));
  } catch {
    /* private mode: the choice lasts for this visit only */
  }
}

/**
 * The blog's frame: SiteShell with the site look (system type, solid, compact, amber accent),
 * dark by default with a reader-controlled light mode, and the code language shared by every
 * sample on the page. Both choices are remembered in this browser.
 */
export function BlogFrame({ pages, children }: { pages: string[]; children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<Mode>("dark");
  const [lang, setLangState] = React.useState<CodeLang>("go");

  React.useEffect(() => {
    const saved = readPrefs();
    if (saved.mode === "light" || saved.mode === "dark") setModeState(saved.mode);
    if (saved.lang === "go" || saved.lang === "rust" || saved.lang === "ts") setLangState(saved.lang);
  }, []);

  const value = React.useMemo<BlogFrameValue>(
    () => ({
      mode,
      lang,
      setMode: (next) => {
        setModeState(next);
        writePrefs({ mode: next, lang });
      },
      setLang: (next) => {
        setLangState(next);
        writePrefs({ mode, lang: next });
      },
    }),
    [mode, lang],
  );

  return (
    <BlogFrameContext.Provider value={value}>
      <SiteShell
        accent="#E9B949"
        motion="subtle"
        theme={mode}
        font="system"
        material="solid"
        density="compact"
        pages={pages}
        className="min-h-dvh bg-scene [--code-key:var(--accent-ink)] [--code-str:color-mix(in_oklch,var(--success)_78%,var(--fg))] [--code-num:color-mix(in_oklch,var(--warning)_70%,var(--fg))] [--code-fn:color-mix(in_oklch,var(--info)_80%,var(--fg))] [--code-type:color-mix(in_oklch,var(--info)_45%,var(--fg))]"
      >
        {children}
      </SiteShell>
    </BlogFrameContext.Provider>
  );
}

/** Light / dark switch for the status line. */
export function ThemeToggle({ label, lightLabel, darkLabel }: { label: string; lightLabel: string; darkLabel: string }) {
  const { mode, setMode } = useBlogFrame();
  const dark = mode === "dark";
  return (
    <button
      type="button"
      onClick={() => setMode(dark ? "light" : "dark")}
      aria-pressed={!dark}
      className="inline-flex h-7 items-center gap-1.5 rounded-ui-sm px-2 text-fg-muted transition-colors hover:bg-hover hover:text-fg focus-ring"
    >
      {dark ? <Moon aria-hidden className="size-3.5" /> : <Sun aria-hidden className="size-3.5" />}
      {/* The accessible name starts with the visible word (label-in-name), then says what the toggle does. */}
      <span>{dark ? darkLabel : lightLabel}</span>
      <span className="sr-only">, {label}</span>
    </button>
  );
}
