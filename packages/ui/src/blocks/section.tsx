import * as React from "react";
import { cn } from "../lib/cn";
import { BlockImage } from "./block-image";
import { blockText, type BlockLabels } from "./labels";
import type { BlockAdapters } from "./types";
import type { BlockTheme, ImageRef } from "./schema/types";

const BUILT_IN_ACCENTS = new Set(["lime", "ocean", "ember", "rose", "graphite"]);

/** Readable text colour for a custom `oklch(L C H)` accent: dark ink on light accents, white on dark. */
export function accentForeground(oklch: string): string {
  const m = /oklch\(\s*([\d.]+)(%?)/.exec(oklch);
  const l = m ? Number(m[1]) / (m[2] ? 100 : 1) : 0.6;
  return l >= 0.68 ? "oklch(0.18 0.02 120)" : "#fff";
}

/** The `data-*`/class/style a theme maps to. Exported for blocks that render their own root. */
export function sectionThemeAttributes(theme: BlockTheme | undefined): {
  className?: string;
  style?: React.CSSProperties;
  attrs: Record<string, string | undefined>;
} {
  if (!theme) return { attrs: {} };
  const mode = theme.mode && theme.mode !== "inherit" ? theme.mode : undefined;
  // A media surface is always dark: text sits on a photo under a scrim.
  const effectiveMode = theme.surface === "media" ? "dark" : mode;
  const surface = theme.surface ?? (effectiveMode ? "scene" : undefined);
  const accent = theme.accent;
  const custom = accent && !BUILT_IN_ACCENTS.has(accent) ? accent : undefined;
  const style: Record<string, string> | undefined = custom
    ? { "--accent-base": custom, "--accent-fg": accentForeground(custom), "--accent-ink-light": `color-mix(in oklch, ${custom} 70%, black)`, "--accent-ink-dark": `color-mix(in oklch, ${custom} 72%, white)` }
    : undefined;
  return {
    className: effectiveMode,
    style: style as React.CSSProperties | undefined,
    attrs: {
      "data-surface": surface,
      "data-accent": custom ? "custom" : accent,
      "data-material": theme.material && theme.material !== "inherit" ? theme.material : undefined,
      "data-density": theme.density && theme.density !== "inherit" ? theme.density : undefined,
      "data-rhythm": theme.rhythm && theme.rhythm !== "normal" ? theme.rhythm : undefined,
      "data-tone": surface && surface !== "media" ? `${surface}/${effectiveMode ?? "inherit"}` : undefined,
    },
  };
}

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "id"> {
  /** Landmark element. Default `"section"`. */
  as?: "section" | "div" | "header" | "footer" | "aside" | "article" | "nav";
  /** Per-section token axes: mode, surface, accent, material, density, rhythm, background. */
  theme?: BlockTheme;
  /** Section id / URL anchor (`#menu`). */
  anchor?: string;
  /** Id of the section's heading; sets `aria-labelledby`. */
  headingId?: string;
  /** Node id; emitted as `data-block-id` in edit mode. */
  blockId?: string;
  /** Block type; emitted as `data-block-type` in edit mode. */
  blockType?: string;
  editMode?: boolean;
  /** Load the media background eagerly (above the fold). */
  priority?: boolean;
  /** Framework bindings for the media background. */
  components?: BlockAdapters;
  labels?: Partial<BlockLabels>;
}

/**
 * The root of every block: maps `theme` onto subtree token axes, sets the container query
 * context, vertical rhythm and the landmark's accessible name. Server component.
 *
 * ```tsx
 * <Section theme={{ mode: "dark", surface: "accent", accent: "ember" }} anchor="book" headingId="book-title">
 *   <Container>…</Container>
 * </Section>
 * ```
 */
export const Section = /*#__PURE__*/ React.forwardRef<HTMLElement, SectionProps>(function Section(
  { as: Comp = "section", theme, anchor, headingId, blockId, blockType, editMode, priority, components, labels, className, style, children, ...props },
  ref,
) {
  const t = sectionThemeAttributes(theme);
  const bg = theme?.surface === "media" ? theme.background : undefined;
  return (
    <Comp
      ref={ref as React.Ref<HTMLElement & HTMLDivElement>}
      id={anchor}
      aria-labelledby={headingId}
      className={cn("vb-section", t.className, className)}
      style={t.style || style ? { ...t.style, ...style } : undefined}
      data-block-id={editMode ? blockId : undefined}
      data-block-type={editMode ? blockType : undefined}
      {...t.attrs}
      {...props}
    >
      {bg ? <SectionMedia image={bg} priority={priority} components={components} labels={labels} /> : null}
      {children}
    </Comp>
  );
});

function SectionMedia({ image, priority, components, labels }: { image: ImageRef; priority?: boolean; components?: BlockAdapters; labels?: Partial<BlockLabels> }) {
  // The photo is atmosphere; the content above carries the meaning, so it's decorative here.
  return (
    <div className="vb-section-media" aria-hidden="true">
      <BlockImage
        src={image.src}
        width={image.width}
        height={image.height}
        blurDataURL={image.blurDataURL}
        focal={image.focal}
        decorative
        priority={priority}
        sizes="100vw"
        components={components}
        labels={labels}
      />
    </div>
  );
}

export type ContainerSize = "content" | "wide" | "prose" | "full";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** content = 76rem, wide = 90rem, prose = 42rem, full = edge to edge (gutters kept). Default `"content"`. */
  size?: ContainerSize;
  asChild?: never;
}

/** Centres content at a token width with fluid gutters (`--gutter`). Server component. */
export const Container = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ContainerProps>(function Container({ size = "content", className, ...props }, ref) {
  return <div ref={ref} data-size={size === "content" ? undefined : size} className={cn("vb-container", className)} {...props} />;
});

export interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Target id. Default `"content"`. */
  target?: string;
  labels?: Partial<BlockLabels>;
  locale?: string;
}

/** "Skip to content" — the first focusable element of a site, before the navbar. */
export function SkipLink({ target = "content", labels, locale, className, children, ...props }: SkipLinkProps) {
  const t = blockText(labels, locale);
  return (
    <a
      href={`#${target}`}
      className={cn("vb-skip surface-popover rounded-ui px-4 py-2.5 text-sm font-medium text-fg focus-ring", className)}
      {...props}
    >
      {children ?? t("skipToContent")}
    </a>
  );
}
