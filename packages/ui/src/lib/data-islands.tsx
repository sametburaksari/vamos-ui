"use client";

/**
 * Client islands for the server-compatible data-display components (Stat, Delta, Table,
 * Description list, Item, Activity timeline). Each one is small and only exists because it
 * needs the locale context, the clock, the clipboard or keyboard state.
 */

import * as React from "react";
import { Check, Copy, Pencil, X } from "lucide-react";
import { cn } from "./cn";
import { useFormat, useLocale } from "./locale";
import { useLabels } from "./labels";
import { formatValue, dayKey, type ValueFormat } from "./value-format";

/* ------------------------------------------------------------------ */
/* Built-in strings                                                     */
/* ------------------------------------------------------------------ */

export const statLabels = {
  up: "Up {value}",
  down: "Down {value}",
  flat: "No change",
  noData: "No data",
  trendUp: "Trending up over the last {count} periods",
  trendDown: "Trending down over the last {count} periods",
  trendFlat: "Flat over the last {count} periods",
  goal: "Goal {value}",
  goalReached: "Goal reached",
  ofGoal: "{percent} of goal",
};

export const timelineLabels = {
  today: "Today",
  yesterday: "Yesterday",
  empty: "No activity yet",
  loadMore: "Load older activity",
  loading: "Loading…",
  newItems: "{count, plural, one {# new update} other {# new updates}}",
  done: "Completed",
  current: "Current step",
  upcoming: "Upcoming",
  failed: "Failed",
};

export const descriptionListLabels = {
  copy: "Copy {label}",
  copied: "Copied",
  edit: "Edit {label}",
  save: "Save",
  cancel: "Cancel",
  saving: "Saving…",
  error: "Could not save. Try again.",
  empty: "Not set",
};

export const tableLabels = { empty: "No results" };

const DATA_LABELS = { table: tableLabels, stat: statLabels, timeline: timelineLabels, descriptionList: descriptionListLabels } as const;
type DataNamespace = keyof typeof DATA_LABELS;

/** One built-in data-display string, translated through LocaleProvider: `<DataLabel ns="timeline" id="today" />`. */
export function DataLabel<N extends DataNamespace>({
  ns,
  id,
  vars,
  override,
}: {
  ns: N;
  id: keyof (typeof DATA_LABELS)[N] & string;
  vars?: Record<string, unknown>;
  override?: Partial<Record<string, string>>;
}) {
  const t = useLabels(ns, DATA_LABELS[ns] as Record<string, string>, override as Record<string, string> | undefined);
  return <>{t(id, vars)}</>;
}

/* ------------------------------------------------------------------ */
/* Numbers                                                              */
/* ------------------------------------------------------------------ */

/** A locale-formatted value: `<ValueText value={28412} format="compact" />` → "28.4K". */
export function ValueText({ value, format, options }: { value: number | string; format?: ValueFormat; options?: Intl.NumberFormatOptions }) {
  const f = useFormat();
  return <>{formatValue(f, value, format, options)}</>;
}

export interface DeltaTextProps {
  value: number;
  kind?: "percent" | "number" | "currency";
  currency?: string;
  /** Max fraction digits. Default 1 (percent) / 0 (number) / currency default. */
  precision?: number;
  /** Full screen-reader text, e.g. "Up 12.4% vs last month". */
  srLabel?: string;
  /** Appended to the screen-reader text ("vs previous 30 days"). */
  srSuffix?: string;
  labels?: Partial<typeof statLabels>;
}

