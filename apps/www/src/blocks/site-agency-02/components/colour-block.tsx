import * as React from "react";
import { cn } from "@vamos-ui/react";
import { siteAccent } from "@vamos-ui/react/blocks";
import type { MarkShape } from "./content";

const cache = new Map<string, React.CSSProperties>();

/**
 * One brand colour → the kit's four accent variables, contrast-checked by `siteAccent`
 * (text on the fill ≥ 4.5:1). Inside, `bg-accent` / `text-accent-fg` / `text-accent-ink` are
 * that colour — so a colour block is still tokens all the way down.
 */
export function accentVars(colour: string): React.CSSProperties {
  let v = cache.get(colour);
  if (!v) {
    const p = siteAccent(colour);
    v = { "--accent-base": p.base, "--accent-fg": p.fg, "--accent-ink-light": p.inkLight, "--accent-ink-dark": p.inkDark } as React.CSSProperties;
    cache.set(colour, v);
  }
  return v;
}

/** The accent scope attributes for an element painted in a brand colour. */
export const accentScope = (colour: string) => ({ "data-accent": "custom", style: accentVars(colour) }) as const;

export interface ColourBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  colour: string;
  as?: "div" | "section" | "li" | "article";
}

/** A block filled with a brand colour and its contrast-safe text colour. Server-compatible. */
export function ColourBlock({ colour, as = "div", className, style, ...props }: ColourBlockProps) {
  const Comp = as as "div";
  return <Comp data-accent="custom" style={{ ...accentVars(colour), ...style }} className={cn("bg-accent text-accent-fg", className)} {...props} />;
}

/** Each client's mark, drawn in currentColor so it follows the block's text colour. */
export function BrandMark({ shape, className, title }: { shape: MarkShape; className?: string; title?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 6 } as const;
  return (
    <svg viewBox="0 0 100 100" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {shape === "drop" ? (
        <>
          <path d="M50 8 C50 8 20 46 20 64 a30 30 0 0 0 60 0 C80 46 50 8 50 8 Z" fill="currentColor" />
          <path d="M34 66 a16 16 0 0 0 16 16" {...common} stroke="var(--accent-base)" strokeWidth={5} strokeLinecap="round" />
        </>
      ) : shape === "wheels" ? (
        <>
          <circle cx="27" cy="62" r="19" {...common} />
          <circle cx="73" cy="62" r="19" {...common} />
          <path d="M27 62 L45 30 L62 62 Z M45 30 L73 62" {...common} strokeLinejoin="round" />
        </>
      ) : shape === "leaf" ? (
        <>
          <path d="M18 82 C18 40 46 16 84 16 C84 58 58 82 18 82 Z" fill="currentColor" />
          <path d="M22 78 L70 30" {...common} stroke="var(--accent-base)" strokeWidth={4} />
        </>
      ) : shape === "orbit" ? (
        <>
          <circle cx="50" cy="50" r="34" {...common} strokeWidth={8} />
          <circle cx="78" cy="24" r="9" fill="currentColor" />
          <circle cx="50" cy="50" r="12" fill="currentColor" />
        </>
      ) : shape === "lens" ? (
        <>
          <circle cx="28" cy="52" r="20" {...common} />
          <circle cx="72" cy="52" r="20" {...common} />
          <path d="M48 50 Q50 44 52 50" {...common} />
        </>
      ) : (
        <>
          <rect x="14" y="14" width="72" height="30" fill="currentColor" />
          <rect x="14" y="52" width="32" height="34" {...common} />
          <rect x="54" y="52" width="32" height="34" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
