"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { IconButton, Tabs, TabsContent, TabsList, TabsTrigger, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { useBlogFrame } from "./blog-frame";
import { codeLangs, type CodeLang } from "./content";

/* A tiny highlighter: comments, strings, numbers, keywords, calls and types. --------- */

type Lang = CodeLang | "sql";
type Kind = "key" | "str" | "num" | "com" | "fn" | "type" | "plain";

const KEYWORDS: Record<Lang, Set<string>> = {
  go: new Set("func return if err nil var const package import type struct for range go defer chan select switch case default map interface any error".split(" ")),
  rust: new Set("pub async fn let mut await impl struct use match if else return self Self as ref move where Ok Err Some None".split(" ")),
  ts: new Set("export async function const let await return try catch finally throw new import from type interface if else for of unknown Promise".split(" ")),
  sql: new Set(
    "create table bigint generated always as identity primary key text not null jsonb timestamptz default int unique index on where is and or update set in select from order by limit for skip locked returning interval insert into values conflict do nothing now".split(" "),
  ),
};

const TOKEN = /(\/\/[^\n]*|--[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\\n])*'|`[^`]*`)|(\$\d+|\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;

function tokenize(code: string, lang: Lang): { kind: Kind; text: string }[] {
  const out: { kind: Kind; text: string }[] = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ kind: "plain", text: code.slice(last, i) });
    const [text, com, str, num, word] = m;
    let kind: Kind = "plain";
    if (com) kind = com.startsWith("--") && lang !== "sql" ? "plain" : "com";
    else if (str) kind = lang === "rust" && str.startsWith("'") ? "plain" : "str";
    else if (num) kind = "num";
    else if (word) {
      const keys = KEYWORDS[lang];
      if (keys.has(lang === "sql" ? word.toLowerCase() : word)) kind = "key";
      else if (code[i + word.length] === "(" || code[i + word.length] === "!") kind = "fn";
      else if (lang !== "sql" && /^[A-Z]/.test(word)) kind = "type";
    }
    out.push({ kind, text });
    last = i + text.length;
  }
  if (last < code.length) out.push({ kind: "plain", text: code.slice(last) });
  return out;
}

const tone: Record<Kind, string | undefined> = {
  key: "text-(--code-key)",
  str: "text-(--code-str)",
  num: "text-(--code-num)",
  com: "text-fg-subtle italic",
  fn: "text-(--code-fn)",
  type: "text-(--code-type)",
  plain: undefined,
};

/** Highlighted code with line numbers; scrolls sideways inside its own box. */
function CodeLines({ code, lang, label }: { code: string; lang: Lang; label: string }) {
  const lines = React.useMemo(() => code.split("\n").map((line) => tokenize(line, lang)), [code, lang]);
  return (
    <pre
      tabIndex={0}
      aria-label={label}
      className="overflow-x-auto py-3 font-mono text-[13px] leading-[1.65] [tab-size:4] focus-ring focus-visible:outline-offset-[-2px]"
    >
      <code className="grid min-w-max">
        {lines.map((tokens, n) => (
          <span key={n} className="grid grid-cols-[3.25rem_1fr] pe-5">
            <span aria-hidden className="select-none pe-4 text-end text-fg-subtle tabular">
              {n + 1}
            </span>
            <span>
              {tokens.length ? tokens.map((tk, j) => (tone[tk.kind] ? <span key={j} className={tone[tk.kind]}>{tk.text}</span> : tk.text)) : "​"}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}

function CopyButton({ text, labels }: { text: string; labels: { copy: string; copied: string } }) {
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => setDone(false), 1600);
    return () => window.clearTimeout(id);
  }, [done]);
  return (
    <>
      <IconButton
        size="sm"
        variant="ghost"
        label={done ? labels.copied : labels.copy}
        tooltip={false}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setDone(true);
          } catch {
            /* clipboard blocked: the code stays selectable */
          }
        }}
      >
        {done ? <Check className="text-success" /> : <Copy />}
      </IconButton>
      <span role="status" className="sr-only">
        {done ? labels.copied : ""}
      </span>
    </>
  );
}