/** Signed delta text ("+12.4%", "+%12,4" in tr-TR) with a spoken sentence for screen readers. */
export function DeltaText({ value, kind = "percent", currency, precision, srLabel, srSuffix, labels }: DeltaTextProps) {
  const f = useFormat();
  const t = useLabels("stat", statLabels, labels);
  const digits = precision ?? (kind === "percent" ? 1 : kind === "number" ? 0 : undefined);
  const opts: Intl.NumberFormatOptions = digits === undefined ? {} : { maximumFractionDigits: digits, minimumFractionDigits: kind === "percent" ? Math.min(digits, 1) : 0 };
  const fmt = (n: number, sign: boolean) => {
    const o: Intl.NumberFormatOptions = { ...opts, signDisplay: sign ? "exceptZero" : "never" };
    if (kind === "currency") return f.currency(n, currency ?? f.currencyCode, o);
    if (kind === "number") return f.number(n, o);
    return f.percent(n, o);
  };
  const visible = fmt(value, true);
  const spoken = srLabel ?? `${value === 0 ? t("flat") : t(value > 0 ? "up" : "down", { value: fmt(Math.abs(value), false) })}${srSuffix ? ` ${srSuffix}` : ""}`;
  return (
    <>
      <span aria-hidden className="tabular">
        {visible}
      </span>
      <span className="sr-only">{spoken}</span>
    </>
  );
}

