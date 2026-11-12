"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useReveal, type UseRevealOptions } from "./reveal";

type TextTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "blockquote";

export interface TextRevealProps extends Omit<React.HTMLAttributes<HTMLElement>, "children">, Omit<UseRevealOptions, "stagger"> {
  /** The text. In `by="line"` mode, `\n` separates lines. */
  children: string;
  /** Element to render. Default `"h2"`. */
  as?: TextTag;
  /** Split into words (default) or lines. */
  by?: "word" | "line";
  /**
   * mask: each unit rises from behind its own baseline (default) · fade · blur.
   */
  effect?: "mask" | "fade" | "blur";
  /** ms between two units. Default 45 (words) / 110 (lines). */
  step?: number;
  /** Delay before the first unit, in ms. */
  delay?: number;
}

/**
 * A heading that reveals word by word (or line by line) as it scrolls into view. Assistive
 * tech gets one plain string: the split copy is `aria-hidden`, the real text is a visually
 * hidden twin. Every unit — word or line — is separated by a real space, so `textContent`
 * (search engines, copy-paste, reader mode) reads "közde, muhabbet", never "közde,muhabbet".
 * Transform and opacity only; reduced motion shows it at once.
 *
 * ```tsx
 * <TextReveal as="h2">Small rooms, slow mornings, nothing to scroll.</TextReveal>
 * ```
 */
export const TextReveal = /*#__PURE__*/ React.forwardRef<HTMLElement, TextRevealProps>(function TextReveal(
  { children, as: Tag = "h2", by = "word", effect = "mask", step, delay, once, rootMargin, threshold, disabled, onReveal, className, style, ...props },
  ref,
) {
  const inner = React.useRef<HTMLElement | null>(null);
  const initial = useReveal(inner, { once, rootMargin, threshold, disabled, onReveal });
  const text = String(children);
  const units = by === "line" ? text.split("\n").map((l) => l.trim()).filter(Boolean) : text.split(/\s+/).filter(Boolean);
  const gap = step ?? (by === "line" ? 110 : 45);
  const Comp = Tag as React.ElementType;
  return (
    <Comp
      ref={(node: HTMLElement | null) => {
        inner.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-reveal={effect === "mask" ? "text" : effect}
      data-text-reveal={by}
      {...initial}
      className={cn("vm-text-reveal", className)}
      style={{ "--vm-step": `${gap}ms`, ...(delay ? { "--vm-delay": `${delay}ms` } : null), ...style } as React.CSSProperties}
      {...props}
    >
      <span className="sr-only">{units.join(" ")}</span>{" "}
      <span aria-hidden="true" className="vm-text-reveal-visual">
        {units.map((u, i) => (
          <React.Fragment key={i}>
            <span className="vm-tr-mask">
              <span className="vm-tr-unit" style={{ "--vm-i": i } as React.CSSProperties}>
                {u}
              </span>
            </span>
            {/* Lines are blocks, so this space never shows — it keeps the words apart in textContent. */}
            {i < units.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </span>
    </Comp>
  );
});
