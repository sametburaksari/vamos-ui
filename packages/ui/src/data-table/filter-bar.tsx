"use client";

import * as React from "react";
import { Command as Cmdk } from "cmdk";
import { ArrowLeft, Check, ChevronDown, ListFilter, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat, useLocale } from "../lib/locale";
import { cmdkFilter } from "../lib/text";
import { useControllableState } from "../lib/use-controllable-state";
import { useContainerWidth } from "../lib/use-container-width";
import { controlVariants, itemSlots, itemVariants } from "../lib/variants";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../components/popover";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader } from "../components/sheet";
import { Spinner } from "../components/spinner";
import { describeValue, filterOpLabels, relativeDateLabels, type DescribeLabels } from "./filter-fns";
import {
  ME,
  clauseId,
  emptyFilterGroup,
  fieldOps,
  flattenClauses,
  isClauseComplete,
  isFilterGroup,
  opTakesNoValue,
  type FilterClause,
  type FilterFieldDef,
  type FilterGroup,
  type FilterOp,
  type FilterOption,
  type RelativeDate,
  type RelativeDatePreset,
} from "./types";

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

export const filterBarLabels = {
  label: "Filters",
  add: "Filter",
  addAria: "Add filter",
  clear: "Clear all",
  searchPlaceholder: "Search…",
  searchLabel: "Search",
  searchFields: "Filter by…",
  fieldList: "Fields",
  noFields: "No matching fields",
  searchOptions: "Search options…",
  noOptions: "No matching options",
  loading: "Loading…",
  apply: "Apply",
  back: "Back to fields",
  operator: "Condition",
  value: "Value",
  from: "From",
  to: "To",
  min: "Min",
  max: "Max",
  rangeError: "The first value can’t be greater than the second.",
  yes: "Yes",
  no: "No",
  me: "Me",
  custom: "Custom",
  lastPrefix: "Last",
  unitDay: "days",
  unitWeek: "weeks",
  unitMonth: "months",
  lastDays: "Last {count, plural, one {# day} other {# days}}",
  lastWeeks: "Last {count, plural, one {# week} other {# weeks}}",
  lastMonths: "Last {count, plural, one {# month} other {# months}}",
  range: "{from} – {to}",
  clause: "{field} {op} {value}",
  editValue: "{clause}. Edit value",
  editField: "Field: {field}. Change field",
  editOp: "Condition: {op}. Change condition",
  remove: "Remove filter {field}",
  more: "+{count}",
  moreAria: "Show {count, plural, one {# more filter} other {# more filters}}",
  less: "Show fewer",
  added: "Filter added: {clause}.",
  removed: "Filter removed: {field}.",
  updated: "Filter updated: {clause}.",
  cleared: "All filters cleared.",
  results: "{count, plural, one {# result} other {# results}}.",
  filtersButton: "Filters",
  filtersCount: "Filters ({count})",
  selected: "selected",
  op_contains: filterOpLabels.contains,
  op_notContains: filterOpLabels.notContains,
  op_eq: filterOpLabels.eq,
  op_neq: filterOpLabels.neq,
  op_startsWith: filterOpLabels.startsWith,
  op_isEmpty: filterOpLabels.isEmpty,
  op_isNotEmpty: filterOpLabels.isNotEmpty,
  op_gt: filterOpLabels.gt,
  op_gte: filterOpLabels.gte,
  op_lt: filterOpLabels.lt,
  op_lte: filterOpLabels.lte,
  op_between: filterOpLabels.between,
  op_in: filterOpLabels.in,
  op_notIn: filterOpLabels.notIn,
  op_before: filterOpLabels.before,
  op_after: filterOpLabels.after,
  op_on: filterOpLabels.on,
  op_relative: filterOpLabels.relative,
  rel_today: relativeDateLabels.today!,
  rel_yesterday: relativeDateLabels.yesterday!,
  rel_this_week: relativeDateLabels.this_week!,
  rel_last_7_days: relativeDateLabels.last_7_days!,
  rel_last_30_days: relativeDateLabels.last_30_days!,
  rel_last_90_days: relativeDateLabels.last_90_days!,
  rel_this_month: relativeDateLabels.this_month!,
  rel_last_month: relativeDateLabels.last_month!,
  rel_this_quarter: relativeDateLabels.this_quarter!,
  rel_this_year: relativeDateLabels.this_year!,
};
export type FilterBarLabels = typeof filterBarLabels;
type T = ReturnType<typeof useLabels<FilterBarLabels>>;

const RELATIVE_PRESETS: RelativeDatePreset[] = ["today", "yesterday", "this_week", "last_7_days", "last_30_days", "last_90_days", "this_month", "last_month", "this_quarter", "this_year"];

function describeLabelsFrom(t: T): DescribeLabels {
  const ops = {} as Record<FilterOp, string>;
  for (const op of Object.keys(filterOpLabels) as FilterOp[]) ops[op] = t(`op_${op}` as keyof FilterBarLabels);
  const relative: Record<string, string> = {};
  for (const r of RELATIVE_PRESETS) relative[r] = t(`rel_${r}` as keyof FilterBarLabels);
  return {
    ops,
    relative,
    yes: t("yes"),
    no: t("no"),
    me: t("me"),
    range: (from, to) => t("range", { from, to }),
    lastN: (n, unit) => t(unit === "day" ? "lastDays" : unit === "week" ? "lastWeeks" : "lastMonths", { count: n }),
  };
}

/* ------------------------------------------------------------------ */
/* Value helpers                                                       */
/* ------------------------------------------------------------------ */