/** Progress-to-goal caption: "Goal $46,800" + "27%". */
export function StatGoalText({ value, target, format, labels }: { value: number; target: number; format?: ValueFormat; labels?: Partial<typeof statLabels> }) {
  const f = useFormat();
  const t = useLabels("stat", statLabels, labels);
  const ratio = target > 0 ? value / target : 0;
  return (
    <>
      <span>{ratio >= 1 ? t("goalReached") : t("goal", { value: formatValue(f, target, format, { maximumFractionDigits: 0 }) })}</span>
      <span className="tabular">{f.percent(ratio, { maximumFractionDigits: 0 })}</span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Time                                                                 */
/* ------------------------------------------------------------------ */

// One shared minute ticker for every relative time on the page.
let tickNow = Date.now();
const tickListeners = new Set<() => void>();
let tickTimer: ReturnType<typeof setInterval> | undefined;
function subscribeTick(cb: () => void) {
  tickListeners.add(cb);
  if (!tickTimer) {
    tickNow = Date.now();
    tickTimer = setInterval(() => {
      tickNow = Date.now();
      tickListeners.forEach((l) => l());
    }, 30_000);
  }
  return () => {
    tickListeners.delete(cb);
    if (tickListeners.size === 0 && tickTimer) {
      clearInterval(tickTimer);
      tickTimer = undefined;
    }
  };
}

/**
 * The current time, refreshed by a shared ticker. `null` during SSR and hydration, so the
 * server and the first client render agree; `fixed` pins the clock (docs, tests).
 */
export function useNow(fixed?: Date | string | number): number | null {
  const live = React.useSyncExternalStore(
    subscribeTick,
    () => tickNow,
    () => null,
  );
  if (fixed !== undefined) return new Date(fixed).getTime();
  return live;
}

export interface RelativeTimeProps extends Omit<React.TimeHTMLAttributes<HTMLElement>, "children"> {
  value: Date | string | number;
  /** Fix the reference time (docs, tests, server-rendered snapshots). */
  now?: Date | string | number;
  /** `"long"` "4 minutes ago" · `"short"` "4 min. ago" · `"narrow"`. Default `"long"`. */
  styleType?: Intl.RelativeTimeFormatStyle;
  /** `"relative"` (default) · `"time"` time of day ("9:30 AM") · `"datetime"` full date and time. */
  display?: "relative" | "time" | "datetime";
}

/**
 * `<time>` with a relative label ("4 minutes ago", "yesterday") and the full date as `title`.
 * Server render shows the absolute time; the client upgrades it and keeps it fresh.
 */
export function RelativeTime({ value, now, styleType, display = "relative", className, ...props }: RelativeTimeProps) {
  const f = useFormat();
  const current = useNow(now);
  const iso = value instanceof Date ? value.toISOString() : typeof value === "number" ? new Date(value).toISOString() : value;
  const full = f.dateTime(iso);
  const text =
    display === "time"
      ? f.time(iso)
      : display === "datetime"
        ? full
        : current === null
          ? f.date(iso, "datetime-short")
          : f.relative(iso, { now: current, style: styleType });
  return (
    <time dateTime={iso} title={full} className={cn("tabular", className)} suppressHydrationWarning {...props}>
      {text}
    </time>
  );
}

/** Day heading of a grouped timeline: "Today", "Yesterday", "Monday, Nov 8". */
export function TimelineDayLabel({ date, now, labels }: { date: string; now?: Date | string | number; labels?: Partial<typeof timelineLabels> }) {
  const { format: f, timeZone, locale } = useLocale();
  const t = useLabels("timeline", timelineLabels, labels);
  const current = useNow(now);
  const thisYear = current === null ? undefined : dayKey(current, timeZone).slice(0, 4);
  const absolute = f.date(date, { weekday: "long", month: "short", day: "numeric", ...(thisYear && thisYear !== date.slice(0, 4) ? { year: "numeric" } : {}) });
  let text = absolute;
  if (current !== null) {
    const today = dayKey(current, timeZone);
    const yesterday = dayKey(current - 86_400_000, timeZone);
    if (date === today) text = t("today");
    else if (date === yesterday) text = t("yesterday");
  }
  return (
    <time dateTime={date} lang={locale} title={f.date(date, "full")}>
      {text}
    </time>
  );
}

/* ------------------------------------------------------------------ */
/* Clipboard                                                            */
/* ------------------------------------------------------------------ */

export interface CopyValueButtonProps {
  /** Text written to the clipboard. */
  text: string;
  /** What is copied, for the accessible name ("Copy IBAN"). */
  label: string;
  labels?: Partial<typeof descriptionListLabels>;
  className?: string;
  onCopied?: (text: string) => void;
}

/** Small copy-to-clipboard button with a "Copied" confirmation (visible + announced). */
export function CopyValueButton({ text, label, labels, className, onCopied }: CopyValueButtonProps) {
  const t = useLabels("descriptionList", descriptionListLabels, labels);
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(id);
  }, [copied]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API unavailable (insecure origin): fall back to a hidden textarea.
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
      } finally {
        el.remove();
      }
    }
    setCopied(true);
    onCopied?.(text);
  };
  return (
    <>
      <button
        type="button"
        data-slot="copy-button"
        data-copied={copied ? "" : undefined}
        aria-label={t("copy", { label })}
        title={t("copy", { label })}
        onClick={copy}
        className={cn(
          "inline-grid size-6 shrink-0 place-items-center rounded-ui-sm text-fg-subtle transition-colors hover:bg-hover hover:text-fg focus-ring",
          "data-copied:text-success [&_svg]:size-3.5",
          className,
        )}
      >
        {copied ? <Check aria-hidden strokeWidth={2.25} /> : <Copy aria-hidden />}
      </button>
      <span role="status" className="sr-only">
        {copied ? t("copied") : ""}
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Inline edit                                                          */
/* ------------------------------------------------------------------ */

export interface DescriptionEditableProps {
  /** Current value (the editor starts from it). */
  value: string;
  /** Called with the new value. Return a promise to show "Saving…"; reject to show the error. */
  onSave: (value: string) => void | Promise<void>;
  /** Field name for the accessible names ("Edit Phone"). */
  label: string;
  /** What to show when not editing. Default: the value, or "Not set". */
  display?: React.ReactNode;
  inputType?: "text" | "email" | "tel" | "url" | "number";
  placeholder?: string;
  /** Disable editing (read-only look). */
  disabled?: boolean;
  labels?: Partial<typeof descriptionListLabels>;
  className?: string;
}

/**
 * Click-to-edit value for Description list rows. The value is a button ("Edit Phone");
 * Enter saves, Escape cancels, focus returns to the value afterwards.
 */
export function DescriptionEditable({ value, onSave, label, display, inputType = "text", placeholder, disabled, labels, className }: DescriptionEditableProps) {
  const t = useLabels("descriptionList", descriptionListLabels, labels);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [state, setState] = React.useState<"idle" | "saving" | "error">("idle");
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const errorId = React.useId();
  const returnFocus = React.useRef(false);

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    else if (returnFocus.current) {
      returnFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [editing]);

  const close = () => {
    returnFocus.current = true;
    setEditing(false);
    setState("idle");
  };
  const save = async () => {
    if (draft === value) return close();
    setState("saving");
    try {
      await onSave(draft);
      close();
    } catch {
      setState("error");
      inputRef.current?.focus();
    }
  };

  if (!editing) {
    return (
      <button
        ref={triggerRef}
        type="button"
        data-slot="description-editable"
        disabled={disabled}
        aria-label={`${t("edit", { label })}: ${value || t("empty")}`}
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className={cn(
          "group/edit -mx-1.5 -my-0.5 inline-flex max-w-full items-center gap-2 rounded-ui-sm px-1.5 py-0.5 text-start transition-colors hover:bg-hover focus-ring",
          "disabled:pointer-events-none",
          className,
        )}
      >
        <span className={cn("min-w-0 truncate", !value && "text-fg-subtle")}>{display ?? (value || t("empty"))}</span>
        <Pencil aria-hidden className="size-3 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover/edit:opacity-100 group-focus-visible/edit:opacity-100 [@media(hover:none)]:opacity-100" />
      </button>
    );
  }

  return (
    <span data-slot="description-editor" className={cn("grid gap-1", className)}>
      <span className="flex items-center gap-1">
        <input
          ref={inputRef}
          type={inputType}
          value={draft}
          placeholder={placeholder}
          aria-label={label}
          aria-invalid={state === "error" || undefined}
          aria-describedby={state === "error" ? errorId : undefined}
          aria-busy={state === "saving" || undefined}
          readOnly={state === "saving"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void save();
            } else if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              close();
            }
          }}
          className={cn(
            "h-[calc(var(--control-h)-0.5rem)] min-w-0 flex-1 rounded-ui-sm border border-field-border bg-field px-2 text-[13px] text-fg outline-none",
            "focus-visible:border-ring focus-visible:shadow-[0_0_0_3px_var(--accent-soft)] aria-invalid:border-danger",
          )}
        />
        <button
          type="button"
          aria-label={state === "saving" ? t("saving") : t("save")}
          disabled={state === "saving"}
          onClick={() => void save()}
          className="inline-grid size-7 shrink-0 place-items-center rounded-ui-sm text-accent-ink hover:bg-hover focus-ring disabled:opacity-50 [&_svg]:size-3.5"
        >
          <Check aria-hidden strokeWidth={2.25} />
        </button>
        <button
          type="button"
          aria-label={t("cancel")}
          disabled={state === "saving"}
          onClick={close}
          className="inline-grid size-7 shrink-0 place-items-center rounded-ui-sm text-fg-muted hover:bg-hover focus-ring disabled:opacity-50 [&_svg]:size-3.5"
        >
          <X aria-hidden />
        </button>
      </span>
      {state === "error" ? (
        <span id={errorId} role="alert" className="text-xs text-danger">
          {t("error")}
        </span>
      ) : null}
      {state === "saving" ? (
        <span role="status" className="sr-only">
          {t("saving")}
        </span>
      ) : null}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Selectable list (listbox)                                            */
