"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import * as PopoverPrimitive from "radix-ui/popover";
import { cn } from "../lib/cn";
import { controlVariants } from "../lib/variants";
import { useControllableState } from "../lib/use-controllable-state";
import { useFieldControl, FieldContextReset } from "../lib/field-context";
import { usePortalContainer } from "../lib/theme-scope";
import { Layer } from "../lib/layer";
import { useLabels, type LabelsProp } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { highlightParts, matchText } from "../lib/text";
import { fontCategories, fontGroupOf, fontGroups, fontStack, getFont, googleFonts, isVariableFont, type FontCategory, type GoogleFont } from "./catalog";
import { FONT_PREVIEW_TEXT, loadFontPreviews } from "./loader";

export const fontPickerLabels = {
  placeholder: "Choose a font",
  search: "Search fonts",
  searchPlaceholder: "Search by name, style or use",
  categories: "Category",
  all: "All",
  list: "Fonts",
  empty: "No fonts match “{query}”.",
  results: "{count, plural, one {# family} other {# families}}",
  variable: "Variable",
  italic: "Italic",
  weights: "{count, plural, one {# weight} other {# weights}}",
};
export type FontPickerLabels = typeof fontPickerLabels;

/* ------------------------------------------------------------------ */
/* Preview font visibility                                             */
/* ------------------------------------------------------------------ */

/** Applies a family's face only once its row has scrolled into view, so only visible previews download. */
function useSeen(root: React.RefObject<HTMLElement | null>) {
  const [seen, setSeen] = React.useState<Set<string>>(() => new Set());
  const observer = React.useRef<IntersectionObserver | null>(null);
  const pending = React.useRef<Map<Element, string>>(new Map());

  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const add: string[] = [];
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = pending.current.get(e.target);
          if (id) add.push(id);
          io.unobserve(e.target);
        }
        if (add.length) setSeen((s) => new Set([...s, ...add]));
      },
      { root: root.current, rootMargin: "120px 0px" },
    );
    observer.current = io;
    for (const el of pending.current.keys()) io.observe(el);
    return () => io.disconnect();
  }, [root]);

  const observe = React.useCallback((id: string) => (el: HTMLElement | null) => {
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen((s) => (s.has(id) ? s : new Set(s).add(id)));
      return;
    }
    pending.current.set(el, id);
    observer.current?.observe(el);
  }, []);

  return { seen, observe };
}

/* ------------------------------------------------------------------ */
/* FontPickerList — the inline panel (search · categories · listbox)   */
/* ------------------------------------------------------------------ */

export interface FontPickerListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Selected family name. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (family: string, font: GoogleFont) => void;
  /** Families to offer. Default: the 59-family catalog. */
  fonts?: GoogleFont[];
  /** Only these categories (e.g. `["mono"]` for a code font field). */
  categories?: FontCategory[];
  /** Sample line under each family. */
  previewText?: string;
  /** Load glyph-subset previews from Google Fonts. Default `true`. Turn off when fonts are self-hosted. */
  loadPreviews?: boolean;
  /** Show the large specimen of the active option. Default `true`. */
  specimen?: boolean;
  /** Focus the search field on mount. */
  autoFocus?: boolean;
  /** Max height of the list (CSS length). Default `"18rem"`. */
  listHeight?: string;
  labels?: LabelsProp<FontPickerLabels>;
}

type Row = { font: GoogleFont; group: string };

/**
 * Searchable, categorised list of font families with live previews. ARIA combobox + listbox:
 * focus stays in the search field; ↑/↓, PageUp/PageDown, Home/End (with Ctrl) move, Enter selects.
 * Use it inline (settings pages) or through `FontPicker` (popover).
 */
