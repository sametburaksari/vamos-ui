"use client";

import * as React from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Button, IconButton, cn } from "@vamos-ui/react";
import { describePreset, encodePreset, presetAttributes, presetBrandCss, type Preset } from "@/lib/theme-codec";

function useCopy() {
  const [copied, setCopied] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copy = React.useCallback(async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(key);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1600);
  }, []);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  return { copied, copy };
}

function CodeLine({ label, value, copyKey, copied, onCopy }: { label: string; value: string; copyKey: string; copied: boolean; onCopy: (k: string, v: string) => void }) {
  return (
    <li className="group flex min-w-0 items-center gap-2 rounded-ui-sm border border-line bg-surface-2 py-1 ps-3 pe-1">
      <code className="min-w-0 flex-1 py-1 font-mono text-[12.5px] break-all text-fg">
        <span className="text-fg-subtle select-none">$ </span>
        {value}
      </code>
      <IconButton size="xs" label={copied ? "Copied" : `Copy ${label}`} onClick={() => onCopy(copyKey, value)}>
        {copied ? <Check className="text-success" /> : <Copy />}
      </IconButton>
    </li>
  );
}

function Block({ title, value, copyKey, copied, onCopy, note, wrap }: { title: string; value: string; copyKey: string; copied: boolean; onCopy: (k: string, v: string) => void; note?: React.ReactNode; wrap?: boolean }) {
  return (
    <div className="grid min-w-0 content-start gap-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-mono text-[11px] tracking-[0.12em] text-fg-subtle uppercase">{title}</h3>
        <IconButton size="xs" label={copied ? "Copied" : `Copy ${title}`} onClick={() => onCopy(copyKey, value)}>
          {copied ? <Check className="text-success" /> : <Copy />}
        </IconButton>
      </div>
      {note ? <p className="text-[12.5px] leading-snug text-fg-muted">{note}</p> : null}
      <pre tabIndex={0} aria-label={title} className={cn("max-h-72 overflow-auto rounded-ui-sm border border-line bg-surface-2 p-3 font-mono text-[12px] leading-relaxed text-fg focus-ring", wrap && "break-all whitespace-pre-wrap")}>
        {value}
      </pre>
    </div>
  );
}

export function ThemeOutput({ preset }: { preset: Preset }) {
  const code = encodePreset(preset);
  const { copied, copy } = useCopy();
  const attrs = presetAttributes(preset);
  const html = `<html ${Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ")}>`;
  const brand = presetBrandCss(preset);
  const commands = [
    { key: "init", label: "init command", value: `npx vamos-ui init --preset ${code}` },
    { key: "theme", label: "theme command", value: `npx vamos-ui theme --preset ${code}` },
    { key: "create", label: "create command", value: `npx vamos-ui create my-app --preset ${code}` },
  ];
  const [shareUrl, setShareUrl] = React.useState("");
  React.useEffect(() => {
    const u = new URL(window.location.href);
    u.search = `?p=${code}`;
    u.hash = "";
    setShareUrl(u.toString());
  }, [code]);

  return (
    <section aria-labelledby="theme-output-title" className="grid gap-6 rounded-ui-lg border border-line bg-surface p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid min-w-0 gap-1">
          <h2 id="theme-output-title" className="font-mono text-[11px] tracking-[0.12em] text-fg-subtle uppercase">
            Preset code
          </h2>
          <output data-testid="preset-code" className="font-mono text-[clamp(1.75rem,1.2rem+2.4vw,2.6rem)] leading-none font-medium tracking-tight break-all text-fg">
            {code}
          </output>
          <p className="text-[13px] text-fg-muted">{describePreset(preset)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => copy("code", code)}>
            {copied === "code" ? <Check className="text-success" /> : <Copy />}
            {copied === "code" ? "Copied" : "Copy code"}
          </Button>
          <Button size="sm" variant="primary" onClick={() => copy("url", shareUrl)} disabled={!shareUrl}>
            {copied === "url" ? <Check /> : <Link2 />}
            {copied === "url" ? "Link copied" : "Copy share link"}
          </Button>
        </div>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>

      <div className="grid min-w-0 gap-2">
        <h3 className="font-mono text-[11px] tracking-[0.12em] text-fg-subtle uppercase">Apply it</h3>
        <ul className="grid min-w-0 gap-1.5">
          {commands.map((c) => (
            <CodeLine key={c.key} label={c.label} value={c.value} copyKey={c.key} copied={copied === c.key} onCopy={copy} />
          ))}
        </ul>
        <p className="text-[12.5px] leading-snug text-fg-muted">
          <code className="font-mono text-[12px] text-fg">init</code> sets up an existing project, <code className="font-mono text-[12px] text-fg">theme</code> re-themes one that is already set up, <code className="font-mono text-[12px] text-fg">create</code> starts a new app.
        </p>
      </div>

      <div className={cn("grid min-w-0 items-start gap-6", brand && "xl:grid-cols-2")}>
        <Block wrap title="html attributes" value={html} copyKey="html" copied={copied === "html"} onCopy={copy} note={brand ? <>A custom accent or corner radius selects the generated accent: <code className="font-mono text-[12px]">data-accent=&quot;brand&quot;</code>.</> : "Set these on <html> (or any element, to theme just that subtree)."} />
        {brand ? <Block title="brand.css" value={brand} copyKey="brand" copied={copied === "brand"} onCopy={copy} note="The commands above write this file for you (with vamos.brand.json). Import it after the kit's styles.css." /> : null}
      </div>
    </section>
  );
}