/* ------------------------------------------------------------------ */

export interface ItemListboxProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "defaultValue" | "onChange"> {
  selectable: "single" | "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

type OptionProps = { value?: string; "data-value"?: string; disabled?: boolean; "aria-disabled"?: boolean | "true" | "false" };
const optionValue = (el: React.ReactElement<OptionProps>) => el.props.value ?? el.props["data-value"];

/**
 * Listbox behaviour for `ItemList selectable`: roving focus, ↑ ↓ Home End, Space/Enter toggles,
 * click selects. Direct `Item` children with a `value` become options.
 */
export const ItemListbox = /*#__PURE__*/ React.forwardRef<HTMLUListElement, ItemListboxProps>(function ItemListbox(
  { selectable, value: valueProp, defaultValue, onValueChange, children, onKeyDown, className, ...props },
  ref,
) {
  const [inner, setInner] = React.useState<string[]>(defaultValue ?? []);
  const value = valueProp ?? inner;
  const baseId = React.useId();
  const [active, setActive] = React.useState<string | undefined>(undefined);
  const listRef = React.useRef<HTMLUListElement | null>(null);

  const options: { value: string; disabled: boolean }[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<OptionProps>(child)) return;
    const v = optionValue(child);
    if (v !== undefined) options.push({ value: v, disabled: Boolean(child.props.disabled || child.props["aria-disabled"] === true || child.props["aria-disabled"] === "true") });
  });
  const enabled = options.filter((o) => !o.disabled);
  const focusValue = active ?? value.find((v) => enabled.some((o) => o.value === v)) ?? enabled[0]?.value;

