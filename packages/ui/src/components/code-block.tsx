"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { IconButton } from "./button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { highlightCode, parseLineRanges, type CodeTokenKind } from "./code-highlight";

export const codeBlockLabels = {
  /** Copy button name. */
  copy: "Copy code",
  /** Copy button name (and polite announcement) right after copying. */
  copied: "Copied",
  /** Announced when the clipboard is blocked and the fallback failed too. */
  copyFailed: "Couldn't copy. Select the code and copy it by hand.",
  /** Name of the scrollable code area when there is no title: "{language} code". */
  codeIn: "{language} code",
  /** Name of the scrollable code area without title or language. */
  code: "Code",
  /** Name of the language tab list (CodeTabs). */
  languages: "Language",
};
export type CodeBlockLabels = typeof codeBlockLabels;

/* ------------------------------------------------------------------ */
/* Clipboard                                                            */
/* ------------------------------------------------------------------ */

/**
 * Copies text. Falls back to a hidden textarea + `execCommand("copy")` where the async clipboard
 * is blocked (insecure origins, some embedded webviews). Resolves `false` when both fail.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/* ------------------------------------------------------------------ */
/* A deliberately small highlighter                                     */
/* ------------------------------------------------------------------ */

// Server-safe: the highlighter lives in its own module so server components can call
// highlightCode() and parseLineRanges().
export { highlightCode, parseLineRanges, type CodeToken, type CodeTokenKind } from "./code-highlight";

const TONE: Record<CodeTokenKind, string | undefined> = {
  keyword: "text-accent-ink",
  string: "text-success-ink",
  number: "text-warning-ink",
  comment: "text-fg-subtle italic",
  function: "text-info-ink",
  plain: undefined,
};

/**
 * A highlighter adapter: return one node per line (keeps line numbers and highlighted lines), or
 * an HTML string (e.g. Shiki's `codeToHtml`; a wrapping `<pre><code>` is removed and lines are
 * split on newlines, so each line's markup must be self-contained, as Shiki's is).
 */
export type CodeHighlighter = (code: string, language: string) => React.ReactNode[] | string;



function stripPre(html: string): string {
  const m = /^\s*<pre[^>]*>\s*<code[^>]*>([\s\S]*)<\/code>\s*<\/pre>\s*$/i.exec(html);
  return (m ? m[1]! : html).replace(/\n$/, "");
}

interface CodeLinesProps {
  code: string;
  language: string;
  html?: string;
  highlight?: CodeHighlighter | false;
  lineNumbers?: boolean | number;
  highlightLines?: string | (number | [number, number])[];
  wrap?: boolean;
}

/** The `<code>` with one row per line. */
function CodeLines({ code, language, html, highlight, lineNumbers, highlightLines, wrap }: CodeLinesProps) {
  const marked = React.useMemo(() => parseLineRanges(highlightLines), [highlightLines]);
  const rows = React.useMemo<React.ReactNode[]>(() => {
    const source = html ?? (highlight ? highlight(code, language) : undefined);
    if (typeof source === "string") return stripPre(source).split("\n").map((h, i) => <span key={i} dangerouslySetInnerHTML={{ __html: h }} />);
    if (Array.isArray(source)) return source;
    if (highlight === false) return code.split("\n");
    return highlightCode(code, language).map((tokens, i) => (
      <React.Fragment key={i}>{tokens.map((tk, j) => (TONE[tk.kind] ? <span key={j} className={TONE[tk.kind]}>{tk.text}</span> : tk.text))}</React.Fragment>
    ));
  }, [code, language, html, highlight]);
  const start = typeof lineNumbers === "number" ? lineNumbers : 1;
  const numbered = lineNumbers !== undefined && lineNumbers !== false;
  return (
    <code className={cn("grid font-mono text-[13px] leading-[1.7] [tab-size:2]", !wrap && "min-w-max")}>
      {rows.map((row, i) => {
        const n = start + i;
        const on = marked.has(n);
        return (
          <span
            key={i}
            data-line={n}
            data-highlighted={on ? "" : undefined}
            className={cn("grid border-s-2 pe-4", numbered ? "grid-cols-[auto_1fr]" : "ps-4", on ? "border-accent bg-accent-soft" : "border-transparent")}
          >
            {numbered ? (
              <span aria-hidden="true" className="min-w-[3ch] select-none ps-3 pe-4 text-end text-fg-subtle tabular">
                {n}
              </span>
            ) : null}
            <span className={cn("min-h-[1.7em] text-fg", wrap ? "break-words whitespace-pre-wrap" : "whitespace-pre")}>{isEmpty(row) ? "​" : row}</span>
          </span>
        );
      })}
    </code>
  );
}

