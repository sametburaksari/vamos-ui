"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button, cn, Tabs, TabsContent, TabsList, TabsTrigger, ThemeScope } from "@vamos-ui/react";
import { CODE, FILE, LANG_LABEL, LANGS, type Lang, type Sample } from "./content";
import { useLang } from "./lang-provider";

/** Copies text; falls back to a hidden textarea where the async clipboard is blocked. */
export async function copyText(text: string): Promise<boolean> {
  try {
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

/** A copy button with a short "Copied" state, announced politely. */
export function CopyButton({ text, label, doneLabel, className, size = "icon-sm" }: { text: string; label: string; doneLabel: string; className?: string; size?: "icon-xs" | "icon-sm" }) {
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => setDone(false), 1600);
    return () => window.clearTimeout(id);
  }, [done]);
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size={size}
        aria-label={done ? doneLabel : label}
        title={done ? doneLabel : label}
        className={cn("text-fg-muted hover:text-fg", className)}
        onClick={async () => setDone(await copyText(text))}
      >
        {done ? <Check aria-hidden className="text-accent-ink" /> : <Copy aria-hidden />}
      </Button>
      <span role="status" className="sr-only">
        {done ? doneLabel : ""}
      </span>
    </>
  );
}

const KEYWORDS = /^(import|from|const|let|await|async|for|of|in|def|return|func|if|nil|end|do|new|export|range|post|err)$/;
const TOKEN = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d[\d_]*\b|\b[A-Za-z_]+\b)/g;

/** A deliberately small highlighter: comments, strings, numbers and a few keywords. */
function Line({ text }: { text: string }) {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("#") || trimmed.startsWith("//")) return <span className="text-fg-subtle italic">{text}</span>;
  const inline = text.search(/\s(\/\/|#) /);
  const code = inline > 0 ? text.slice(0, inline) : text;
  const comment = inline > 0 ? text.slice(inline) : "";
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    const tok = m[0];
    const at = m.index ?? 0;
    if (at > last) parts.push(code.slice(last, at));
    if (tok.startsWith('"') || tok.startsWith("'")) parts.push(<span key={at} className="text-success">{tok}</span>);
    else if (/^\d/.test(tok)) parts.push(<span key={at} className="text-warning">{tok}</span>);
    else if (KEYWORDS.test(tok)) parts.push(<span key={at} className="text-accent-ink">{tok}</span>);
    else parts.push(tok);
    last = at + tok.length;
  }
  if (last < code.length) parts.push(code.slice(last));
  return (
    <>
      {parts}
      {comment ? <span className="text-fg-subtle italic">{comment}</span> : null}
    </>
  );
}

export function CodeLines({ code, numbers = true }: { code: string; numbers?: boolean }) {
  const lines = code.split("\n");
  return (
    <code className="grid min-w-max font-mono text-[13px] leading-[1.7]">
      {lines.map((line, i) => (
        <span key={i} className="grid grid-cols-[auto_1fr]">
          {numbers ? (
            <span aria-hidden className="w-8 select-none pe-4 text-end text-fg-subtle/70 tabular">
              {i + 1}
            </span>
          ) : (
            <span aria-hidden />
          )}
          <span className="whitespace-pre text-fg">
            <Line text={line} />
          </span>
        </span>
      ))}
    </code>
  );
}

export interface CodePanelProps {
  sample: Sample;
  /** Accessible name of the language tab list ("Language"). */
  tabsLabel: string;
  copyLabel: string;
  copiedLabel: string;
  /** Visible caption in the header; defaults to the file name for the language. */
  caption?: string;
  numbers?: boolean;
  className?: string;
}

/**
 * Dark code window with language tabs and a copy button. The selected language is shared with
 * every other panel on the page, so switching to Python here switches the whole site.
 */
export function CodePanel({ sample, tabsLabel, copyLabel, copiedLabel, caption, numbers = true, className }: CodePanelProps) {
  const { lang, setLang } = useLang();
  const code = CODE[sample][lang];
  return (
    <ThemeScope theme="dark" portal={false} className={cn("min-w-0 overflow-hidden rounded-ui-lg border border-line bg-surface-2 text-fg shadow-[var(--surface-shadow)]", className)}>
      <Tabs value={lang} onValueChange={(v) => setLang(v as Lang)} className="gap-0">
        <div className="flex min-w-0 items-center gap-3 border-b border-line ps-4 pe-2">
          <span className="hidden shrink-0 font-mono text-[11px] tracking-[0.06em] text-fg-subtle uppercase sm:inline">{caption ?? FILE[lang]}</span>
          <TabsList aria-label={tabsLabel} size="sm" className="min-w-0 flex-1 border-b-0 sm:justify-end">
            {LANGS.map((l) => (
              <TabsTrigger key={l} value={l} className="font-mono text-xs">
                {LANG_LABEL[l]}
              </TabsTrigger>
            ))}
          </TabsList>
          <CopyButton text={code} label={copyLabel} doneLabel={copiedLabel} />
        </div>
        {LANGS.map((l) => (
          <TabsContent key={l} value={l} className="mt-0 focus-visible:outline-none">
            <pre tabIndex={0} aria-label={`${LANG_LABEL[l]} · ${caption ?? FILE[l]}`} className="m-0 overflow-x-auto px-3 py-4 focus-ring">
              <CodeLines code={CODE[sample][l]} numbers={numbers} />
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </ThemeScope>
  );
}