  const commit = (next: string[]) => {
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };
  const toggle = (v: string) => {
    if (selectable === "single") commit(value[0] === v ? [] : [v]);
    else commit(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  const focusOption = (v: string | undefined) => {
    if (v === undefined) return;
    setActive(v);
    const el = listRef.current?.querySelector<HTMLElement>(`[data-option-value="${CSS.escape(v)}"]`);
    el?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || enabled.length === 0) return;
    const idx = Math.max(0, enabled.findIndex((o) => o.value === focusValue));
    const keyMap: Record<string, number | undefined> = { ArrowDown: idx + 1, ArrowUp: idx - 1, Home: 0, End: enabled.length - 1 };
    if (e.key in keyMap) {
      e.preventDefault();
      const next = Math.min(enabled.length - 1, Math.max(0, keyMap[e.key]!));
      focusOption(enabled[next]!.value);
      if (selectable === "multiple" && e.shiftKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        const v = enabled[next]!.value;
        if (!value.includes(v)) commit([...value, v]);
      }
    } else if ((e.key === " " || e.key === "Enter") && focusValue !== undefined) {
      e.preventDefault();
      toggle(focusValue);
    } else if (selectable === "multiple" && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
      e.preventDefault();
      commit(value.length === enabled.length ? [] : enabled.map((o) => o.value));
    }
  };

  return (
    <ul
      ref={(node) => {
        listRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      role="listbox"
      aria-multiselectable={selectable === "multiple" || undefined}
      onKeyDown={handleKeyDown}
      className={className}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<OptionProps & Record<string, unknown>>(child)) return child;
        const v = optionValue(child);
        if (v === undefined) return child;
        const opt = options.find((o) => o.value === v)!;
        const selected = value.includes(v);
        return React.cloneElement(child, {
          role: "option",
          id: `${baseId}-${v}`,
          "aria-selected": selected,
          "aria-disabled": opt.disabled || undefined,
          "data-state": selected ? "selected" : undefined,
          "data-option-value": v,
          tabIndex: !opt.disabled && v === focusValue ? 0 : -1,
          onFocus: () => setActive(v),
          onClick: (e: React.MouseEvent) => {
            (child.props.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
            if (!opt.disabled) {
              setActive(v);
              toggle(v);
            }
          },
        } as Record<string, unknown>);
      })}
    </ul>
  );
});

/* ------------------------------------------------------------------ */
/* Load more                                                            */
/* ------------------------------------------------------------------ */

/** "Load older activity" button with a busy state while `onLoadMore` resolves. */
export function LoadMoreButton({ onLoadMore, label, className, labels }: { onLoadMore: () => void | Promise<void>; label?: string; className?: string; labels?: Partial<typeof timelineLabels> }) {
  const t = useLabels("timeline", timelineLabels, labels);
  const [busy, setBusy] = React.useState(false);
  return (
    <button
      type="button"
      aria-busy={busy || undefined}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await onLoadMore();
        } finally {
          setBusy(false);
        }
      }}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-ui-sm px-3 text-[13px] font-medium text-fg-muted transition-colors hover:bg-hover hover:text-fg focus-ring disabled:opacity-60",
        className,
      )}
    >
      {busy ? <span aria-hidden className="size-3 animate-spin rounded-full border-[1.5px] border-current border-e-transparent motion-reduce:animate-none" /> : null}
      {busy ? t("loading") : (label ?? t("loadMore"))}
    </button>
  );
}
