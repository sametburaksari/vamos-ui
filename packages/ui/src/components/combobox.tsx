"use client";

import * as React from "react";
import { Command as Cmdk } from "cmdk";
import { Check, ChevronsUpDown, Plus, Search, X } from "lucide-react";
import { cn } from "../lib/cn";
import { FieldContextReset, useFieldContext, useFieldControl } from "../lib/field-context";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { cmdkFilter, foldText, highlightParts } from "../lib/text";
import { useAsyncList, type AsyncLoader } from "../lib/use-async-list";
import { useControllableState } from "../lib/use-controllable-state";
import { controlVariants, itemSlots, itemVariants } from "../lib/variants";
import { Badge } from "./badge";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";
import { Spinner } from "./spinner";

const comboboxLabels = {
  placeholder: "Select…",
  placeholderMultiple: "Add…",
  search: "Search…",
  empty: "No results",
  create: "Create “{query}”",
  results: "{count, plural, =0 {No results} one {# result} other {# results}}",
  error: "Couldn't load results.",
  retry: "Try again",
  loading: "Loading…",
  loadMore: "Show more results",
  clear: "Clear selection",
  selected: "Selected",
  selectedCount: "{count, plural, one {# selected} other {# selected}}",
  remove: "Remove {label}",
  more: "+{count}",
  moreLabel: "{count, plural, one {# more selected} other {# more selected}}",
};
export type ComboboxLabels = typeof comboboxLabels;

/** The default item shape. Any other shape works with `getValue` / `getLabel`. */
export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Extra searchable text (email, code, former name). */
  keywords?: string[];
  /** Items with the same group render under one heading. */
  group?: string;
}

export interface ComboboxItemState {
  selected: boolean;
  /** The current search text (for your own highlighting). */
  query: string;
  /** The label split into matched / unmatched parts (locale-folded). */
  highlight: React.ReactNode;
}

interface ComboboxCommonProps<T> {
  /** Static items (filtered client-side with locale folding: "istanbul" finds "İstanbul"). */
  items?: T[];
  /**
   * Server search. Called (debounced, abortable) with the query; return an array or
   * `{ items, cursor }` for paging. Called with `cursor` for the next page.
   */
  loadItems?: AsyncLoader<T>;
  /** Debounce for `loadItems` in ms. Default 200. */
  debounce?: number;
  getValue?: (item: T) => string;
  getLabel?: (item: T) => string;
  /** Extra searchable text per item. Default: `item.keywords`. */
  getKeywords?: (item: T) => string[] | undefined;
  getDisabled?: (item: T) => boolean;
  getGroup?: (item: T) => string | undefined;
  /** Custom row content (avatar + email…). The check indicator is added for you. */
  renderItem?: (item: T, state: ComboboxItemState) => React.ReactNode;
  /**
   * Shows a "Create “…”" row for unknown text. Return the new item to select it
   * (or a promise of it); return nothing to handle selection yourself.
   */
  onCreate?: (query: string) => T | void | Promise<T | void>;
  /** Labels for values that aren't in the current list (async initial values). */
  selectedItems?: T[];
  /** Trigger text with no selection. */
  placeholder?: string;
  /** Placeholder of the search box. */
  searchPlaceholder?: string;
  /** Shown when nothing matches. */
  emptyMessage?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "pill";
  /** `"popover"` (default): trigger + floating list. `"inline"`: the search and list in place. */
  mode?: "popover" | "inline";
  /** Static items are still loading. */
  loading?: boolean;
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Close after picking. Default: `true` for single, `false` for multiple. */
  closeOnSelect?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  /** Classes for the root (trigger box or inline panel). */
  className?: string;
  /** Classes for the popover panel. */
  contentClassName?: string;
  /** Max height of the list. Default 18rem. */
  listClassName?: string;
  /** Built-in string overrides (`combobox` namespace). */
  labels?: Partial<ComboboxLabels>;
}

export interface ComboboxSingleProps<T> extends ComboboxCommonProps<T> {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null, item: T | null) => void;
  /** Show a clear (×) button while there is a value. */
  clearable?: boolean;
  maxVisibleChips?: never;
}

export interface ComboboxMultipleProps<T> extends ComboboxCommonProps<T> {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[], items: T[]) => void;
  /** Collapse chips beyond this count into "+N". */
  maxVisibleChips?: number;
  clearable?: boolean;
}

export type ComboboxProps<T = ComboboxOption> = ComboboxSingleProps<T> | ComboboxMultipleProps<T>;

