import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/*
 * Typography — server-compatible. Headings read the data-font axis: --font-heading,
 * --display-weight / --display-tracking / --display-em, and scale with --display-scale.
 */

export const headingVariants = cva("text-balance text-fg [overflow-wrap:break-word]", {
  variants: {
    size: {
      /** 56px × display-scale (fluid down to 38px on phones). Hero / page title on websites. */
      display:
        "font-display [font-weight:var(--display-weight)] [letter-spacing:var(--display-tracking)] [&_em]:[font-style:var(--display-em)] text-[length:calc(clamp(38px,4.2vw+20px,56px)*var(--display-scale))] leading-[1.02]",
      /** 44px × display-scale. Admin page title. */
      xl: "font-display [font-weight:var(--display-weight)] [letter-spacing:var(--display-tracking)] [&_em]:[font-style:var(--display-em)] text-[length:calc(clamp(32px,2.6vw+22px,44px)*var(--display-scale))] leading-[1.05]",
      /** 32px × display-scale. Section title. */
      lg: "font-sans font-semibold tracking-[-0.022em] text-[length:calc(32px*var(--display-scale))] leading-[1.12]",
      /** 22px. Card / panel title. */
      md: "font-sans font-semibold tracking-[-0.016em] text-[22px] leading-[1.25]",
      /** 17px. Group heading inside a panel. */
      sm: "font-sans font-semibold tracking-[-0.01em] text-[17px] leading-[1.35]",
    },
  },
  defaultVariants: { size: "md" },
});

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = NonNullable<VariantProps<typeof headingVariants>["size"]>;
const defaultSize: Record<HeadingLevel, HeadingSize> = { 1: "xl", 2: "lg", 3: "md", 4: "sm", 5: "sm", 6: "sm" };

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Semantic level (`<h1>`…`<h6>`). Default 2. Never skip levels for looks — change `size`. */
  level?: HeadingLevel;
  /** Visual size, independent of the level. Default: from the level (1 → xl, 2 → lg, 3 → md, 4+ → sm). */
  size?: HeadingSize;
  /** Render the styles on the child (e.g. a `<Link>` or a `<legend>`). */
  asChild?: boolean;
}

/**
 * A heading whose look (`size`) is decoupled from its level, so the outline never skips a
 * level for visual reasons. `display` and `xl` use the preset's heading face; `<em>` inside
 * follows the preset (italic in serif presets, plain in sans).
 *
 * ```tsx
 * <Heading level={1} size="display">Dinner, <em>slowly</em>.</Heading>
 * <Heading level={2} size="md">Billing details</Heading>
 * ```
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(function Heading({ level = 2, size, asChild, className, ...props }, ref) {
  const Comp = (asChild ? Slot.Root : `h${level}`) as "h2";
  return <Comp ref={ref} data-slot="heading" data-size={size ?? defaultSize[level]} className={cn(headingVariants({ size: size ?? defaultSize[level] }), className)} {...props} />;
});

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

export const textVariants = cva("", {
  variants: {
    size: {
      xs: "text-xs leading-[1.45]",
      sm: "text-[13px] leading-[1.5]",
      md: "text-sm leading-[1.55]",
      lg: "text-base leading-[1.6]",
    },
    tone: {
      default: "text-fg",
      muted: "text-fg-muted",
      subtle: "text-fg-subtle",
      accent: "text-accent-ink",
      danger: "text-danger",
      success: "text-success",
      warning: "text-warning",
      /** Keep the parent colour. */
      inherit: "",
    },
    weight: {
      regular: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
    },
  },
  defaultVariants: { size: "md", tone: "default" },
});

export interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, "color">, VariantProps<typeof textVariants> {
  /** Element to render. Default `"p"`. */
  as?: "p" | "span" | "div" | "label" | "small" | "strong" | "figcaption";
  /** `true`: one line with an ellipsis. A number: clamp to that many lines. The full text goes into `title`. */
  truncate?: boolean | number;
  /** Tabular figures (prices, counts in columns). */
  tabular?: boolean;
  /** Render the styles on the child element. */
  asChild?: boolean;
  /** For `as="label"`. */
  htmlFor?: string;
}

/**
 * Body text: 12 / 13 / 14 / 16 px, seven tones, three weights, single-line truncation or
 * multi-line clamp. Paragraphs wrap with `text-wrap: pretty`.
 *
 * ```tsx
 * <Text tone="muted" size="sm">Last edited 3 minutes ago by Elif.</Text>
 * <Text truncate={2}>{post.excerpt}</Text>
 * ```
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(function Text(
  { as = "p", size, tone, weight, truncate, tabular, asChild, className, style, title, children, ...props },
  ref,
) {
  const Comp = (asChild ? Slot.Root : as) as "p";
  const lines = typeof truncate === "number" && truncate > 1 ? truncate : undefined;
  const autoTitle = truncate && title === undefined && (typeof children === "string" || typeof children === "number") ? String(children) : title;
  return (
    <Comp
      ref={ref as React.Ref<HTMLParagraphElement>}
      data-slot="text"
      title={autoTitle}
      className={cn(
        textVariants({ size, tone, weight }),
        as === "p" && !truncate && "text-pretty",
        (truncate === true || truncate === 1) && "truncate",
        lines && "overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical]",
        tabular && "tabular",
        className,
      )}
      style={lines ? { ...style, WebkitLineClamp: lines } : style}
      {...props}
    >
      {children}
    </Comp>
  );
});

/** The opening paragraph under a page or article title. */
export const Lead = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(function Lead({ className, ...props }, ref) {
  return <p ref={ref} data-slot="lead" className={cn("text-pretty text-[length:var(--text-lead)] leading-[1.5] text-fg-muted", className)} {...props} />;
});