function defaultValueFor(op: FilterOp, field: FilterFieldDef): unknown {
  if (opTakesNoValue(op)) return undefined;
  if (op === "in" || op === "notIn") return [];
  if (op === "between") return ["", ""];
  if (op === "relative") return "last_30_days";
  if (field.type === "boolean") return true;
  return "";
}

/** Keeps what it can when the operator changes (`in` ⇄ `eq`, scalar → `between`). */
function convertValue(prev: unknown, from: FilterOp, to: FilterOp, field: FilterFieldDef): unknown {
  if (opTakesNoValue(to)) return undefined;
  const multi = (op: FilterOp) => op === "in" || op === "notIn";
  if (multi(from) && multi(to)) return prev;
  if (multi(to)) return Array.isArray(prev) ? prev : prev !== "" && prev != null ? [prev] : [];
  if (to === "between") return Array.isArray(prev) && prev.length === 2 ? prev : [typeof prev === "string" || typeof prev === "number" ? prev : "", ""];
  if (to === "relative") return from === "relative" ? prev : "last_30_days";
  if (from === "relative" || from === "between" || multi(from)) {
    if (Array.isArray(prev) && field.type !== "date" && field.type !== "datetime") return prev[0] ?? "";
    return defaultValueFor(to, field);
  }
  return prev ?? defaultValueFor(to, field);
}

function rangeInvalid(clause: FilterClause, field: FilterFieldDef): boolean {
  if (clause.op !== "between" || !Array.isArray(clause.value)) return false;
  const [a, b] = clause.value as unknown[];
  if (a === "" || b === "" || a == null || b == null) return false;
  if (field.type === "date" || field.type === "datetime") return String(a) > String(b);
  return Number(a) > Number(b);
}

/** Text of a chip value: "Proposal, Won +2". */
function chipValue(clause: FilterClause, field: FilterFieldDef, format: ReturnType<typeof useFormat>, dl: DescribeLabels, optionCache: Map<string, string>): string {
  if (Array.isArray(clause.value) && (clause.op === "in" || clause.op === "notIn") && clause.value.length > 2) {
    const first = describeValue({ ...clause, value: clause.value.slice(0, 2) }, field, format, dl, optionCache);
    return `${first} +${clause.value.length - 2}`;
  }
  return describeValue(clause, field, format, dl, optionCache);
}

/* ------------------------------------------------------------------ */
/* Roving focus (toolbar pattern)                                      */
/* ------------------------------------------------------------------ */

const ROVE = "data-filter-rove";

function roveItems(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(`[${ROVE}]`)).filter((el) => !el.hasAttribute("disabled"));
}

/** Keeps exactly one item in the tab order; arrows / Home / End move between items. */
function useRovingToolbar(ref: React.RefObject<HTMLElement | null>) {
  const active = React.useRef<HTMLElement | null>(null);
  React.useLayoutEffect(() => {
    const items = roveItems(ref.current);
    const current = active.current && items.includes(active.current) ? active.current : items[0];
    for (const el of items) el.tabIndex = el === current ? 0 : -1;
  });
  const onFocus = (e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    if (!target.hasAttribute(ROVE)) return;
    active.current = target;
    for (const el of roveItems(ref.current)) el.tabIndex = el === target ? 0 : -1;
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (!target.hasAttribute(ROVE)) return;
    const items = roveItems(ref.current);
    const i = items.indexOf(target);
    if (i === -1) return;
    const rtl = getComputedStyle(target).direction === "rtl";
    const next = rtl ? "ArrowLeft" : "ArrowRight";
    const prev = rtl ? "ArrowRight" : "ArrowLeft";
    let to = -1;
    if (e.key === next) to = (i + 1) % items.length;
    else if (e.key === prev) to = (i - 1 + items.length) % items.length;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = items.length - 1;
    if (to === -1) return;
    e.preventDefault();
    items[to]!.focus();
  };
  const focusIndex = (i: number) => {
    const items = roveItems(ref.current);
    const el = items[Math.min(i, items.length - 1)];
    el?.focus();
  };
  return { onFocus, onKeyDown, focusIndex };
}

/* ------------------------------------------------------------------ */
/* Async options                                                       */
/* ------------------------------------------------------------------ */