const asOption = (item: unknown) => item as Partial<ComboboxOption>;
const defaultGetValue = (item: unknown) => String(asOption(item).value ?? "");
const defaultGetLabel = (item: unknown) => String(asOption(item).label ?? asOption(item).value ?? "");
const CREATE_VALUE = "\u0000create";
const MORE_VALUE = "\u0000more";

function Highlight({ text, query, locale }: { text: string; query: string; locale: string }) {
  if (!query.trim()) return <>{text}</>;
  return (
    <>
      {highlightParts(text, query, locale).map((p, i) =>
        p.match ? (
          <span key={i} data-match="" className="font-semibold text-fg">
            {p.text}
          </span>
        ) : (
          <React.Fragment key={i}>{p.text}</React.Fragment>
        ),
      )}
    </>
  );
}

function ComboboxInner<T = ComboboxOption>(props: ComboboxProps<T>, ref: React.ForwardedRef<HTMLButtonElement>) {
  const {
    items: staticItems,
    loadItems,
    debounce,
    getValue = defaultGetValue as (item: T) => string,
    getLabel = defaultGetLabel as (item: T) => string,
    getKeywords = (item: T) => asOption(item).keywords,
    getDisabled = (item: T) => Boolean(asOption(item).disabled),
    getGroup = (item: T) => asOption(item).group,
    renderItem,
    onCreate,
    selectedItems,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    size = "md",
    variant = "default",
    mode = "popover",
    loading: staticLoading,
    name: nameProp,
    disabled: disabledProp,
    invalid,
    readOnly: readOnlyProp,
    required,
    open: openProp,
    defaultOpen,
    onOpenChange,
    closeOnSelect,
    id,
    className,
    contentClassName,
    listClassName,
    labels,
    multiple,
    clearable,
    maxVisibleChips,
  } = props;
  const t = useLabels("combobox", comboboxLabels, labels);
  const { locale } = useLocale();
  const field = useFieldContext();
  const control = useFieldControl({
    id,
    disabled: disabledProp,
    readOnly: readOnlyProp,
    required,
    "aria-invalid": invalid ? true : undefined,
    "aria-label": props["aria-label"],
    "aria-labelledby": props["aria-labelledby"],
    "aria-describedby": props["aria-describedby"],
  } as React.ComponentProps<"button"> & { readOnly?: boolean; required?: boolean });
  const disabled = Boolean(control.disabled);
  const readOnly = Boolean((control as { readOnly?: boolean }).readOnly);
  const name = nameProp ?? field?.name;
  const inert = disabled || readOnly;

  /* ---------------------------------------------------------------- value */
  const toArray = (v: string | string[] | null | undefined): string[] | undefined =>
    v === undefined ? undefined : Array.isArray(v) ? v : v === null ? [] : [v];
  const known = React.useRef(new Map<string, T>());
  for (const item of selectedItems ?? []) known.current.set(getValue(item), item);
  for (const item of staticItems ?? []) known.current.set(getValue(item), item);

  const [values, setValues] = useControllableState<string[]>({
    value: toArray(props.value),
    defaultValue: () => toArray(props.defaultValue) ?? [],
    onChange: (next) => {
      const resolved = next.map((v) => known.current.get(v)).filter((x): x is T => x !== undefined);
      if (multiple) (props.onValueChange as ComboboxMultipleProps<T>["onValueChange"])?.(next, resolved);
      else (props.onValueChange as ComboboxSingleProps<T>["onValueChange"])?.(next[0] ?? null, resolved[0] ?? null);
    },
    name: "Combobox",
  });
  const [open, setOpenState] = useControllableState({ value: openProp, defaultValue: defaultOpen ?? false, onChange: onOpenChange, name: "Combobox" });
  const setOpen = (next: boolean) => {
    if (next && inert) return;
    setOpenState(next);
    if (!next) setQuery("");
  };
  const [query, setQuery] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  /* ---------------------------------------------------------------- items */
  const async = useAsyncList<T>({ load: loadItems, query, debounce, enabled: mode === "inline" || open });
  for (const item of async.items) known.current.set(getValue(item), item);

  const visible = React.useMemo(() => {
    if (loadItems) return async.items;
    const list = staticItems ?? [];
    const q = query.trim();
    if (!q) return list;
    const score = cmdkFilter(locale);
    return list
      .map((item, index) => ({ item, index, s: score(getLabel(item), q, getKeywords(item)) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.index - b.index)
      .map((x) => x.item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadItems, async.items, staticItems, query, locale]);

  const groups = React.useMemo(() => {
    const out: Array<{ label?: string; items: T[] }> = [];
    const byKey = new Map<string, { label?: string; items: T[] }>();
    for (const item of visible) {
      const g = getGroup(item);
      const key = g ?? "";
      let entry = byKey.get(key);
      if (!entry) {
        entry = { label: g, items: [] };
        byKey.set(key, entry);
        out.push(entry);
      }
      entry.items.push(item);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const loading = loadItems ? async.loading : Boolean(staticLoading);
  const trimmed = query.trim();
  const folded = foldText(trimmed, locale);
  const exactMatch = trimmed !== "" && [...visible, ...known.current.values()].some((item) => foldText(getLabel(item), locale) === folded);
  const showCreate = Boolean(onCreate) && trimmed !== "" && !exactMatch && !loading;

  /* ---------------------------------------------------------------- actions */
  const shouldClose = closeOnSelect ?? !multiple;
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const chipsRef = React.useRef<HTMLUListElement>(null);

  const select = (value: string) => {
    if (inert) return;
    if (multiple) setValues((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    else setValues([value]);
    if (multiple) setQuery("");
    if (shouldClose && mode === "popover") setOpen(false);
  };

  const removeAt = (index: number, refocus = true) => {
    if (inert) return;
    setValues((prev) => prev.filter((_, i) => i !== index));
    if (!refocus) return;
    requestAnimationFrame(() => {
      // Focus the previous chip (or the first one), else the trigger.
      const buttons = chipsRef.current?.querySelectorAll<HTMLButtonElement>('[data-slot="chip-remove"]');
      (buttons?.[Math.max(0, index - 1)] ?? triggerRef.current)?.focus();
    });
  };

  const create = async () => {
    if (!onCreate || creating) return;
    setCreating(true);
    try {
      const created = await onCreate(trimmed);
      if (created !== undefined && created !== null) {
        known.current.set(getValue(created as T), created as T);
        select(getValue(created as T));
      }
      setQuery("");
    } finally {
      setCreating(false);
    }
  };

  /* ---------------------------------------------------------------- panel */
  const itemSize = size === "sm" ? "sm" : "md";
  const showCount = trimmed !== "" || Boolean(loadItems);

  // cmdk names its input with its own <label>; in inline mode reuse the Field's label text.
  const [fieldLabelText, setFieldLabelText] = React.useState<string | undefined>();
  const fieldLabelId = field?.labelId;
  React.useEffect(() => {
    if (!fieldLabelId) return;
    setFieldLabelText(document.getElementById(fieldLabelId)?.textContent?.replace(/\*$/, "").trim() || undefined);
  }, [fieldLabelId]);
  const panelName = props["aria-label"] ?? fieldLabelText ?? t("search");
  const inputName =
    mode === "inline"
      ? (props["aria-label"] ?? fieldLabelText ?? searchPlaceholder ?? t("search"))
      : (searchPlaceholder ?? t("search"));

  const panel = (
    <Cmdk
      shouldFilter={false}
      loop
      label={inputName}
      data-slot="combobox-panel"
      className="flex min-h-0 flex-col"
    >
      <div className="flex items-center gap-2 border-b border-line px-3" data-slot="combobox-search">
        <Search aria-hidden className="size-4 shrink-0 text-fg-subtle" />
        <Cmdk.Input
          value={query}
          onValueChange={setQuery}
          placeholder={searchPlaceholder ?? t("search")}
          {...(mode === "inline" ? { "aria-describedby": control["aria-describedby"], "aria-invalid": control["aria-invalid"] } : {})}
          disabled={disabled}
          readOnly={readOnly}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && query === "" && multiple && values.length > 0) {
              e.preventDefault();
              removeAt(values.length - 1, false);
            }
          }}
          className={cn(
            "h-(--control-h) min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed",
            size === "sm" && "h-[calc(var(--control-h)-0.25rem)] text-[13px]",
          )}
        />
        {loading || creating ? <Spinner size="xs" tone="muted" /> : null}
      </div>
      <Cmdk.List
        label={inputName}
        aria-busy={loading || undefined}
        // Keep focus in the search box when an option is clicked.
        onMouseDown={(e) => {
          if (!(e.target as HTMLElement).closest("button")) e.preventDefault();
        }}
        className={cn("max-h-72 overflow-y-auto overscroll-contain p-1 scroll-py-1", listClassName)}
        onScroll={(e) => {
          const el = e.currentTarget;
          if (async.hasMore && el.scrollTop + el.clientHeight >= el.scrollHeight - 48) async.loadMore();
        }}
      >
        {async.error && !loading ? (
          <div role="alert" className="flex items-center justify-between gap-3 px-2 py-2 text-[13px] text-danger">
            <span>{t("error")}</span>
            <button type="button" onClick={async.reload} className="rounded-ui-sm px-1.5 py-0.5 font-medium text-fg underline-offset-2 hover:underline focus-ring">
              {t("retry")}
            </button>
          </div>
        ) : null}
        {loading && visible.length === 0 ? (
          <Cmdk.Loading label={t("loading")} className="flex items-center gap-2 px-2 py-2 text-[13px] text-fg-muted">
            <Spinner size="xs" tone="muted" />
            {t("loading")}
          </Cmdk.Loading>
        ) : null}
        {groups.map((group, gi) => {
          const rows = group.items.map((item) => {
            const value = getValue(item);
            const label = getLabel(item);
            const selected = values.includes(value);
            const highlight = <Highlight text={label} query={trimmed} locale={locale} />;
            const opt = asOption(item);
            return (
              <Cmdk.Item
                key={value}
                value={value}
                disabled={getDisabled(item)}
                onSelect={() => select(value)}
                data-checked={selected ? "" : undefined}
                className={cn(itemVariants({ size: itemSize }), multiple ? "ps-2" : "pe-8")}
              >
                {multiple ? (
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                      selected ? "border-transparent bg-accent text-accent-fg" : "border-field-border-hover",
                    )}
                  >
                    {selected ? <Check strokeWidth={3} className="size-3!" /> : null}
                  </span>
                ) : null}
                {renderItem ? (
                  <span className="flex min-w-0 flex-1 items-center gap-2">{renderItem(item, { selected, query: trimmed, highlight })}</span>
                ) : (
                  <>
                    {opt.icon ? <span className={cn(itemSlots.icon, "flex items-center justify-center")}>{opt.icon}</span> : null}
                    <span className="grid min-w-0 flex-1">
                      <span className="truncate">{highlight}</span>
                      {opt.description ? <span className={cn(itemSlots.description, "truncate")}>{opt.description}</span> : null}
                    </span>
                  </>
                )}
                {!multiple ? (
                  <span className="absolute end-2 flex size-4 items-center justify-center text-accent-ink">
                    {selected ? <Check aria-hidden strokeWidth={2.5} className="size-4" /> : null}
                  </span>
                ) : null}
                {selected ? <span className="sr-only">, {t("selected")}</span> : null}
              </Cmdk.Item>
            );
          });
          return group.label ? (
            <Cmdk.Group
              key={group.label}
              heading={group.label}
              className={cn(
                gi > 0 && "mt-1 border-t border-line pt-1",
                "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-[0.04em] [&_[cmdk-group-heading]]:text-fg-subtle",
              )}
            >
              {rows}
            </Cmdk.Group>
          ) : (
            <React.Fragment key={`_${gi}`}>{rows}</React.Fragment>
          );
        })}
        {showCreate ? (
          <Cmdk.Item value={CREATE_VALUE} onSelect={create} disabled={creating} className={cn(itemVariants({ size: itemSize }), "text-fg")}>
            <Plus aria-hidden className="text-fg-muted" />
            <span className="truncate">{t("create", { query: trimmed })}</span>
          </Cmdk.Item>
        ) : null}
        {async.hasMore ? (
          <Cmdk.Item value={MORE_VALUE} onSelect={async.loadMore} className={cn(itemVariants({ size: itemSize }), "justify-center text-fg-muted")}>
            {async.loadingMore ? <Spinner size="xs" tone="muted" /> : null}
            {t("loadMore")}
          </Cmdk.Item>
        ) : null}
        {!loading && visible.length === 0 && !showCreate && !async.error ? (
          <div data-slot="combobox-empty" className="px-2 py-6 text-center text-[13px] text-fg-subtle">
            {emptyMessage ?? t("empty")}
          </div>
        ) : null}
      </Cmdk.List>
      <span aria-live="polite" className="sr-only">
        {showCount && !loading ? t("results", { count: visible.length }) : ""}
      </span>
    </Cmdk>
  );

  const hidden = name ? (
    multiple ? (
      values.map((v) => <input key={v} type="hidden" name={name} value={v} />)
    ) : (
      <input type="hidden" name={name} value={values[0] ?? ""} />
    )
  ) : null;

  /* ---------------------------------------------------------------- inline */
  if (mode === "inline") {
    return (
      <div
        data-slot="combobox"
        data-mode="inline"
        aria-disabled={disabled || undefined}
        className={cn(
          "flex w-full min-w-0 flex-col overflow-hidden rounded-ui border border-field-border bg-field",
          "has-[input:focus-visible]:border-ring has-[input:focus-visible]:shadow-[0_0_0_3px_var(--accent-soft)]",
          control["aria-invalid"] && "border-danger",
          disabled && "opacity-50",
          className,
        )}
      >
        <FieldContextReset>{panel}</FieldContextReset>
        {multiple && values.length > 0 ? (
          <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-1.5 text-xs text-fg-muted">
            <span className="tabular">{t("selectedCount", { count: values.length })}</span>
            {clearable && !inert ? (
              <button type="button" onClick={() => setValues([])} className="rounded-ui-sm px-1 font-medium text-fg hover:underline focus-ring">
                {t("clear")}
              </button>
            ) : null}
          </div>
        ) : null}
        {hidden}
      </div>
    );
  }

  /* ---------------------------------------------------------------- popover */
  const selectedEntries = values.map((v) => ({ value: v, item: known.current.get(v) }));
  const labelOf = (e: { value: string; item?: T }) => (e.item ? getLabel(e.item) : e.value);
  const shown = multiple && maxVisibleChips !== undefined ? selectedEntries.slice(0, maxVisibleChips) : selectedEntries;
  const overflow = selectedEntries.length - shown.length;
  const { readOnly: _ro, required: req, ...buttonA11y } = control as typeof control & { readOnly?: boolean; required?: boolean };
  void _ro;

  const triggerButton = (
    <PopoverTrigger asChild>
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-required={req || undefined}
        aria-readonly={readOnly || undefined}
        aria-busy={loading || undefined}
        data-placeholder={values.length === 0 ? "" : undefined}
        {...buttonA11y}
        onKeyDown={(e) => {
          if (!multiple || inert || open) return;
          if ((e.key === "Backspace" || e.key === "ArrowLeft") && values.length > 0) {
            e.preventDefault();
            const buttons = chipsRef.current?.querySelectorAll<HTMLButtonElement>('[data-slot="chip-remove"]');
            buttons?.[buttons.length - 1]?.focus();
          }
        }}
        className={cn(
          multiple
            ? "flex h-[calc(var(--control-h)-0.5rem)] min-w-24 flex-1 items-center rounded-ui-sm px-1.5 text-start text-fg-subtle outline-none focus-visible:outline-none"
            : cn(
                controlVariants({ size, variant: variant === "pill" ? "default" : variant, pill: variant === "pill" }),
                "justify-between text-start data-placeholder:text-fg-subtle",
                clearable && values.length > 0 && !inert && (size === "sm" ? "pe-12" : "pe-14"),
                readOnly && "border-dashed",
                className,
              ),
          inert && "cursor-not-allowed",
        )}
      >
        {multiple ? (
          <span className="truncate">
            {values.length === 0 ? (placeholder ?? t("placeholder")) : readOnly ? "" : (placeholder ?? t("placeholderMultiple"))}
          </span>
        ) : (
          <span className="min-w-0 truncate">
            {selectedEntries[0] ? labelOf(selectedEntries[0]) : (placeholder ?? t("placeholder"))}
          </span>
        )}
        {!multiple ? (
          loading && !open ? (
            <Spinner size="sm" tone="muted" />
          ) : readOnly ? null : (
            <ChevronsUpDown aria-hidden className="shrink-0 text-fg-subtle" />
          )
        ) : null}
      </button>
    </PopoverTrigger>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {multiple ? (
        <PopoverAnchor asChild>
          <div
            data-slot="combobox"
            data-multiple=""
            data-readonly={readOnly ? "" : undefined}
            aria-invalid={control["aria-invalid"] || undefined}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget && !inert) {
                e.preventDefault();
                triggerRef.current?.focus();
                setOpen(!open);
              }
            }}
            className={cn(
              controlVariants({ size, variant: variant === "pill" ? "default" : variant, pill: variant === "pill", multiline: true }),
              "min-h-(--control-h) flex-wrap gap-1 py-1 ps-1.5 pe-2",
              size === "sm" && "min-h-[calc(var(--control-h)-0.5rem)] py-0.5",
              disabled && "opacity-50",
              className,
            )}
          >
            {shown.length > 0 ? (
              <ul
                ref={chipsRef}
                aria-label={t("selected")}
                className="contents"
                onKeyDown={(e) => {
                  const buttons = [...(chipsRef.current?.querySelectorAll<HTMLButtonElement>('[data-slot="chip-remove"]') ?? [])];
                  const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
                  if (i < 0) return;
                  const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
                  const prev = rtl ? "ArrowRight" : "ArrowLeft";
                  const next = rtl ? "ArrowLeft" : "ArrowRight";
                  if (e.key === prev && i > 0) {
                    e.preventDefault();
                    buttons[i - 1]!.focus();
                  } else if (e.key === next) {
                    e.preventDefault();
                    (buttons[i + 1] ?? triggerRef.current)?.focus();
                  }
                }}
              >
                {shown.map((entry, i) => (
                  <li key={entry.value} className="flex min-w-0">
                    <Badge size={size === "lg" ? "lg" : "md"} shape="square" className="max-w-56 min-w-0" onRemove={inert ? undefined : () => removeAt(i)} removeLabel={t("remove", { label: labelOf(entry) })}>
                      <span className="truncate">{labelOf(entry)}</span>
                    </Badge>
                  </li>
                ))}
                {overflow > 0 ? (
                  <li className="flex">
                    <Badge size={size === "lg" ? "lg" : "md"} shape="square" tone="outline" className="tabular">
                      <span aria-hidden>{t("more", { count: overflow })}</span>
                      <span className="sr-only">{t("moreLabel", { count: overflow })}</span>
                    </Badge>
                  </li>
                ) : null}
              </ul>
            ) : null}
            {triggerButton}
            {clearable && values.length > 0 && !inert ? (
              <button
                type="button"
                aria-label={t("clear")}
                onClick={() => {
                  setValues([]);
                  triggerRef.current?.focus();
                }}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-fg-subtle hover:bg-hover hover:text-fg focus-ring [&_svg]:size-3.5"
              >
                <X aria-hidden />
              </button>
            ) : null}
            {readOnly ? null : (
              <span aria-hidden className="pointer-events-none inline-flex size-6 shrink-0 items-center justify-center text-fg-subtle [&_svg]:size-4">
                <ChevronsUpDown />
              </span>
            )}
            {hidden}
          </div>
        </PopoverAnchor>
      ) : (
        <div data-slot="combobox" className="relative w-full min-w-0">
          {triggerButton}
          {clearable && values.length > 0 && !inert ? (
            <button
              type="button"
              aria-label={t("clear")}
              onClick={() => {
                setValues([]);
                triggerRef.current?.focus();
              }}
              className={cn(
                "absolute top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-hover hover:text-fg focus-ring",
                size === "sm" ? "end-7 size-5 [&_svg]:size-3" : "end-8 size-6 [&_svg]:size-3.5",
              )}
            >
              <X aria-hidden />
            </button>
          ) : null}
          {hidden}
        </div>
      )}
      <PopoverContent
        size="trigger"
        padded={false}
        align="start"
        aria-label={panelName}
        className={cn("min-w-60 overflow-hidden", contentClassName)}
        onOpenAutoFocus={(e) => {
          // Focus the search box, not the first focusable in the panel.
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.querySelector<HTMLInputElement>("[cmdk-input]")?.focus();
        }}
      >
        <FieldContextReset>{panel}</FieldContextReset>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Searchable selection — single or multiple, static or server-backed, optionally creatable:
 * city, assignee, category, country, tags. WAI-ARIA combobox + listbox in a popover (or inline).
 * Search folds locale characters, so "istanbul" finds "İstanbul" and "cagri" finds "Çağrı";
 * matches are highlighted by weight, not colour (readable on glass).
 *
 * ```tsx
 * <Field label="City"><Combobox name="city" items={cities} /></Field>
 * <Combobox multiple items={labels} defaultValue={["urgent"]} maxVisibleChips={3} />
 * <Combobox loadItems={(q, signal) => fetch(`/api/people?q=${q}`, { signal }).then((r) => r.json())} />
 * <Combobox items={categories} onCreate={async (name) => api.createCategory(name)} />
 * ```
 */
export const Combobox = /*#__PURE__*/ React.forwardRef(ComboboxInner) as <T = ComboboxOption>(props: ComboboxProps<T> & { ref?: React.Ref<HTMLButtonElement> }) => React.ReactElement;
