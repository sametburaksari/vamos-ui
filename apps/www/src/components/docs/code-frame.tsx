"use client";

import * as React from "react";
import { cn } from "@vamos-cms/ui";
import { CopyButton } from "./copy-button";

/** Highlighted code + copy. Long snippets collapse behind "Expand". */
export function CodeFrame({ html, raw, title, collapsible = true, className }: { html: string; raw: string; title?: string; collapsible?: boolean; className?: string }) {
  const long = collapsible && raw.split("\n").length > 22;
  const [open, setOpen] = React.useState(!long);
  return (
    <div className={cn("relative overflow-hidden rounded-ui border border-line bg-surface-2", className)}>
      {title ? (
        <div className="flex h-10 items-center justify-between border-b border-line ps-4 pe-2">
          <span className="font-mono text-[12px] text-fg-muted">{title}</span>
          <CopyButton value={raw} />
        </div>
      ) : (
        <CopyButton value={raw} className="absolute end-2 top-2 z-10" />
      )}
      <div className={cn("relative overflow-x-auto px-4 py-3.5", !open && "max-h-[340px] overflow-hidden")} dangerouslySetInnerHTML={{ __html: html }} />
      {long && (
        <div className={cn("flex justify-center", open ? "border-t border-line py-2" : "absolute inset-x-0 bottom-0 bg-linear-to-t from-[var(--surface-2)] from-30% to-transparent pt-16 pb-3")}>
          <button onClick={() => setOpen((o) => !o)} className="rounded-full border border-field-border bg-field px-3 py-1 text-xs font-medium hover:bg-hover focus-ring">
            {open ? "Collapse" : "Expand"}
          </button>
        </div>
      )}
    </div>
  );
}