const isEmpty = (row: React.ReactNode) => row === "" || row == null || (React.isValidElement(row) && row.type === React.Fragment && React.Children.count((row.props as { children?: React.ReactNode }).children) === 0);

/* ------------------------------------------------------------------ */
/* Copy button                                                          */
/* ------------------------------------------------------------------ */

function CopyCode({ text, labels }: { text: string; labels: Pick<CodeBlockLabels, "copy" | "copied" | "copyFailed"> }) {
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle");
  React.useEffect(() => {
    if (state === "idle") return;
    const id = window.setTimeout(() => setState("idle"), state === "copied" ? 1600 : 4000);
    return () => window.clearTimeout(id);
  }, [state]);
  return (
    <>
      <IconButton
        size="sm"
        variant="ghost"
        label={state === "copied" ? labels.copied : labels.copy}
        tooltip={false}
        data-slot="code-copy"
        className="shrink-0 text-fg-muted hover:text-fg"
        onClick={async () => setState((await copyText(text)) ? "copied" : "failed")}
      >
        {state === "copied" ? <Check aria-hidden className="text-success-ink" /> : <Copy aria-hidden />}
      </IconButton>
      <span role="status" className="sr-only">
        {state === "copied" ? labels.copied : state === "failed" ? labels.copyFailed : ""}
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* CodeBlock                                                            */
/* ------------------------------------------------------------------ */

interface CodeDisplayProps {
  /** Show line numbers; a number sets the first one. */
  lineNumbers?: boolean | number;
  /** Lines to mark: `"2,5-7"` or `[2, [5, 7]]` (1-based, after `lineNumbers` offset). */
  highlightLines?: string | (number | [number, number])[];
  /** Highlighter adapter; `false` shows plain text. Default: the built-in small highlighter. */
  highlight?: CodeHighlighter | false;
  /** Wrap long lines instead of scrolling sideways. */
  wrap?: boolean;
  /** Cap the code area height (scrolls inside). */
  maxHeight?: number | string;
  /** Show the copy button. Default `true`. */
  copy?: boolean;
  /** `"dark"` renders a dark code window on any page; `"inherit"` (default) follows the page. */
  scheme?: "inherit" | "dark";
  labels?: Partial<CodeBlockLabels>;
}

export interface CodeBlockProps extends CodeDisplayProps, Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** The source text (copied as-is). */
  code: string;
  /** Language id for the highlighter and the accessible name (`"ts"`, `"python"`, `"bash"`). */
  language?: string;
  /** File name or title in the header bar. */
  title?: React.ReactNode;
  /** Text under the block (`<figcaption>`). */
  caption?: React.ReactNode;
  /** Pre-highlighted HTML for `code` (rendered as-is; only pass trusted markup). */
  html?: string;
  /** Extra controls at the end of the header (before the copy button). */
  actions?: React.ReactNode;
}

const frameCls = "min-w-0 overflow-hidden rounded-ui border border-line bg-surface-2 text-fg";
const barCls = "flex min-h-11 min-w-0 items-center gap-3 border-b border-line ps-4 pe-1.5";
const titleCls = "min-w-0 truncate font-mono text-xs text-fg-muted";

function CodePre({ label, maxHeight, children }: { label: string; maxHeight?: number | string; children: React.ReactNode }) {
  return (
    // A labelled group so the scrollable area can take focus (keyboard scrolling) with a name.
    <pre
      role="group"
      tabIndex={0}
      dir="ltr"
      aria-label={label}
      data-slot="code-scroll"
      className="m-0 overflow-auto bg-transparent py-3 focus-ring focus-visible:outline-offset-[-2px]"
      style={maxHeight !== undefined ? { maxHeight } : undefined}
    >
      {children}
    </pre>
  );
}

const textOf = (node: React.ReactNode): string => (typeof node === "string" || typeof node === "number" ? String(node) : "");

/**
 * Highlighted code with an optional file name, line numbers, marked lines and a copy button.
 * The built-in highlighter is small (comments, strings, numbers, keywords, calls) and colours
 * with tokens only; pass `highlight` or `html` to use Shiki or Prism output instead.
 *
 * ```tsx
 * <CodeBlock title="server.ts" language="ts" code={source} lineNumbers highlightLines="3-4" />
 * <CodeBlock language="bash" code="npm install @vamos-ui/react" scheme="dark" />
 * ```
 */
export const CodeBlock = /*#__PURE__*/ React.forwardRef<HTMLElement, CodeBlockProps>(function CodeBlock(
  { code, language = "", title, caption, html, actions, lineNumbers, highlightLines, highlight, wrap, maxHeight, copy = true, scheme = "inherit", labels, className, ...props },
  ref,
) {
  const t = useLabels("codeBlock", codeBlockLabels, labels);
  const name = textOf(title) || (language ? t("codeIn", { language }) : t("code"));
  const header = title != null || actions != null;
  return (
    <figure ref={ref} data-slot="code-block" data-language={language || undefined} className={cn("m-0 flex min-w-0 flex-col gap-2", className)} {...props}>
      <div className={cn(frameCls, "relative", scheme === "dark" && "dark")}>
        {header ? (
          <div className={barCls}>
            {title != null ? <span className={titleCls}>{title}</span> : null}
            <span className="ms-auto flex items-center gap-1">
              {actions}
              {copy ? <CopyCode text={code} labels={t.labels} /> : null}
            </span>
          </div>
        ) : copy ? (
          <div className="absolute end-1.5 top-1.5 z-10 rounded-ui-sm bg-surface-2">
            <CopyCode text={code} labels={t.labels} />
          </div>
        ) : null}
        <CodePre label={name} maxHeight={maxHeight}>
          <CodeLines code={code} language={language} html={html} highlight={highlight} lineNumbers={lineNumbers} highlightLines={highlightLines} wrap={wrap} />
        </CodePre>
      </div>
      {caption != null ? <figcaption className="text-xs text-fg-muted">{caption}</figcaption> : null}
    </figure>
  );
});

/* ------------------------------------------------------------------ */
/* Shared language choice                                               */
/* ------------------------------------------------------------------ */

const chosen = new Map<string, string>();
const listeners = new Set<() => void>();
const storageKeyOf = (group: string, persist: boolean | string | undefined) => (typeof persist === "string" ? persist : persist ? `vui-code-language:${group}` : null);

function setChosen(group: string, value: string, key: string | null) {
  if (chosen.get(group) === value) return;
  chosen.set(group, value);
  if (key) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* storage blocked: the choice still holds for this page */
    }
  }
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/**
 * The language chosen in any CodeTabs of `group` — read it to make install lines, SDK tables or
 * your own switch follow the same choice. `persist` remembers it in localStorage (`true` uses
 * `vui-code-language:<group>`, a string is the key).
 *
 * ```tsx
 * const [lang, setLang] = useCodeLanguage("sdk", { persist: true });
 * ```
 */
