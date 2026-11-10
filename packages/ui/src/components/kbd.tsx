"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { formatKey, parseShortcut, shortcutKeys, useIsMac } from "../lib/use-hotkeys";
import { useLabels } from "../lib/labels";

export const kbdVariants = cva(
  "ui-keycap inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-[calc(var(--radius)*0.42)] font-mono font-medium leading-none tabular",
  {
    variants: {
      size: {
        sm: "h-[1.125rem] min-w-[1.125rem] px-1 text-[10.5px]",
        md: "h-6 min-w-6 px-1.5 text-[11.5px]",
      },
      variant: {
        /** Inset keycap on surfaces. */
        default: "border border-line bg-surface-2 text-fg-muted",
        /** Border only — inside inputs and dense menus. */
        ghost: "border border-field-border bg-transparent text-fg-subtle shadow-none",
        /** Inside the dark sidebar or nav popovers. */
        nav: "border border-nav-line bg-nav-hover text-nav-fg [--kbd-edge:var(--nav-line)]",
      },
    },
    defaultVariants: { size: "md", variant: "default" },
  },
);

/** Key names Kbd understands. Anything else is shown as typed (single letters are uppercased). */
export type KeyName =
  | "mod"
  | "ctrl"
  | "meta"
  | "alt"
  | "shift"
  | "enter"
  | "esc"
  | "escape"
  | "tab"
  | "space"
  | "backspace"
  | "delete"
  | "up"
  | "down"
  | "left"
  | "right"
  | (string & {});

const kbdLabels = {
  command: "Command",
  control: "Control",
  option: "Option",
  alt: "Alt",
  shift: "Shift",
  windows: "Windows",
  enter: "Enter",
  escape: "Escape",
  backspace: "Backspace",
  delete: "Delete",
  tab: "Tab",
  space: "Space",
  up: "Up arrow",
  down: "Down arrow",
  left: "Left arrow",
  right: "Right arrow",
};
export type KbdLabels = typeof kbdLabels;

/** Accessible name key for a canonical key token, when the visible glyph is a symbol or abbreviation. */
function spokenKey(token: string, isMac: boolean): keyof KbdLabels | undefined {
  switch (token) {
    case "mod":
      return isMac ? "command" : "control";
    case "meta":
      return isMac ? "command" : "windows";
    case "ctrl":
      return "control";
    case "alt":
      return isMac ? "option" : "alt";
    case "shift":
      return "shift";
    case "enter":
      return "enter";
    case "escape":
      return "escape";
    case "backspace":
      return "backspace";
    case "delete":
      return "delete";
    case "tab":
      return "tab";
    case " ":
      return "space";
    case "arrowup":
      return "up";
    case "arrowdown":
      return "down";
    case "arrowleft":
      return "left";
    case "arrowright":
      return "right";
    default:
      return undefined;
  }
}

export interface KbdProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof kbdVariants> {
  /**
   * A key token to render platform-aware (`"mod"` → ⌘ / Ctrl, `"shift"` → ⇧ / Shift, `"enter"` → ↩ / Enter).
   * Without it, `children` are shown as-is.
   */
  keyName?: KeyName;
  /** Overrides for the spoken key names (`kbd` namespace). */
  labels?: Partial<KbdLabels>;
}

/**
 * One keyboard key, rendered as `<kbd>`.
 *
 * ```tsx
 * <Kbd>Esc</Kbd>
 * <Kbd keyName="mod" />   // ⌘ on macOS, Ctrl elsewhere
 * ```
 */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd({ keyName, size, variant, labels, className, children, ...props }, ref) {
  const isMac = useIsMac();
  const t = useLabels("kbd", kbdLabels, labels);
  let content: React.ReactNode = children;
  if (keyName !== undefined && children === undefined) {
    const token = parseShortcut(keyName === "+" ? "plus" : keyName);
    const canonical = token.key || (token.mod ? "mod" : token.meta ? "meta" : token.ctrl ? "ctrl" : token.alt ? "alt" : token.shift ? "shift" : keyName);
    const glyph = formatKey(canonical, isMac);
    const spoken = spokenKey(canonical, isMac);
    const name = spoken ? t(spoken) : undefined;
    // Symbol glyphs (⌘ ⇧ ⌥ ↩) fall back to a system font that draws them small next to letters.
    const symbol = /^[^\x00-\x7f]$/.test(glyph);
    content =
      name && name !== glyph ? (
        <>
          <span aria-hidden className={symbol ? "text-[1.2em] leading-none" : undefined}>
            {glyph}
          </span>
          <span className="sr-only">{name}</span>
        </>
      ) : (
        glyph
      );
  }
  return (
    <kbd ref={ref} data-slot="kbd" className={cn(kbdVariants({ size, variant }), className)} {...props}>
      {content}
    </kbd>
  );
});

export interface KbdGroupProps extends Omit<React.HTMLAttributes<HTMLElement>, "children">, VariantProps<typeof kbdVariants> {
  /** A shortcut string (`"mod+shift+k"`) or key tokens (`["mod", "k"]`). */
  keys: string | KeyName[];
  /** Visible text between keycaps (e.g. "+" or "then"). Default: none (keycaps sit side by side). */
  separator?: React.ReactNode;
  labels?: Partial<KbdLabels>;
}

/**
 * A key combination: one `<kbd>` per key nested in an outer `<kbd>` (per the HTML spec).
 * Platform-aware and always left-to-right; key order follows platform convention
 * (⌃ ⌥ ⇧ ⌘ on Apple, Ctrl Alt Shift elsewhere). SSR renders the non-Apple form.
 *
 * ```tsx
 * <KbdGroup keys="mod+k" />          // ⌘ K  /  Ctrl K
 * <KbdGroup keys={["g", "p"]} separator="then" />
 * ```
 */
export const KbdGroup = React.forwardRef<HTMLElement, KbdGroupProps>(function KbdGroup({ keys, separator, size, variant, labels, className, ...props }, ref) {
  const isMac = useIsMac();
  const tokens = typeof keys === "string" ? shortcutKeys(keys, isMac) : keys;
  return (
    <kbd ref={ref} dir="ltr" data-slot="kbd-group" className={cn("inline-flex items-center gap-1 font-sans", className)} {...props}>
      {tokens.map((k, i) => (
        <React.Fragment key={`${k}-${i}`}>
          {i > 0 && separator != null ? (
            <span aria-hidden={typeof separator === "string" && /^[+\-–]$/.test(separator) ? true : undefined} className="text-[11px] text-fg-subtle">
              {separator}
            </span>
          ) : null}
          <Kbd keyName={k} size={size} variant={variant} labels={labels} />
        </React.Fragment>
      ))}
    </kbd>
  );
});