export const FontPickerList = /*#__PURE__*/ React.forwardRef<HTMLDivElement, FontPickerListProps>(function FontPickerList(
  { value: valueProp, defaultValue, onValueChange, fonts = googleFonts, categories, previewText = FONT_PREVIEW_TEXT, loadPreviews = true, specimen = true, autoFocus, listHeight = "18rem", labels, className, ...props },
  ref,
) {
  const t = useLabels("fontPicker", fontPickerLabels, labels);
  const { locale } = useLocale();
  const uid = React.useId();
  const [value, setValue] = useControllableState<string | null>({ value: valueProp, defaultValue: defaultValue ?? null, name: "FontPickerList" });
  const [query, setQuery] = React.useState("");
  const pool = React.useMemo(() => (categories?.length ? fonts.filter((f) => categories.includes(f.category)) : fonts), [fonts, categories]);
  const cats = React.useMemo(() => fontCategories.filter((c) => pool.some((f) => f.category === c.id)), [pool]);
  const [cat, setCat] = React.useState<FontCategory | "all">("all");

  const rows = React.useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (const g of fontGroups) {
      for (const f of pool) {
        if (fontGroupOf(f).id !== g.id) continue;
        if (cat !== "all" && f.category !== cat) continue;
        if (query && !matchText(`${f.family} ${g.label} ${f.use}`, query, locale)) continue;
        out.push({ font: f, group: g.id });
      }
    }
    if (query) {
      // Name matches first, keep group order otherwise.
      const byName = (r: Row) => (matchText(r.font.family, query, locale) ? 0 : 1);
      out.sort((a, b) => byName(a) - byName(b));
    }
    return out;
  }, [pool, cat, query, locale]);

  const [active, setActive] = React.useState<string | null>(null);
  const activeIndex = Math.max(0, rows.findIndex((r) => r.font.family === active));
  const activeRow = rows.length ? rows[activeIndex] : undefined;

  // Keep the active option on the selection when the list changes.
  React.useEffect(() => {
    if (rows.length === 0) return setActive(null);
    if (active && rows.some((r) => r.font.family === active)) return;
    setActive(rows.find((r) => r.font.family === value)?.font.family ?? rows[0]!.font.family);
  }, [rows, value, active]);

  const listRef = React.useRef<HTMLDivElement>(null);
  const { seen, observe } = useSeen(listRef);

  React.useEffect(() => {
    if (loadPreviews) void loadFontPreviews(pool.map((f) => f.family), { extraText: previewText });
  }, [loadPreviews, pool, previewText]);

  const optionId = (f: GoogleFont) => `${uid}-opt-${f.id}`;

  React.useEffect(() => {
    if (!activeRow) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[id="${optionId(activeRow.font)}"]`);
    el?.scrollIntoView?.({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRow?.font.id]);

  const select = (f: GoogleFont) => {
    setValue(f.family);
    onValueChange?.(f.family, f);
  };

  const move = (to: number) => {
    if (!rows.length) return;
    const i = Math.min(rows.length - 1, Math.max(0, to));
    setActive(rows[i]!.font.family);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); move(activeIndex + 1); break;
      case "ArrowUp": e.preventDefault(); move(activeIndex - 1); break;
      case "PageDown": e.preventDefault(); move(activeIndex + 8); break;
      case "PageUp": e.preventDefault(); move(activeIndex - 8); break;
      case "Home": if (e.ctrlKey || e.metaKey) { e.preventDefault(); move(0); } break;
      case "End": if (e.ctrlKey || e.metaKey) { e.preventDefault(); move(rows.length - 1); } break;
      case "Enter": if (activeRow) { e.preventDefault(); select(activeRow.font); } break;
    }
  };

  const face = (f: GoogleFont): React.CSSProperties | undefined => (seen.has(f.id) || !loadPreviews ? { fontFamily: fontStack(f.family) } : undefined);

  const listId = `${uid}-list`;

  const sections = React.useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of rows) m.set(r.group, [...(m.get(r.group) ?? []), r]);
    return [...m.entries()];
  }, [rows]);

  const renderOption = (r: Row) => {
    const g = fontGroups.find((x) => x.id === r.group)!;
    const selected = r.font.family === value;
    const isActive = r.font.family === activeRow?.font.family;
    return (
      <div
        key={r.font.id}
        ref={observe(r.font.id)}
        id={optionId(r.font)}
        role="option"
        aria-selected={selected}
        data-active={isActive || undefined}
        onPointerMove={() => !isActive && setActive(r.font.family)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => select(r.font)}
        className="relative grid cursor-default grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 rounded-ui-sm px-2.5 py-1.5 data-active:bg-hover"
      >
        <span className="truncate text-[15.5px] leading-snug text-fg" style={face(r.font)}>
          {query
            ? highlightParts(r.font.family, query, locale).map((p, i) => (p.match ? <mark key={i} className="rounded-[2px] bg-accent-soft text-fg">{p.text}</mark> : <React.Fragment key={i}>{p.text}</React.Fragment>))
            : r.font.family}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-fg-subtle">
          {query ? <span>{g.label}</span> : null}
          {isVariableFont(r.font) ? <span className="font-mono uppercase tracking-wide">var</span> : <span className="tabular-nums">{r.font.weights.length}w</span>}
          <Check aria-hidden className={cn("size-3.5 text-accent-ink", !selected && "invisible")} />
        </span>
        <span aria-hidden className="col-span-2 truncate text-[12.5px] leading-snug text-fg-muted" style={face(r.font)}>
          {previewText}
        </span>
      </div>
    );
  };

  return (
    <div ref={ref} data-slot="font-picker-list" className={cn("grid min-w-0 gap-2.5", className)} {...props}>
      <div className={cn(controlVariants({ size: "md" }), "ps-2.5")}>
        <Search aria-hidden className="text-fg-subtle" />
        <input
          role="combobox"
          aria-label={t("search")}
          aria-expanded
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeRow ? optionId(activeRow.font) : undefined}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder={t("searchPlaceholder")}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-fg-subtle"
        />
        <span aria-live="polite" className="shrink-0 text-[11.5px] tabular-nums text-fg-subtle">{t("results", { count: rows.length })}</span>
      </div>

      {cats.length > 1 ? (
        <div role="group" aria-label={t("categories")} className="-mx-0.5 flex flex-wrap gap-1 px-0.5">
          {[{ id: "all" as const, label: t("all") }, ...cats].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={cat === c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "h-6 rounded-full border px-2.5 text-[11.5px] font-medium transition-colors focus-ring",
                cat === c.id ? "border-transparent bg-fg text-scene" : "border-line text-fg-muted hover:border-field-border-hover hover:text-fg",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      ) : null}

      <div
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={t("list")}
        tabIndex={-1}
        style={{ maxHeight: listHeight }}
        className="-mx-1 overflow-y-auto overscroll-contain px-1"
      >
        {rows.length === 0 ? (
          <p className="px-2 py-8 text-center text-[13px] text-fg-muted">{t("empty", { query })}</p>
        ) : query ? (
          rows.map((r) => renderOption(r))
        ) : (
          sections.map(([gid, items]) => {
            const g = fontGroups.find((x) => x.id === gid)!;
            const hid = `${uid}-grp-${gid}`;
            return (
              <div key={gid} role="group" aria-labelledby={hid} className="pb-1">
                <div id={hid} className="px-2.5 pb-1 pt-2.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-subtle">
                  {g.label}
                </div>
                {items.map((r) => renderOption(r))}
              </div>
            );
          })
        )}
      </div>

      {specimen && activeRow ? (
        <div aria-hidden className="relative -mx-(--popover-p,0px) -mb-(--popover-p,0px) overflow-hidden border-t border-line bg-surface-2 px-(--popover-p,0.75rem) py-3">
          <div className="truncate text-[28px] leading-[1.1] text-fg" style={{ fontFamily: fontStack(activeRow.font.family) }}>
            Ağaç işçiliği
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-3 text-[11.5px]">
            <span className="min-w-0 truncate text-fg-muted">{activeRow.font.use}</span>
            <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle">
              {isVariableFont(activeRow.font) ? t("variable") : t("weights", { count: activeRow.font.weights.length })}
              {activeRow.font.italics ? ` · ${t("italic")}` : ""}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* FontPicker — trigger + popover                                      */
/* ------------------------------------------------------------------ */

export interface FontPickerProps extends Omit<FontPickerListProps, "autoFocus" | "className" | "onChange" | "id"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  disabled?: boolean;
  /** Show the category under the family name in the trigger. Default `true`. */
  showCategory?: boolean;
  align?: "start" | "center" | "end";
  id?: string;
  name?: string;
  required?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  className?: string;
  /** Class for the popover panel. */
  contentClassName?: string;
}

/**
 * A select-like trigger that opens the searchable font list in a popover. Closes on selection.
 * Inside a `Field` it picks up the id, description and invalid state.
 */
export const FontPicker = /*#__PURE__*/ React.forwardRef<HTMLButtonElement, FontPickerProps>(function FontPicker(rawProps, ref) {
  const props = useFieldControl(rawProps);
  const {
    open: openProp, defaultOpen, onOpenChange, size = "md", placeholder, disabled, showCategory = true, align = "start",
    id, name, required, className, contentClassName,
    value: valueProp, defaultValue, onValueChange, labels, loadPreviews = true,
    "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, "aria-describedby": ariaDescribedby, "aria-invalid": ariaInvalid,
    ...listProps
  } = props as FontPickerProps & { readOnly?: boolean };
  delete (listProps as { readOnly?: boolean }).readOnly;
  const t = useLabels("fontPicker", fontPickerLabels, labels);
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen ?? false, onChange: onOpenChange, name: "FontPicker" });
  const [value, setValue] = useControllableState<string | null>({ value: valueProp, defaultValue: defaultValue ?? null, name: "FontPicker" });
  const font = value ? getFont(value) : undefined;
  const container = usePortalContainer();

  React.useEffect(() => {
    if (loadPreviews && value) void loadFontPreviews([value]);
  }, [loadPreviews, value]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          ref={ref}
          type="button"
          id={id}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          aria-invalid={ariaInvalid}
          aria-haspopup="dialog"
          data-slot="font-picker-trigger"
          className={cn(controlVariants({ size }), "justify-between text-start", className)}
        >
          <span className="flex min-w-0 items-baseline gap-2">
            {value ? (
              <>
                <span className="truncate text-[1.05em]" style={font ? { fontFamily: fontStack(font.family) } : undefined}>{value}</span>
                {showCategory && font ? <span className="truncate text-[11.5px] text-fg-subtle">{fontGroupOf(font).label}</span> : null}
              </>
            ) : (
              <span className="truncate text-fg-subtle">{placeholder ?? t("placeholder")}</span>
            )}
          </span>
          <ChevronsUpDown aria-hidden className="shrink-0 text-fg-subtle" />
        </button>
      </PopoverPrimitive.Trigger>
      {name ? <input type="hidden" name={name} value={value ?? ""} required={required} /> : null}
      <PopoverPrimitive.Portal container={container}>
        <Layer asChild>
          <PopoverPrimitive.Content
            align={align}
            sideOffset={6}
            collisionPadding={12}
            aria-label={t("list")}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              (e.currentTarget as HTMLElement | null)?.querySelector<HTMLInputElement>("input[role=combobox]")?.focus();
            }}
            className={cn(
              "surface-popover ui-pop z-(--z-popover) w-[24rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-ui-lg p-(--popover-p) outline-none [--popover-p:0.625rem]",
              contentClassName,
            )}
          >
            <FieldContextReset>
              <FontPickerList
                {...listProps}
                labels={labels}
                loadPreviews={loadPreviews}
                value={value}
                onValueChange={(fam, f) => {
                  setValue(fam);
                  onValueChange?.(fam, f);
                  setOpen(false);
                }}
              />
            </FieldContextReset>
          </PopoverPrimitive.Content>
        </Layer>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
});