export function useCodeLanguage(group = "default", options: { persist?: boolean | string } = {}): [string | undefined, (value: string) => void] {
  const key = storageKeyOf(group, options.persist);
  const value = React.useSyncExternalStore(
    subscribe,
    () => chosen.get(group),
    () => undefined,
  );
  React.useEffect(() => {
    if (!key || chosen.has(group)) return;
    try {
      const saved = window.localStorage.getItem(key);
      if (saved) setChosen(group, saved, null);
    } catch {
      /* storage blocked: keep the default */
    }
  }, [group, key]);
  const set = React.useCallback((next: string) => setChosen(group, next, key), [group, key]);
  return [value, set];
}

/* ------------------------------------------------------------------ */
/* CodeTabs                                                             */
/* ------------------------------------------------------------------ */

export interface CodeSample {
  /** Language id: the tab value, the sync key and the highlighter language. */
  language: string;
  /** Tab text. Default: `language`. */
  label?: React.ReactNode;
  code: string;
  /** File name shown in the header while this tab is selected. */
  title?: React.ReactNode;
  /** Pre-highlighted HTML for this sample. */
  html?: string;
  /** Lines to mark in this sample. */
  highlightLines?: string | (number | [number, number])[];
}

export interface CodeTabsProps extends CodeDisplayProps, Omit<React.HTMLAttributes<HTMLElement>, "title" | "defaultValue" | "onChange"> {
  samples: CodeSample[];
  /**
   * Sync group: every CodeTabs (and `useCodeLanguage`) with the same group shows the same
   * language. Default `"default"`; `false` makes this one independent.
   */
  group?: string | false;
  /** Remember the choice per browser (see `useCodeLanguage`). */
  persist?: boolean | string;
  /** Controlled language. */
  value?: string;
  /** Initial language when nothing is chosen yet. Default: the first sample. */
  defaultValue?: string;
  onValueChange?: (language: string) => void;
  /** Header title when the selected sample has none. */
  title?: React.ReactNode;
  caption?: React.ReactNode;
  /** Keep this block still on screen when other blocks change height after a switch. Default `true`. */
  keepPosition?: boolean;
}