function useFieldOptions(field: FilterFieldDef | undefined, query: string, cache: Map<string, string>) {
  const loader = typeof field?.options === "function" ? field.options : null;
  const [state, setState] = React.useState<{ options: FilterOption[]; loading: boolean }>({ options: [], loading: Boolean(loader) });
  React.useEffect(() => {
    if (!loader) return;
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    const timer = setTimeout(() => {
      loader(query).then(
        (options) => {
          if (!alive) return;
          for (const o of options) cache.set(o.value, o.label);
          setState({ options, loading: false });
        },
        () => alive && setState({ options: [], loading: false }),
      );
    }, 200);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [loader, query, cache]);
  if (!field) return { options: [] as FilterOption[], loading: false, async: false };
  if (!loader) return { options: (field.options as FilterOption[] | undefined) ?? [], loading: false, async: false };
  return { ...state, async: true };
}

/* ------------------------------------------------------------------ */
/* Editor (field → condition + value, one stepped popover)             */
/* ------------------------------------------------------------------ */

interface EditorProps {
  fields: FilterFieldDef[];
  /** Existing clause (edit) or a field to start from (quick chip). */
  initial?: Partial<FilterClause>;
  step: "field" | "value";
  canChangeField: boolean;
  t: T;
  facets?: Record<string, Record<string, number>>;
  me?: { id: string; name: string };
  optionCache: Map<string, string>;
  onDraft: (c: FilterClause | null) => void;
  onApply: (c: FilterClause) => void;
}

const panelInput = "h-(--control-h) min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle";
const groupHeading =
  "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-[0.04em] [&_[cmdk-group-heading]]:text-fg-subtle";

function FilterEditor({ fields, initial, step: startStep, canChangeField, t, facets, me, optionCache, onDraft, onApply }: EditorProps) {
  const { locale } = useLocale();
  const [step, setStep] = React.useState(startStep);
  const [fieldName, setFieldName] = React.useState(initial?.field);
  const field = fields.find((f) => f.field === fieldName);
  const [op, setOp] = React.useState<FilterOp | undefined>(initial?.op ?? (field ? fieldOps(field)[0] : undefined));
  const [value, setValue] = React.useState<unknown>(initial?.value !== undefined ? initial.value : field && op ? defaultValueFor(op, field) : undefined);
  const id = React.useRef(initial?.id ?? clauseId()).current;
  const draft: FilterClause | null = field && op ? { id, field: field.field, op, value } : null;
  const invalid = draft && field ? rangeInvalid(draft, field) : false;
  const complete = Boolean(draft && isClauseComplete(draft) && !invalid);

  React.useEffect(() => {
    onDraft(complete ? draft : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, fieldName, op, JSON.stringify(value)]);

  const apply = () => {
    if (draft && complete) onApply(draft);
  };

  const pickField = (f: FilterFieldDef) => {
    const nextOp = fieldOps(f)[0]!;
    setFieldName(f.field);
    setOp(nextOp);
    setValue(defaultValueFor(nextOp, f));
    setStep("value");
  };

  if (step === "field" || !field || !op) {
    const groups = new Map<string, FilterFieldDef[]>();
    for (const f of fields) {
      const g = f.group ?? "";
      groups.set(g, [...(groups.get(g) ?? []), f]);
    }
    return (
      <Cmdk label={t("fieldList")} filter={cmdkFilter(locale)} loop className="flex min-h-0 flex-col" data-slot="filter-field-picker">
        <div className="flex items-center gap-2 border-b border-line px-3">
          <ListFilter aria-hidden className="size-4 shrink-0 text-fg-subtle" />
          <Cmdk.Input autoFocus placeholder={t("searchFields")} className={panelInput} />
        </div>
        <Cmdk.List label={t("fieldList")} className="max-h-72 overflow-y-auto overscroll-contain p-1 scroll-py-1">
          <Cmdk.Empty className="px-2 py-3 text-[13px] text-fg-muted">{t("noFields")}</Cmdk.Empty>
          {[...groups.entries()].map(([g, list], gi) => {
            const items = list.map((f) => {
              const Icon = f.icon;
              return (
                <Cmdk.Item key={f.field} value={f.field} keywords={[f.label]} onSelect={() => pickField(f)} className={itemVariants({ size: "md" })}>
                  {Icon ? <Icon className={itemSlots.icon} /> : <span aria-hidden className="size-4 shrink-0" />}
                  <span className={itemSlots.label}>{f.label}</span>
                </Cmdk.Item>
              );
            });
            return g ? (
              <Cmdk.Group key={g} heading={g} className={cn(groupHeading, gi > 0 && "mt-1 border-t border-line pt-1")}>
                {items}
              </Cmdk.Group>
            ) : (
              <React.Fragment key="_">{items}</React.Fragment>
            );
          })}
        </Cmdk.List>
      </Cmdk>
    );
  }

  const ops = fieldOps(field);
  const back = canChangeField ? () => setStep("field") : undefined;
  const backOnEmpty = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && e.currentTarget.value === "" && back) {
      e.preventDefault();
      back();
    }
  };

  return (
    <div className="flex min-w-0 flex-col" data-slot="filter-value-editor">
      <div className="flex items-center gap-1.5 border-b border-line px-2 py-2">
        {back ? (
          <button type="button" onClick={back} aria-label={t("back")} className="inline-flex size-7 shrink-0 items-center justify-center rounded-ui-sm text-fg-muted hover:bg-hover hover:text-fg focus-ring">
            <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
          </button>
        ) : null}
        <span className="min-w-0 truncate ps-1 text-[13px] font-medium text-fg">{field.label}</span>
        {ops.length > 1 ? (
          <div className="relative ms-auto">
            <select
              aria-label={t("operator")}
              value={op}
              onChange={(e) => {
                const next = e.target.value as FilterOp;
                setValue((v: unknown) => convertValue(v, op, next, field));
                setOp(next);
              }}
              className={cn(controlVariants({ size: "sm" }), "h-7 w-auto appearance-none py-0 ps-2 pe-7 text-[13px] text-fg-muted")}
            >
              {ops.map((o) => (
                <option key={o} value={o}>
                  {t(`op_${o}` as keyof FilterBarLabels)}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2 text-fg-subtle" />
          </div>
        ) : (
          <span className="ms-auto pe-1 text-[13px] text-fg-muted">{t(`op_${op}` as keyof FilterBarLabels)}</span>
        )}
      </div>

      <ValueEditor field={field} op={op} value={value} onChange={setValue} onSubmit={apply} onBackspaceEmpty={backOnEmpty} t={t} facets={facets?.[field.field]} me={me} optionCache={optionCache} invalid={invalid} />

      <div className="flex items-center justify-end gap-2 border-t border-line px-2 py-2">
        <Button size="xs" variant="primary" disabled={!complete} onClick={apply}>
          {t("apply")}
        </Button>
      </div>
    </div>
  );
}

interface ValueEditorProps {
  field: FilterFieldDef;
  op: FilterOp;
  value: unknown;
  onChange: (v: unknown) => void;
  onSubmit: () => void;
  onBackspaceEmpty: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  t: T;
  facets?: Record<string, number>;
  me?: { id: string; name: string };
  optionCache: Map<string, string>;
  invalid: boolean;
}

function ValueEditor({ field, op, value, onChange, onSubmit, onBackspaceEmpty, t, facets, me, optionCache, invalid }: ValueEditorProps) {
  const f = useFormat();
  const errorId = React.useId();
  if (opTakesNoValue(op)) return null;
  const enter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    } else onBackspaceEmpty(e);
  };

  if (field.type === "enum" || field.type === "user" || field.type === "tags") {
    return <OptionList field={field} op={op} value={value} onChange={onChange} t={t} facets={facets} me={me} optionCache={optionCache} onBackspaceEmpty={onBackspaceEmpty} />;
  }

  if (field.type === "boolean") {
    return (
      <div role="radiogroup" aria-label={field.label} className="flex gap-1 p-2">
        {[true, false].map((b) => (
          <button
            key={String(b)}
            type="button"
            role="radio"
            aria-checked={value === b}
            onClick={() => onChange(b)}
            className={cn(
              "h-8 flex-1 rounded-ui-sm border text-[13px] transition-colors focus-ring",
              value === b ? "border-transparent bg-selected font-medium text-fg" : "border-field-border text-fg-muted hover:bg-hover",
            )}
          >
            {b ? t("yes") : t("no")}
          </button>
        ))}
      </div>
    );
  }

  const isDate = field.type === "date" || field.type === "datetime";

  if (isDate && op === "relative") {
    const custom = typeof value === "object" && value !== null ? (value as { last: number; unit: "day" | "week" | "month" }) : null;
    return (
      <div className="p-1">
        <div role="radiogroup" aria-label={t("value")} className="grid grid-cols-2 gap-0.5">
          {RELATIVE_PRESETS.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={value === r}
              onClick={() => onChange(r)}
              className={cn(itemVariants({ size: "sm" }), "justify-between", value === r && "bg-selected font-medium")}
            >
              {t(`rel_${r}` as keyof FilterBarLabels)}
              {value === r ? <Check aria-hidden className="size-3.5! text-accent-ink" /> : null}
            </button>
          ))}
        </div>
        <div className="mt-1 flex items-center gap-1.5 border-t border-line px-1 pt-2 pb-1 text-[13px] text-fg-muted">
          <span>{t("lastPrefix")}</span>
          <Input
            size="sm"
            type="number"
            min={1}
            max={999}
            aria-label={t("custom")}
            className="w-16"
            value={custom ? String(custom.last) : ""}
            placeholder="14"
            onChange={(e) => {
              const n = Number(e.target.value);
              if (e.target.value === "") onChange("last_30_days");
              else if (Number.isFinite(n) && n > 0) onChange({ last: Math.floor(n), unit: custom?.unit ?? "day" });
            }}
            onKeyDown={enter}
          />
          <select
            aria-label={t("custom")}
            value={custom?.unit ?? "day"}
            onChange={(e) => onChange({ last: custom?.last ?? 14, unit: e.target.value as "day" | "week" | "month" })}
            className={cn(controlVariants({ size: "sm" }), "h-[calc(var(--control-h)-0.5rem)] w-auto appearance-none py-0 ps-2 pe-6 text-[13px]")}
          >
            <option value="day">{t("unitDay")}</option>
            <option value="week">{t("unitWeek")}</option>
            <option value="month">{t("unitMonth")}</option>
          </select>
        </div>
      </div>
    );
  }

  const inputType = isDate ? "date" : field.type === "text" ? "text" : "text";
  const numeric = field.type === "number" || field.type === "currency" || field.type === "percent";
  const prefix = field.type === "currency" ? (f.currency(0, field.currency).replace(/[\d\s., ]+/g, "").trim() || undefined) : undefined;
  const common = {
    size: "sm" as const,
    type: inputType,
    inputMode: numeric ? ("decimal" as const) : undefined,
    onKeyDown: enter,
    leading: prefix ? <span className="text-[13px]">{prefix}</span> : undefined,
    trailing: field.type === "percent" ? <span className="text-[13px]">%</span> : undefined,
  };
  const clean = (s: string) => (numeric ? s.replace(",", ".").replace(/[^\d.-]/g, "") : s);

  if (op === "between") {
    const pair = (Array.isArray(value) ? value : ["", ""]) as [unknown, unknown];
    return (
      <div className="grid gap-1.5 p-2">
        <div className="grid grid-cols-2 gap-2">
          <Input {...common} autoFocus aria-label={isDate ? t("from") : t("min")} placeholder={isDate ? undefined : t("min")} value={String(pair[0] ?? "")} invalid={invalid} aria-describedby={invalid ? errorId : undefined} onChange={(e) => onChange([clean(e.target.value), pair[1]])} />
          <Input {...common} aria-label={isDate ? t("to") : t("max")} placeholder={isDate ? undefined : t("max")} value={String(pair[1] ?? "")} invalid={invalid} aria-describedby={invalid ? errorId : undefined} onChange={(e) => onChange([pair[0], clean(e.target.value)])} />
        </div>
        {invalid ? (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {t("rangeError")}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="p-2">
      <Input
        {...common}
        autoFocus
        aria-label={t("value")}
        placeholder={field.placeholder}
        value={String(value ?? "")}
        onChange={(e) => onChange(clean(e.target.value))}
      />
    </div>
  );
}

function OptionList({
  field,
  op,
  value,
  onChange,
  t,
  facets,
  me,
  optionCache,
  onBackspaceEmpty,
}: Pick<ValueEditorProps, "field" | "op" | "value" | "onChange" | "t" | "facets" | "me" | "optionCache" | "onBackspaceEmpty">) {
  const { locale } = useLocale();
  const f = useFormat();
  const [query, setQuery] = React.useState("");
  const { options, loading, async } = useFieldOptions(field, query, optionCache);
  const multiple = op === "in" || op === "notIn";
  const selected = multiple ? ((value as string[] | undefined) ?? []) : value === "" || value == null ? [] : [String(value)];
  const toggle = (v: string) => {
    if (!multiple) return onChange(v);
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  };
  const list: FilterOption[] = field.type === "user" && me ? [{ value: ME, label: t("me"), keywords: [me.name] }, ...options] : options;

  return (
    <Cmdk label={field.label} filter={async ? undefined : cmdkFilter(locale)} shouldFilter={!async} loop className="flex min-h-0 flex-col" data-slot="filter-options">
      <div className="flex items-center gap-2 border-b border-line px-3">
        <Search aria-hidden className="size-4 shrink-0 text-fg-subtle" />
        <Cmdk.Input autoFocus value={query} onValueChange={setQuery} placeholder={t("searchOptions")} className={cn(panelInput, "h-9")} onKeyDown={(e) => onBackspaceEmpty(e as React.KeyboardEvent<HTMLInputElement>)} />
        {loading ? <Spinner size="xs" tone="muted" /> : null}
      </div>
      <Cmdk.List label={field.label} aria-multiselectable={multiple || undefined} aria-busy={loading || undefined} className="max-h-64 overflow-y-auto overscroll-contain p-1 scroll-py-1">
        {loading && list.length === 0 ? (
          <Cmdk.Loading label={t("loading")} className="flex items-center gap-2 px-2 py-2 text-[13px] text-fg-muted">
            {t("loading")}
          </Cmdk.Loading>
        ) : (
          <Cmdk.Empty className="px-2 py-3 text-[13px] text-fg-muted">{t("noOptions")}</Cmdk.Empty>
        )}
        {list.map((o) => {
          const on = selected.includes(o.value);
          const count = facets?.[o.value];
          return (
            <Cmdk.Item key={o.value} value={o.value} keywords={[o.label, ...(o.keywords ?? [])]} onSelect={() => toggle(o.value)} data-checked={on ? "" : undefined} className={itemVariants({ size: "md" })}>
              <span
                aria-hidden
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center border transition-colors",
                  multiple ? "rounded-[4px]" : "rounded-full",
                  on ? "border-transparent bg-accent text-accent-fg" : "border-field-border-hover",
                )}
              >
                {on ? multiple ? <Check strokeWidth={3} className="size-3!" /> : <span className="size-1.5 rounded-full bg-current" /> : null}
              </span>
              {o.icon ? <span className="flex shrink-0 items-center [&_svg]:size-4">{o.icon}</span> : null}
              <span className={itemSlots.label}>{o.label}</span>
              {count !== undefined ? <span className="ms-auto ps-3 font-mono text-[11px] text-fg-subtle tabular">{f.number(count)}</span> : null}
              {on ? <span className="sr-only">, {t("selected")}</span> : null}
            </Cmdk.Item>
          );
        })}
      </Cmdk.List>
    </Cmdk>
  );
}

