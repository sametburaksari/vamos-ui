"use client";

import * as React from "react";
import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@vamos-ui/react";
import { generateAccent, TEXT_CONTRAST, type AccentPalette as Palette } from "@/lib/theme-codec";

function Ratio({ value }: { value: number }) {
  const ok = value >= TEXT_CONTRAST;
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-[10.5px] tabular-nums", ok ? "text-fg-muted" : "text-danger")}>
      {ok ? <Check aria-hidden className="size-3" /> : <AlertTriangle aria-hidden className="size-3" />}
      {value.toFixed(2)}:1
      <span className="sr-only">{ok ? "passes AA" : "fails AA"}</span>
    </span>
  );
}

function Swatch({ title, scope, bg, fg, ratio, sample }: { title: string; scope: "light" | "dark"; bg?: string; fg: string; ratio: number; sample: string }) {
  return (
    <li className="grid gap-1">
      <div className={cn(scope, "flex h-12 items-center justify-center rounded-ui-sm border border-line", scope === "light" ? "bg-scene" : "bg-surface-2")} style={bg ? { background: bg } : undefined}>
        <span className="text-[15px] font-semibold" style={{ color: fg }}>
          {sample}
        </span>
      </div>
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-[11px] text-fg-muted">{title}</span>
        <Ratio value={ratio} />
      </div>
    </li>
  );
}

/** The palette generateAccent derives from one colour, with contrast and any adjustments. */
export function AccentPalette({ colour }: { colour: string }) {
  const p: Palette | null = React.useMemo(() => {
    try {
      return generateAccent(colour);
    } catch {
      return null;
    }
  }, [colour]);
  if (!p) return null;
  return (
    <div className="grid gap-3" data-testid="accent-palette">
      <ul className="grid grid-cols-2 gap-2" aria-label="Generated accent palette">
        <Swatch title="Fill + text" scope="light" bg={p.base} fg={p.fg} ratio={p.contrast.fgOnBase} sample="Save" />
        {p.dark ? <Swatch title="Dark-mode fill" scope="dark" bg={p.dark.base} fg={p.dark.fg} ratio={p.contrast.darkFgOnBase ?? 0} sample="Save" /> : <Swatch title="Fill on dark" scope="dark" bg={p.base} fg={p.fg} ratio={p.contrast.fgOnBase} sample="Save" />}
        <Swatch title="Ink on light" scope="light" fg={p.inkLight} ratio={p.contrast.inkLightOnLight} sample="Link" />
        <Swatch title="Ink on dark" scope="dark" fg={p.inkDark} ratio={p.contrast.inkDarkOnDark} sample="Link" />
      </ul>
      {p.warnings.length ? (
        <ul className="grid gap-1.5 rounded-ui-sm border border-line bg-surface-2 p-2.5 text-[12px] leading-snug text-fg-muted" aria-label="Adjustments">
          {p.warnings.map((w) => (
            <li key={w} className="flex gap-2">
              <AlertTriangle aria-hidden className="mt-0.5 size-3.5 shrink-0 text-warning" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2 text-[12px] text-fg-muted">
          <Check aria-hidden className="size-3.5 text-success" /> Used as is: every text use reaches 4.5:1.
        </p>
      )}
    </div>
  );
}