/**
 * The same snippet in several languages. Picking a language here switches every CodeTabs in the
 * same `group` on the page (and anything reading `useCodeLanguage`), optionally remembered per
 * browser. The block you clicked stays where it is while blocks above it change height.
 *
 * ```tsx
 * <CodeTabs persist samples={[{ language: "ts", label: "TypeScript", title: "send.ts", code: ts }, { language: "python", label: "Python", code: py }]} />
 * ```
 */
export const CodeTabs = /*#__PURE__*/ React.forwardRef<HTMLElement, CodeTabsProps>(function CodeTabs(
  {
    samples,
    group = "default",
    persist,
    value: valueProp,
    defaultValue,
    onValueChange,
    title,
    caption,
    keepPosition = true,
    lineNumbers,
    highlightLines,
    highlight,
    wrap,
    maxHeight,
    copy = true,
    scheme = "inherit",
    labels,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("codeBlock", codeBlockLabels, labels);
  const [shared, setShared] = useCodeLanguage(group || "default", { persist: group === false ? undefined : persist });
  const [local, setLocal] = React.useState<string | undefined>(undefined);
  const has = (v: string | undefined): v is string => v !== undefined && samples.some((s) => s.language === v);
  const wanted = valueProp ?? (group === false ? local : shared);
  const value = has(wanted) ? wanted : has(defaultValue) ? defaultValue : (samples[0]?.language ?? "");
  const active = samples.find((s) => s.language === value) ?? samples[0];

  const root = React.useRef<HTMLElement | null>(null);
  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      root.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const choose = (next: string) => {
    const before = keepPosition ? root.current?.getBoundingClientRect().top : undefined;
    if (valueProp === undefined) {
      if (group === false) setLocal(next);
      else setShared(next);
    }
    onValueChange?.(next);
    if (before === undefined || typeof requestAnimationFrame === "undefined") return;
    requestAnimationFrame(() => {
      const after = root.current?.getBoundingClientRect().top;
      if (after !== undefined && Math.abs(after - before) > 1) window.scrollBy({ top: after - before, behavior: "instant" as ScrollBehavior });
    });
  };

  const heading = active?.title ?? title;
  const languageName = (s: CodeSample) => textOf(s.label) || s.language;
  return (
    <figure ref={setRef} data-slot="code-tabs" data-language={value || undefined} className={cn("m-0 flex min-w-0 flex-col gap-2", className)} {...props}>
      <Tabs value={value} onValueChange={choose} className={cn(frameCls, "gap-0", scheme === "dark" && "dark")}>
        <div className={barCls}>
          {heading != null ? <span className={cn(titleCls, "hidden sm:inline")}>{heading}</span> : null}
          <TabsList variant="segmented" size="sm" aria-label={t("languages")} className="font-mono">
            {samples.map((s) => (
              <TabsTrigger key={s.language} value={s.language}>
                {s.label ?? s.language}
              </TabsTrigger>
            ))}
          </TabsList>
          {copy && active ? (
            <span className="ms-auto flex items-center">
              <CopyCode text={active.code} labels={t.labels} />
            </span>
          ) : null}
        </div>
        {samples.map((s) => (
          <TabsContent key={s.language} value={s.language} className="mt-0">
            <CodePre label={textOf(s.title ?? title) ? `${textOf(s.title ?? title)} · ${languageName(s)}` : t("codeIn", { language: languageName(s) })} maxHeight={maxHeight}>
              <CodeLines code={s.code} language={s.language} html={s.html} highlight={highlight} lineNumbers={lineNumbers} highlightLines={s.highlightLines ?? highlightLines} wrap={wrap} />
            </CodePre>
          </TabsContent>
        ))}
      </Tabs>
      {caption != null ? <figcaption className="text-xs text-fg-muted">{caption}</figcaption> : null}
    </figure>
  );
});