/** Inline code: `slug`, `npm run build`, a field key. */
export const Code = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(function Code({ className, ...props }, ref) {
  return (
    <code
      ref={ref}
      data-slot="code"
      className={cn("rounded-[5px] border border-line bg-selected px-[0.36em] py-[0.08em] font-mono text-[0.86em] text-fg [overflow-wrap:anywhere]", className)}
      {...props}
    />
  );
});

export interface BlockquoteProps extends React.BlockquoteHTMLAttributes<HTMLQuoteElement> {
  /** Who said it — rendered under the quote. */
  cite?: string;
  attribution?: React.ReactNode;
}

/** A pulled quote or testimonial, set in the heading face. */
export const Blockquote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(function Blockquote({ attribution, className, children, ...props }, ref) {
  return (
    <figure data-slot="blockquote" className={cn("grid gap-2.5 border-s-2 border-accent-ink ps-5", className)}>
      <blockquote ref={ref} className="font-display text-[length:calc(22px*var(--display-scale))] leading-[1.4] text-fg [&_em]:[font-style:var(--display-em)]" {...props}>
        {children}
      </blockquote>
      {attribution ? <figcaption className="text-[13px] text-fg-subtle">{attribution}</figcaption> : null}
    </figure>
  );
});

export interface NumericProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Monospaced (code font) instead of the UI font with tabular figures. Default `false`. */
  mono?: boolean;
  /** Colour by sign: negative → danger, positive → success. Pass the raw number. */
  signOf?: number;
}

/**
 * Numbers that line up: tabular figures, no wrapping. Format the value first (`useFormat()` or
 * `createFormatter` from `@vamos-ui/react/format`), then render it here.
 *
 * ```tsx
 * <Numeric>{f.currency("1250.50")}</Numeric>
 * <Numeric signOf={-4.2}>−4.2%</Numeric>
 * ```
 */
export const Numeric = React.forwardRef<HTMLSpanElement, NumericProps>(function Numeric({ mono, signOf, className, ...props }, ref) {
  return (
    <span
      ref={ref}
      data-slot="numeric"
      className={cn(
        "tabular whitespace-nowrap",
        mono && "font-mono text-[0.94em]",
        signOf !== undefined && (signOf < 0 ? "text-danger" : signOf > 0 ? "text-success" : "text-fg-muted"),
        className,
      )}
      {...props}
    />
  );
});

/* ------------------------------------------------------------------ */
/* Prose                                                               */
/* ------------------------------------------------------------------ */

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Base size: 14 / 16 / 18 px. Default `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Raw HTML from your editor or CMS. **Sanitize it on the server first.** */
  html?: string;
  /** Remove the reading-width cap (default `--measure`, 64ch). */
  fullWidth?: boolean;
  asChild?: boolean;
}

/**
 * Styles rich content you don't control element by element: an article body from the editor,
 * a CMS page, release notes. Headings, lists, quotes, code, tables and media follow the
 * `data-font` preset and tokens. Put long prose on a `surface` (not straight on the glass scene).
 *
 * ```tsx
 * <Prose html={post.bodyHtml} />
 * <Prose size="lg" lang="en"><h2>Opening hours</h2><p>…</p></Prose>
 * ```
 */
export const Prose = React.forwardRef<HTMLDivElement, ProseProps>(function Prose({ size = "md", html, fullWidth, asChild, className, children, ...props }, ref) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      ref={ref}
      data-slot="prose"
      className={cn("prose-ui", size === "sm" && "prose-ui-sm", size === "lg" && "prose-ui-lg", fullWidth && "max-w-none", className)}
      {...(html !== undefined ? { dangerouslySetInnerHTML: { __html: html } } : { children })}
      {...props}
    />
  );
});

export interface ProseTableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Names the scroll region for screen readers ("Opening hours"). */
  label: string;
}

/** Wraps a wide table inside Prose in a keyboard-scrollable region. */
export const ProseTable = React.forwardRef<HTMLDivElement, ProseTableProps>(function ProseTable({ label, className, ...props }, ref) {
  return <div ref={ref} role="region" aria-label={label} tabIndex={0} data-slot="prose-table" className={cn(className)} {...props} />;
});