export interface CodeSampleLabels {
  copy: string;
  copied: string;
  /** "Code in {lang}" */
  codeIn: string;
  languages: string;
}

const frameCls = "overflow-hidden rounded-ui border border-line bg-surface-2";
const barCls = "flex min-h-11 items-center gap-3 border-b border-line ps-4 pe-1.5";

/**
 * A code sample in Go, Rust and TypeScript. The tabs are shared: picking a language here
 * switches every sample on the page (and the switch in the margin), and the block you clicked
 * stays where it was on screen while the others change height.
 */
export function CodeSample({ samples, caption, labels }: { samples: Record<CodeLang, string>; caption?: string; labels: CodeSampleLabels }) {
  const { lang, setLang } = useBlogFrame();
  const ref = React.useRef<HTMLElement>(null);
  const active = codeLangs.find((l) => l.id === lang) ?? codeLangs[0]!;

  const choose = (next: string) => {
    const before = ref.current?.getBoundingClientRect().top;
    setLang(next as CodeLang);
    // Keep this block still: samples above it may grow or shrink with the new language.
    requestAnimationFrame(() => {
      const after = ref.current?.getBoundingClientRect().top;
      if (before !== undefined && after !== undefined && Math.abs(after - before) > 1) window.scrollBy({ top: after - before, behavior: "instant" as ScrollBehavior });
    });
  };

  return (
    <figure ref={ref} className="not-prose my-8 flex flex-col gap-2">
      <Tabs value={lang} onValueChange={choose} className={frameCls}>
        <div className={barCls}>
          <span className="truncate font-mono text-eyebrow text-fg-muted">{active.file}</span>
          <TabsList variant="segmented" size="sm" overflow="none" aria-label={labels.languages} className="ms-auto">
            {codeLangs.map((l) => (
              <TabsTrigger key={l.id} value={l.id} className="font-mono">
                {l.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <CopyButton text={samples[lang]} labels={labels} />
        </div>
        {codeLangs.map((l) => (
          <TabsContent key={l.id} value={l.id} className="mt-0">
            <CodeLines code={samples[l.id]} lang={l.id} label={labels.codeIn.replace("{lang}", l.label)} />
          </TabsContent>
        ))}
      </Tabs>
      {caption ? <figcaption className="font-mono text-eyebrow text-fg-subtle">{caption}</figcaption> : null}
    </figure>
  );
}

/** A single-language block (SQL, shell) with a file name and copy button. */
export function CodeFile({ file, code, caption, labels }: { file: string; code: string; caption?: string; labels: CodeSampleLabels }) {
  return (
    <figure className="not-prose my-8 flex flex-col gap-2">
      <div className={frameCls}>
        <div className={barCls}>
          <span className="truncate font-mono text-eyebrow text-fg-muted">{file}</span>
          <span className="ms-auto font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-subtle">sql</span>
          <CopyButton text={code} labels={labels} />
        </div>
        <CodeLines code={code} lang="sql" label={labels.codeIn.replace("{lang}", "SQL")} />
      </div>
      {caption ? <figcaption className="font-mono text-eyebrow text-fg-subtle">{caption}</figcaption> : null}
    </figure>
  );
}

/** The same switch in the article margin — proof that it is one setting for the page. */
export function CodeLangSwitch({ label }: { label: string }) {
  const { lang, setLang } = useBlogFrame();
  return (
    <ToggleGroup type="single" size="sm" value={lang} onValueChange={(v) => v && setLang(v as CodeLang)} aria-label={label} block className="font-mono">
      {codeLangs.map((l) => (
        <ToggleGroupItem key={l.id} value={l.id}>
          {l.id === "ts" ? "TS" : l.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/** A short, highlighted excerpt for the home page (no chrome). */
export function CodeTeaser({ code, label }: { code: string; label: string }) {
  return <CodeLines code={code} lang="sql" label={label} />;
}
