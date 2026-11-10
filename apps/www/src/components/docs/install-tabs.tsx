"use client";

import * as React from "react";
import { cn } from "@vamos-cms/ui";
import { CodeFrame } from "./code-frame";

const pms = {
  pnpm: (s: string) => s.replace("{x}", "pnpm dlx").replace("{add}", "pnpm add"),
  npm: (s: string) => s.replace("{x}", "npx").replace("{add}", "npm install"),
  bun: (s: string) => s.replace("{x}", "bunx --bun").replace("{add}", "bun add"),
};

function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: readonly T[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-0.5 text-[12.5px]">
      {options.map((o) => (
        <button key={o} role="tab" aria-selected={value === o} onClick={() => onChange(o)}
          className={cn("rounded-[7px] px-2.5 py-1 font-medium transition focus-ring", value === o ? "bg-selected text-fg" : "text-fg-muted hover:text-fg")}>
          {o}
        </button>
      ))}
    </div>
  );
}

/** Installation: package / CLI (copy into your project) / manual (source). */
export function InstallTabs({ slug, deps, sources }: { slug: string; deps: string[]; sources: { file: string; html: string; raw: string }[] }) {
  const [mode, setMode] = React.useState<"Package" | "CLI" | "Manual">("Package");
  const [pm, setPm] = React.useState<keyof typeof pms>("pnpm");
  const cmd =
    mode === "Package"
      ? pms[pm]("{add} @vamos-cms/ui")
      : pms[pm](`{x} vamos-ui add ${slug}`);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
        <Seg label="Install method" value={mode} options={["Package", "CLI", "Manual"] as const} onChange={setMode} />
        {mode !== "Manual" && <Seg label="Package manager" value={pm} options={["pnpm", "npm", "bun"] as const} onChange={setPm} />}
      </div>
      {mode === "Manual" ? (
        <div className="grid gap-3 text-[13.5px] text-fg-muted">
          <p>1. Install the dependencies: <code className="rounded bg-selected px-1.5 py-0.5 font-mono text-[12px] text-fg">{deps.join(" ")}</code></p>
          <p>2. Copy the source below into your project and update the import paths.</p>
          {sources.map((s) => <CodeFrame key={s.file} html={s.html} raw={s.raw} title={s.file} />)}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-ui border border-line bg-surface-2 py-2.5 ps-4 pe-2 font-mono text-[12.5px]">
            <span><span className="text-fg-subtle select-none">$ </span>{cmd}</span>
          </div>
          <p className="text-[12.5px] text-fg-subtle">
            {mode === "Package"
              ? "The whole kit as one package — get updates by bumping the version. Add the styles to globals.css: @import \"@vamos-cms/ui/styles.css\";"
              : "Copies just this component into your project. The code is yours to change, and vamos-ui diff/upgrade can still bring in fixes later. Available once the registry is published."}
          </p>
        </>
      )}
    </div>
  );
}
