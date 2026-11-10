"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/use-controllable-state";
import { useLabels, type LabelsProp } from "../lib/labels";
import { fontStack, getFont } from "./catalog";
import { loadFontPreviews } from "./loader";
import { fontPairings, type FontPairing } from "./pairings";

export const fontPairingPickerLabels = {
  label: "Type pairing",
  headings: "Headings",
  body: "Body",
  code: "Code",
};
export type FontPairingPickerLabels = typeof fontPairingPickerLabels;

export interface FontPairingPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "dir"> {
  /** Selected pairing id. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string, pairing: FontPairing) => void;
  /** Pairings to offer. Default: the 16 built-ins. */
  pairings?: FontPairing[];
  /** `"grid"` cards (settings pages) or a compact `"list"` (popovers). Default `"grid"`. */
  layout?: "grid" | "list";
  /** Show the one-line description. Default: `true` for grid, `false` for list. */
  showDescription?: boolean;
  /** Load preview glyphs from Google Fonts. Default `true`. */
  loadPreviews?: boolean;
  disabled?: boolean;
  labels?: LabelsProp<FontPairingPickerLabels>;
}

/**
 * Pick one of the curated pairings. A WAI-ARIA radio group with a roving tab stop:
 * arrow keys move and select, Home/End jump to the ends.
 */
export const FontPairingPicker = React.forwardRef<HTMLDivElement, FontPairingPickerProps>(function FontPairingPicker(
  { value: valueProp, defaultValue, onValueChange, pairings = fontPairings, layout = "grid", showDescription, loadPreviews = true, disabled, labels, className, onKeyDown, ...props },
  ref,
) {
  const t = useLabels("fontPairingPicker", fontPairingPickerLabels, labels);
  const [value, setValue] = useControllableState<string | null>({ value: valueProp, defaultValue: defaultValue ?? null, name: "FontPairingPicker" });
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const describe = showDescription ?? layout === "grid";

  React.useEffect(() => {
    if (!loadPreviews) return;
    void loadFontPreviews(
      pairings.flatMap((p) => [
        { family: p.heading, weights: [p.display.weight], italics: p.display.em === "italic" },
        { family: p.body, weights: [400] },
      ]),
    );
  }, [loadPreviews, pairings]);

  const selectedIndex = pairings.findIndex((p) => p.id === value);
  const tabIndexOf = (i: number) => (selectedIndex === -1 ? (i === 0 ? 0 : -1) : i === selectedIndex ? 0 : -1);

  const choose = (i: number, focus = false) => {
    const p = pairings[i];
    if (!p || disabled) return;
    if (focus) refs.current[i]?.focus();
    if (p.id !== value) {
      setValue(p.id);
      onValueChange?.(p.id, p);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const current = refs.current.findIndex((el) => el === document.activeElement);
    if (current === -1) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const last = pairings.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === (rtl ? "ArrowLeft" : "ArrowRight")) next = current === last ? 0 : current + 1;
    else if (e.key === "ArrowUp" || e.key === (rtl ? "ArrowRight" : "ArrowLeft")) next = current === 0 ? last : current - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next !== null) {
      e.preventDefault();
      choose(next, true);
    }
  };

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={props["aria-labelledby"] ? undefined : t("label")}
      aria-disabled={disabled || undefined}
      data-slot="font-pairing-picker"
      data-layout={layout}
      onKeyDown={handleKey}
      className={cn(layout === "grid" ? "grid grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] gap-2" : "grid gap-0.5", className)}
      {...props}
    >
      {pairings.map((p, i) => {
        const checked = p.id === value;
        const heading: React.CSSProperties = { fontFamily: fontStack(p.heading), fontWeight: p.display.weight, letterSpacing: p.display.tracking };
        const body: React.CSSProperties = { fontFamily: fontStack(p.body) };
        const hName = getFont(p.heading)?.family ?? "System UI";
        const bName = getFont(p.body)?.family ?? "System UI";
        return (
          <button
            key={p.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`${p.label}: ${hName} / ${bName}`}
            tabIndex={tabIndexOf(i)}
            disabled={disabled}
            data-state={checked ? "checked" : "unchecked"}
            onClick={() => choose(i)}
            className={cn(
              "group/pair relative text-start outline-none transition-[border-color,background-color,box-shadow] duration-150 focus-ring disabled:cursor-not-allowed disabled:opacity-50",
              layout === "grid"
                ? "grid min-h-32 content-between gap-3 rounded-ui border border-line bg-surface-2 p-3.5 hover:border-field-border-hover data-[state=checked]:border-fg/70 data-[state=checked]:bg-surface data-[state=checked]:shadow-[inset_0_0_0_1px_var(--fg)]"
                : "grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-3 rounded-ui-sm px-2 py-1.5 hover:bg-hover data-[state=checked]:bg-selected",
            )}
          >
            {layout === "grid" ? (
              <>
                <span className="flex items-start justify-between gap-2">
                  <span aria-hidden className="text-[44px] leading-[0.9] text-fg" style={heading}>
                    A<em style={{ fontStyle: p.display.em }}>g</em>
                  </span>
                  <span
                    aria-hidden
                    className={cn("mt-1 size-2 rounded-full border border-field-border transition-colors", checked && "border-transparent bg-accent shadow-[0_0_0_3px_var(--accent-soft)]")}
                  />
                </span>
                <span className="grid gap-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-[13.5px] font-semibold text-fg">{p.label}</span>
                    <span className="truncate font-mono text-[10.5px] text-fg-subtle">{p.id}</span>
                  </span>
                  <span aria-hidden className="truncate text-[12px] text-fg-muted">
                    <span style={heading}>{hName}</span>
                    <span className="px-1 text-fg-subtle">/</span>
                    <span style={body}>{bName}</span>
                  </span>
                  {describe ? <span className="line-clamp-2 text-[11.5px] leading-snug text-fg-subtle">{p.description}</span> : null}
                </span>
              </>
            ) : (
              <>
                <span aria-hidden className="grid h-9 place-items-center rounded-ui-sm border border-line bg-surface-2 text-[22px] leading-none text-fg" style={heading}>
                  Ag
                </span>
                <span className="grid min-w-0">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-medium text-fg">{p.label}</span>
                    {checked ? <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_0_3px_var(--accent-soft)]" /> : null}
                  </span>
                  <span aria-hidden className="truncate text-[11.5px] text-fg-muted">
                    <span style={heading}>{hName}</span>
                    <span className="px-1 text-fg-subtle">/</span>
                    <span style={body}>{bName}</span>
                  </span>
                  {describe ? <span className="truncate text-[11px] text-fg-subtle">{p.description}</span> : null}
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
});
