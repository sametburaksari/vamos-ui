import * as React from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "../lib/cn";

/* ------------------------------------------------------------------ */
/* Deterministic recipe (pure, server-safe)                             */
/* ------------------------------------------------------------------ */

export type PlaceholderArtPattern = "grid" | "dots" | "lines" | "rings" | "glow";
export const PLACEHOLDER_ART_PATTERNS: PlaceholderArtPattern[] = ["grid", "dots", "lines", "rings", "glow"];

/** FNV-1a 32-bit — stable across server and client, so SSR and hydration agree. */
export function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface PlaceholderArtRecipe {
  pattern: PlaceholderArtPattern;
  /** Chart palette slot (1–6) used as the tint. */
  hue: number;
  /** Second slot for the glow. */
  hue2: number;
  /** Line angle in degrees (lines). */
  angle: number;
  /** Pattern cell in px. */
  cell: number;
  /** Focal point in % (rings, glow, highlight). */
  x: number;
  y: number;
}

/** The same seed always gives the same recipe. `pattern` overrides the seeded choice. */
export function placeholderArtRecipe(seed: string, pattern?: PlaceholderArtPattern | "auto"): PlaceholderArtRecipe {
  const h = hashSeed(seed || "vamos");
  const pick = (shift: number, n: number) => (h >>> shift) % n;
  const hue = pick(0, 6) + 1;
  return {
    pattern: pattern && pattern !== "auto" ? pattern : PLACEHOLDER_ART_PATTERNS[pick(3, PLACEHOLDER_ART_PATTERNS.length)]!,
    hue,
    hue2: ((hue + pick(6, 4)) % 6) + 1,
    angle: [30, 45, 60, 120, 135, 150][pick(9, 6)]!,
    cell: [14, 18, 22, 26][pick(12, 4)]!,
    x: 15 + pick(14, 70),
    y: 10 + pick(21, 60),
  };
}

/** CSS background for a recipe. Token colours only, mixed per theme by the browser. */
export function placeholderArtStyle(recipe: PlaceholderArtRecipe, strength: "subtle" | "bold" = "subtle"): React.CSSProperties {
  const { pattern, hue, hue2, angle, cell, x, y } = recipe;
  const tint = `var(--chart-${hue})`;
  const k = strength === "bold" ? 1.6 : 1;
  const ink = `color-mix(in oklab, ${tint} ${Math.round(30 * k)}%, transparent)`;
  const base = `color-mix(in oklab, ${tint} ${Math.round(9 * k)}%, var(--surface-2))`;
  const highlight = `radial-gradient(120% 90% at ${x}% ${y}%, color-mix(in oklab, ${tint} ${Math.round(16 * k)}%, transparent), transparent 65%)`;
  let layers: string[];
  let sizes: string[];
  switch (pattern) {
    case "grid":
      layers = [highlight, `linear-gradient(${ink} 1px, transparent 1px)`, `linear-gradient(90deg, ${ink} 1px, transparent 1px)`];
      sizes = ["100% 100%", `${cell}px ${cell}px`, `${cell}px ${cell}px`];
      break;
    case "dots":
      layers = [highlight, `radial-gradient(circle, ${ink} 1.1px, transparent 1.6px)`];
      sizes = ["100% 100%", `${cell}px ${cell}px`];
      break;
    case "lines":
      layers = [highlight, `repeating-linear-gradient(${angle}deg, ${ink} 0 1px, transparent 1px ${Math.round(cell / 2)}px)`];
      sizes = ["100% 100%", "100% 100%"];
      break;
    case "rings":
      layers = [highlight, `repeating-radial-gradient(circle at ${x}% ${y}%, transparent 0 ${cell - 1}px, ${ink} ${cell - 1}px ${cell}px)`];
      sizes = ["100% 100%", "100% 100%"];
      break;
    case "glow":
    default:
      layers = [
        `radial-gradient(70% 80% at ${x}% ${y}%, color-mix(in oklab, ${tint} ${Math.round(34 * k)}%, transparent), transparent 70%)`,
        `radial-gradient(60% 70% at ${100 - x}% ${100 - y}%, color-mix(in oklab, var(--chart-${hue2}) ${Math.round(26 * k)}%, transparent), transparent 70%)`,
      ];
      sizes = ["100% 100%", "100% 100%"];
  }
  return { backgroundColor: base, backgroundImage: layers.join(", "), backgroundSize: sizes.join(", "), backgroundPosition: "center" };
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export interface PlaceholderArtProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Any stable string (a slug, a name, a record id). Same seed → same art, on server and client. */
  seed?: string;
  /** Force a pattern. Default `"auto"` (picked from the seed). */
  pattern?: PlaceholderArtPattern | "auto";
  /** Centre icon. Default: an image glyph. `false` hides it. */
  icon?: React.ReactNode | false;
  /**
   * What the missing image would show. Set → `role="img"` with this as its name; empty → decorative
   * (`aria-hidden`).
   */
  label?: string;
  /** Print the label (or a custom node) in the bottom corner, e.g. "Photo · Harbour terrace". */
  caption?: boolean | React.ReactNode;
  /** `bold` doubles the tint — for large hero areas on plain pages. Default `subtle`. */
  strength?: "subtle" | "bold";
}

/**
 * A tasteful, deterministic stand-in for a missing image: a token-tinted pattern (grid, dots, lines,
 * rings or glow) chosen from a seed, an optional glyph and caption. No assets, no network, no
 * dependencies; follows theme and accent. Fills its parent — give the parent a size, or use it inside
 * `AspectRatio` / `Image`.
 *
 * ```tsx
 * <AspectRatio ratio="4/3"><PlaceholderArt seed="harbour-terrace" label="Harbour terrace at dusk" /></AspectRatio>
 * ```
 */
export const PlaceholderArt = React.forwardRef<HTMLDivElement, PlaceholderArtProps>(function PlaceholderArt(
  { seed, pattern = "auto", icon, label, caption, strength = "subtle", className, style, ...props },
  ref,
) {
  const recipe = placeholderArtRecipe(seed ?? label ?? "", pattern);
  const a11y = label ? ({ role: "img", "aria-label": label } as const) : ({ "aria-hidden": true } as const);
  const captionNode = caption === true ? label : caption || null;
  return (
    <div
      ref={ref}
      data-slot="placeholder-art"
      data-pattern={recipe.pattern}
      {...a11y}
      className={cn("relative flex size-full min-h-16 items-center justify-center overflow-hidden text-fg-subtle", className)}
      style={{ ...placeholderArtStyle(recipe, strength), ...style }}
      {...props}
    >
      {icon !== false ? (
        <span
          aria-hidden
          data-slot="placeholder-art-icon"
          className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-[color-mix(in_oklab,var(--surface)_72%,transparent)] [&_svg]:size-[18px]"
        >
          {icon ?? <ImageIcon strokeWidth={1.5} />}
        </span>
      ) : null}
      {captionNode ? (
        <span aria-hidden data-slot="placeholder-art-caption" className="absolute start-3 bottom-2.5 max-w-[calc(100%-1.5rem)] truncate font-mono text-[10.5px] tracking-[0.06em] text-fg-muted uppercase">
          {captionNode}
        </span>
      ) : null}
    </div>
  );
});