/* ------------------------------------------------------------------ */
/* Chip                                                                */
/* ------------------------------------------------------------------ */

const chipSize = {
  sm: "h-7 text-xs",
  md: "h-[calc(var(--control-h)-0.375rem)] text-[13px]",
} as const;

export interface FilterChipProps {
  clause: FilterClause;
  field: FilterFieldDef;
  onEdit: (step: "field" | "value", trigger: HTMLElement) => void;
  onRemove?: () => void;
  readOnly?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  labels?: Partial<FilterBarLabels>;
  /** @internal */
  optionCache?: Map<string, string>;
}

/**
 * One applied filter: `Stage │ is any of │ Proposal, Won │ ×`. Every segment is its own button
 * with a full accessible name; × removes it (Delete / Backspace too).
 */
export const FilterChip = /*#__PURE__*/ React.forwardRef<HTMLDivElement, FilterChipProps>(function FilterChip({ clause, field, onEdit, onRemove, readOnly, disabled, size = "md", labels, optionCache }, ref) {
  const t = useLabels("filterBar", filterBarLabels, labels);
  const format = useFormat();
  const dl = React.useMemo(() => describeLabelsFrom(t), [t]);
  const cache = React.useMemo(() => optionCache ?? new Map<string, string>(), [optionCache]);
  const opText = t(`op_${clause.op}` as keyof FilterBarLabels);
  const valueText = chipValue(clause, field, format, dl, cache);
  const full = t("clause", { field: field.label, op: opText, value: describeValue(clause, field, format, dl, cache) }).trim();
  const seg = cn("inline-flex h-full min-w-0 items-center px-2 outline-none transition-colors focus-visible:z-10 focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]", !readOnly && !disabled && "hover:bg-hover");
  const inert = readOnly || disabled;
  const Icon = field.icon;
  return (
    <div
      ref={ref}
      data-slot="filter-chip"
      data-field={field.field}
      className={cn("inline-flex max-w-full items-stretch overflow-hidden rounded-ui-sm border border-field-border bg-field shadow-[0_1px_1px_rgb(0_0_0/0.03)]", chipSize[size], disabled && "opacity-60")}
    >
      <button type="button" {...{ [ROVE]: "" }} disabled={disabled} aria-disabled={readOnly || undefined} aria-label={t("editField", { field: field.label })} onClick={(e) => !inert && onEdit("field", e.currentTarget)} className={cn(seg, "gap-1.5 ps-2.5 font-medium text-fg")}>
        {Icon ? <Icon className="size-3.5 shrink-0 text-fg-subtle" /> : null}
        <span className="truncate">{field.label}</span>
      </button>
      <span aria-hidden className="my-1.5 w-px bg-line" />
      <button type="button" {...{ [ROVE]: "" }} disabled={disabled} aria-disabled={readOnly || undefined} aria-label={t("editOp", { op: opText })} onClick={(e) => !inert && onEdit("value", e.currentTarget)} className={cn(seg, "whitespace-nowrap text-fg-muted")}>
        {opText}
      </button>
      {opTakesNoValue(clause.op) ? null : (
        <>
          <span aria-hidden className="my-1.5 w-px bg-line" />
          <button
            type="button"
            {...{ [ROVE]: "" }}
            disabled={disabled}
            aria-disabled={readOnly || undefined}
            aria-label={t("editValue", { clause: full })}
            title={full}
            onClick={(e) => !inert && onEdit("value", e.currentTarget)}
            className={cn(seg, "max-w-[18rem] bg-accent-soft/60 font-medium text-accent-ink", !inert && "hover:bg-accent-soft")}
          >
            <span className="truncate tabular">{valueText}</span>
          </button>
        </>
      )}
      {onRemove && !readOnly ? (
        <>
          <span aria-hidden className="my-1.5 w-px bg-line" />
          <button
            type="button"
            {...{ [ROVE]: "" }}
            disabled={disabled}
            aria-label={t("remove", { field: field.label })}
            onClick={onRemove}
            onKeyDown={(e) => {
              if (e.key === "Delete" || e.key === "Backspace") {
                e.preventDefault();
                onRemove();
              }
            }}
            className={cn(seg, "px-1.5 text-fg-subtle hover:text-fg")}
          >
            <X aria-hidden className="size-3.5" strokeWidth={2.25} />
          </button>
        </>
      ) : null}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* FilterBar                                                           */
/* ------------------------------------------------------------------ */

export interface FilterBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** The filterable fields (Data Table: `filterFieldsFromColumns(columns)`). */
  fields: FilterFieldDef[];
  /** Controlled filter group. */
  value?: FilterGroup;
  defaultValue?: FilterGroup;
  onChange?: (value: FilterGroup) => void;
  /** Shows a search box at the start when `onQChange` is set. */
  q?: string;
  onQChange?: (q: string) => void;
  searchPlaceholder?: string;
  /** Option counts per field: `{ stage: { proposal: 128, won: 64 } }`. */
  facets?: Record<string, Record<string, number>>;
  /** Result count, announced after each change ("84 results."). */
  resultCount?: number;
  /** Collapse chips beyond this number into "+N". */
  maxVisibleChips?: number;
  /** `"auto"` (default): a "Filters (n)" button + Sheet when the bar is narrower than 480px. */
  layout?: "auto" | "inline" | "sheet";
  size?: "sm" | "md";
  disabled?: boolean;
  /** Chips without × and edit popovers (a shared-link preview). */
  readOnly?: boolean;
  /** Enables "Me" in user fields (stored as the symbolic `"$me"`). */
  me?: { id: string; name: string };
  /** Open the editor for a field programmatically (Data Table "Filter by this column"). Change `key` to reopen. */
  addRequest?: { field: string; key: number } | null;
  /** Extra controls at the end of the bar (sort, view options). */
  actions?: React.ReactNode;
  labels?: Partial<FilterBarLabels>;
}

type EditorState = { kind: "add" } | { kind: "edit"; clauseId: string; step: "field" | "value" } | { kind: "quick"; field: string };

/**
 * Structured filters as chips above any collection — tables, boards, calendars, galleries.
 * `+ Filter` → field → condition + value in one stepped popover; each chip segment edits in place.
 *
 * ```tsx
 * const [filters, setFilters] = React.useState<FilterGroup>({ logic: "and", clauses: [] });
 * <FilterBar fields={fields} value={filters} onChange={setFilters} resultCount={rows.length} />
 * ```
 */
export const FilterBar = /*#__PURE__*/ React.forwardRef<HTMLDivElement, FilterBarProps>(function FilterBar(
  {
    fields,
    value: valueProp,
    defaultValue,
    onChange,
    q,
    onQChange,
    searchPlaceholder,
    facets,
    resultCount,
    maxVisibleChips,
    layout = "auto",
    size = "md",
    disabled,
    readOnly,
    me,
    addRequest,
    actions,
    labels,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("filterBar", filterBarLabels, labels);
  const format = useFormat();
  const dl = React.useMemo(() => describeLabelsFrom(t), [t]);
  const [value, setValue] = useControllableState<FilterGroup>({ value: valueProp, defaultValue: defaultValue ?? emptyFilterGroup(), onChange, name: "FilterBar" });
  const [editor, setEditor] = React.useState<EditorState | null>(null);
  const [expanded, setExpanded] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState("");
  const optionCache = React.useRef(new Map<string, string>()).current;
  const draftRef = React.useRef<FilterClause | null>(null);
  const cancelRef = React.useRef(false);
  const returnFocus = React.useRef<HTMLElement | null>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const rove = useRovingToolbar(toolbarRef);
  const pendingFocus = React.useRef<number | null>(null);
  const { ref: measureRef, width } = useContainerWidth<HTMLDivElement>();
  const asSheet = layout === "sheet" || (layout === "auto" && width !== undefined && width < 480);

  const byField = React.useMemo(() => new Map(fields.map((f) => [f.field, f])), [fields]);
  const clauses = value.clauses.filter((c): c is FilterClause => !isFilterGroup(c) && byField.has(c.field));
  const nested = value.clauses.filter(isFilterGroup);
  const activeCount = clauses.length + nested.reduce((n, g) => n + flattenClauses(g).length, 0);
  const quick = fields.filter((f) => f.quick && !clauses.some((c) => c.field === f.field));
  const limit = maxVisibleChips && !expanded ? maxVisibleChips : Infinity;
  const visible = clauses.slice(0, limit);
  const hidden = clauses.length - visible.length;

  const describe = (c: FilterClause) => {
    const f = byField.get(c.field)!;
    return t("clause", { field: f.label, op: t(`op_${c.op}` as keyof FilterBarLabels), value: describeValue(c, f, format, dl, optionCache) }).trim();
  };
  const commit = (next: FilterGroup, msg: string) => {
    setValue(next);
    // The live region appends the (re-rendered) result count to this message.
    setAnnouncement(msg);
  };

  const upsert = (clause: FilterClause) => {
    const exists = value.clauses.some((c) => !isFilterGroup(c) && c.id === clause.id);
    const nextClauses = exists ? value.clauses.map((c) => (!isFilterGroup(c) && c.id === clause.id ? clause : c)) : [...value.clauses, clause];
    commit({ ...value, clauses: nextClauses }, t(exists ? "updated" : "added", { clause: describe(clause) }));
  };

  const remove = (id: string) => {
    const idx = clauses.findIndex((c) => c.id === id);
    const removed = clauses[idx];
    const items = roveItems(toolbarRef.current);
    const chipEl = toolbarRef.current?.querySelector(`[data-clause="${id}"]`);
    const firstOfChip = chipEl ? items.findIndex((el) => chipEl.contains(el)) : -1;
    pendingFocus.current = firstOfChip === -1 ? 0 : firstOfChip;
    commit({ ...value, clauses: value.clauses.filter((c) => isFilterGroup(c) || c.id !== id) }, t("removed", { field: removed ? byField.get(removed.field)!.label : "" }));
  };

  const clearAll = () => {
    pendingFocus.current = 0;
    commit(emptyFilterGroup(), t("cleared"));
  };

  React.useLayoutEffect(() => {
    if (pendingFocus.current === null) return;
    const i = pendingFocus.current;
    pendingFocus.current = null;
    rove.focusIndex(i);
  });

  // Programmatic "filter by this column".
  const lastRequest = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (!addRequest || addRequest.key === lastRequest.current || readOnly || disabled) return;
    lastRequest.current = addRequest.key;
    if (!byField.has(addRequest.field)) return;
    const existing = clauses.find((c) => c.field === addRequest.field);
    setEditor(existing ? { kind: "edit", clauseId: existing.id, step: "value" } : { kind: "quick", field: addRequest.field });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addRequest?.key]);

  const openFor = (state: EditorState, trigger: HTMLElement | null) => {
    returnFocus.current = trigger;
    draftRef.current = null;
    cancelRef.current = false;
    setEditor(state);
  };

  const close = () => {
    const draft = draftRef.current;
    if (draft && !cancelRef.current) {
      const prev = clauses.find((c) => c.id === draft.id);
      if (!prev || JSON.stringify(prev) !== JSON.stringify(draft)) upsert(draft);
    }
    draftRef.current = null;
    setEditor(null);
  };

  const contentProps = (label: string) => ({
    size: "auto" as const,
    padded: false,
    align: "start" as const,
    "aria-label": label,
    className: "w-[19rem] overflow-hidden",
    onEscapeKeyDown: () => {
      cancelRef.current = true;
    },
    onCloseAutoFocus: (e: Event) => {
      const el = returnFocus.current;
      if (el && el.isConnected) {
        e.preventDefault();
        el.focus();
      }
    },
  });

  const editorFor = (state: EditorState) => {
    const clause = state.kind === "edit" ? clauses.find((c) => c.id === state.clauseId) : undefined;
    return (
      <FilterEditor
        key={state.kind === "edit" ? `${state.clauseId}-${state.step}` : state.kind === "quick" ? `q-${state.field}` : "add"}
        fields={fields}
        initial={clause ?? (state.kind === "quick" ? { field: state.field } : undefined)}
        step={state.kind === "add" ? "field" : state.kind === "edit" ? state.step : "value"}
        canChangeField={state.kind !== "quick"}
        t={t}
        facets={facets}
        me={me}
        optionCache={optionCache}
        onDraft={(c) => {
          draftRef.current = c;
        }}
        onApply={(c) => {
          draftRef.current = null;
          upsert(c);
          setEditor(null);
        }}
      />
    );
  };

  const chips = visible.map((clause) => {
    const field = byField.get(clause.field)!;
    const open = editor?.kind === "edit" && editor.clauseId === clause.id;
    return (
      <Popover key={clause.id} open={open} onOpenChange={(o) => (o ? null : close())}>
        <PopoverAnchor asChild>
          <div data-clause={clause.id} className="inline-flex max-w-full">
            <FilterChip
              clause={clause}
              field={field}
              size={size}
              readOnly={readOnly}
              disabled={disabled}
              labels={labels}
              optionCache={optionCache}
              onEdit={(step, trigger) => openFor({ kind: "edit", clauseId: clause.id, step }, trigger)}
              onRemove={() => remove(clause.id)}
            />
          </div>
        </PopoverAnchor>
        {open && editor ? <PopoverContent {...contentProps(field.label)}>{editorFor(editor)}</PopoverContent> : null}
      </Popover>
    );
  });

  const quickChips = readOnly
    ? []
    : quick.map((field) => {
        const open = editor?.kind === "quick" && editor.field === field.field;
        const Icon = field.icon;
        return (
          <Popover key={`quick-${field.field}`} open={open} onOpenChange={(o) => (o ? openFor({ kind: "quick", field: field.field }, null) : close())}>
            <PopoverTrigger asChild>
              <button
                type="button"
                {...{ [ROVE]: "" }}
                disabled={disabled}
                data-slot="filter-quick"
                onPointerDown={(e) => (returnFocus.current = e.currentTarget)}
                onKeyDown={(e) => (returnFocus.current = e.currentTarget)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-ui-sm border border-dashed border-field-border-hover px-2.5 text-fg-muted transition-colors hover:border-fg-subtle hover:bg-hover hover:text-fg focus-ring disabled:opacity-50",
                  chipSize[size],
                )}
              >
                {Icon ? <Icon className="size-3.5 text-fg-subtle" /> : null}
                {field.label}
                <ChevronDown aria-hidden className="size-3.5 text-fg-subtle" />
              </button>
            </PopoverTrigger>
            {open && editor ? <PopoverContent {...contentProps(field.label)}>{editorFor(editor)}</PopoverContent> : null}
          </Popover>
        );
      });

  const addButton = readOnly ? null : (
    <Popover open={editor?.kind === "add"} onOpenChange={(o) => (o ? openFor({ kind: "add" }, null) : close())}>
      <PopoverTrigger asChild>
        <button
          type="button"
          {...{ [ROVE]: "" }}
          disabled={disabled}
          aria-label={t("addAria")}
          data-slot="filter-add"
          onPointerDown={(e) => (returnFocus.current = e.currentTarget)}
          onKeyDown={(e) => (returnFocus.current = e.currentTarget)}
          className={cn("inline-flex items-center gap-1.5 rounded-ui-sm px-2 font-medium text-fg-muted transition-colors hover:bg-hover hover:text-fg focus-ring disabled:opacity-50", chipSize[size])}
        >
          <Plus aria-hidden className="size-3.5" strokeWidth={2.25} />
          {t("add")}
        </button>
      </PopoverTrigger>
      {editor?.kind === "add" ? <PopoverContent {...contentProps(t("addAria"))}>{editorFor(editor)}</PopoverContent> : null}
    </Popover>
  );

  const overflow =
    hidden > 0 || (expanded && maxVisibleChips && clauses.length > maxVisibleChips) ? (
      <button
        type="button"
        {...{ [ROVE]: "" }}
        aria-label={hidden > 0 ? t("moreAria", { count: hidden }) : t("less")}
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
        className={cn("inline-flex items-center rounded-ui-sm bg-selected px-2 font-medium text-fg-muted tabular hover:text-fg focus-ring", chipSize[size])}
      >
        {hidden > 0 ? t("more", { count: hidden }) : t("less")}
      </button>
    ) : null;

  const clearButton =
    activeCount > 0 && !readOnly ? (
      <button type="button" {...{ [ROVE]: "" }} disabled={disabled} onClick={clearAll} data-slot="filter-clear" className={cn("inline-flex items-center rounded-ui-sm px-2 text-fg-subtle underline-offset-4 transition-colors hover:text-fg hover:underline focus-ring", chipSize[size])}>
        {t("clear")}
      </button>
    ) : null;

  const search = onQChange ? (
    <Input
      size="sm"
      type="search"
      aria-label={t("searchLabel")}
      placeholder={searchPlaceholder ?? t("searchPlaceholder")}
      value={q ?? ""}
      onChange={(e) => onQChange(e.target.value)}
      leading={<Search />}
      clearable
      onClear={() => onQChange("")}
      disabled={disabled}
      className={cn("w-full sm:w-60", size === "sm" && "h-7")}
    />
  ) : null;

  const live = (
    <div aria-live="polite" className="sr-only" data-slot="filter-live">
      {announcement}
      {announcement && resultCount !== undefined ? ` ${t("results", { count: resultCount })}` : ""}
    </div>
  );

  if (asSheet) {
    return (
      <div ref={(node) => { measureRef(node); if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }} data-slot="filter-bar" data-layout="sheet" className={cn("flex w-full flex-wrap items-center gap-2", className)} {...props}>
        {search}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <Button size="sm" variant="secondary" onClick={() => setSheetOpen(true)} disabled={disabled} aria-haspopup="dialog">
            <SlidersHorizontal aria-hidden />
            {activeCount ? t("filtersCount", { count: activeCount }) : t("filtersButton")}
          </Button>
          <SheetContent side="bottom">
            <SheetHeader title={t("label")} />
            <SheetBody>
              <div ref={toolbarRef} role="toolbar" aria-label={t("label")} aria-orientation="vertical" onFocus={rove.onFocus} onKeyDown={rove.onKeyDown} className="flex flex-col items-start gap-2">
                {chips}
                {quickChips}
                {addButton}
              </div>
            </SheetBody>
            {clearButton ? <SheetFooter>{clearButton}</SheetFooter> : null}
          </SheetContent>
        </Sheet>
        {actions}
        {live}
      </div>
    );
  }

  return (
    <div
      ref={(node) => {
        measureRef(node);
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="filter-bar"
      data-layout="inline"
      className={cn("flex w-full flex-wrap items-center gap-x-2 gap-y-2", className)}
      {...props}
    >
      {search}
      <div ref={toolbarRef} role="toolbar" aria-label={t("label")} onFocus={rove.onFocus} onKeyDown={rove.onKeyDown} className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {chips}
        {overflow}
        {quickChips}
        {addButton}
        {clearButton}
      </div>
      {actions ? <div className="ms-auto flex items-center gap-1.5">{actions}</div> : null}
      {live}
    </div>
  );
});
