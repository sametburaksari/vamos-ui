"use client";

import * as React from "react";
import { Eye, Code2, Monitor, Tablet, Smartphone, ExternalLink, FileCode2, Terminal } from "lucide-react";
import { cn, IconButton } from "@vamos-cms/ui";
import { CopyButton } from "../docs/copy-button";

export interface BlockFile { path: string; html: string; raw: string }

const widths = { desktop: "100%", tablet: "820px", mobile: "390px" } as const;

/**
 * Block viewer: live preview in an iframe (so the block gets the full viewport,
 * its own scroll and its own theme) or the source, file by file.
 */
export function BlockViewer({ name, title, description, files }: { name: string; title: string; description: string; files: BlockFile[] }) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  const [size, setSize] = React.useState<keyof typeof widths>("desktop");
  const [file, setFile] = React.useState(files[0]!.path);
  const current = files.find((f) => f.path === file) ?? files[0]!;
  const cli = `npx vamos-ui add ${name}`;

  return (
    <section id={name} className="scroll-mt-20">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{title} <span className="ms-1 font-mono text-[12px] font-normal text-fg-subtle">{name}</span></h2>
          <p className="mt-0.5 max-w-2xl text-[13.5px] text-fg-muted">{description}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div role="tablist" className="flex gap-0.5 rounded-ui-sm bg-selected p-0.5 text-[12.5px]">
            {(["preview", "code"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                className={cn("flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 font-medium focus-ring", tab === t ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:text-fg")}>
                {t === "preview" ? <Eye className="size-3.5" /> : <Code2 className="size-3.5" />}{t === "preview" ? "Preview" : "Code"}
              </button>
            ))}
          </div>
          {tab === "preview" && (
            <div className="hidden items-center gap-0.5 rounded-ui-sm border border-line p-0.5 md:flex">
              {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([k, I]) => (
                <IconButton key={k} size="xs" label={`${k} width`} variant={size === k ? "secondary" : "ghost"} onClick={() => setSize(k)}><I /></IconButton>
              ))}
            </div>
          )}
          <div className="hidden items-center gap-1.5 rounded-ui-sm border border-line py-0.5 ps-2.5 pe-0.5 font-mono text-[11.5px] text-fg-muted lg:flex">
            <Terminal className="size-3.5" /><span className="max-w-[300px] truncate">{cli}</span><CopyButton value={cli} />
          </div>
          <IconButton asChild size="sm" label="Open in new tab" variant="secondary">
            <a href={`/view/${name}`} target="_blank" rel="noreferrer"><ExternalLink /></a>
          </IconButton>
        </div>
      </div>

      {tab === "preview" ? (
        <div className="preview-stage overflow-hidden rounded-ui-lg border border-line bg-scene p-0">
          <div className="mx-auto transition-[width] duration-300" style={{ width: widths[size], maxWidth: "100%" }}>
            <iframe src={`/view/${name}`} title={`${title} preview`} loading="lazy" className="block h-[760px] w-full border-0 bg-scene" />
          </div>
        </div>
      ) : (
        <div className="grid overflow-hidden rounded-ui-lg border border-line bg-surface-2 md:grid-cols-[230px_minmax(0,1fr)]">
          <ul className="border-b border-line p-2 md:border-e md:border-b-0">
            {files.map((f) => (
              <li key={f.path}>
                <button onClick={() => setFile(f.path)}
                  className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start font-mono text-[12px] focus-ring", f.path === file ? "bg-selected text-fg" : "text-fg-muted hover:bg-hover hover:text-fg")}>
                  <FileCode2 className="size-3.5 shrink-0" /><span className="truncate">{f.path}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="relative min-w-0">
            <div className="flex h-10 items-center justify-between border-b border-line ps-4 pe-2">
              <span className="font-mono text-[12px] text-fg-muted">{current.path}</span>
              <CopyButton value={current.raw} />
            </div>
            <div className="max-h-[680px] overflow-auto px-4 py-3.5" dangerouslySetInnerHTML={{ __html: current.html }} />
          </div>
        </div>
      )}
    </section>
  );
}
