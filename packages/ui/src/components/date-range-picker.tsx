"use client";

import * as React from "react";
import type { Matcher } from "react-day-picker";
import { CalendarRange, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useLocale } from "../lib/locale";
import { useLabels } from "../lib/labels";
import { useFieldControl, FieldContextReset } from "../lib/field-context";
import { useControllableState } from "../lib/use-controllable-state";
import { useMediaQuery } from "../lib/use-media-query";
import { mergeIds } from "../lib/compose-refs";
import { controlVariants, itemVariants } from "../lib/variants";
import {
  addIsoDays,
  dateToIso,
  defaultRangePresets,
  isoToDate,
  rangeLength,
  todayIso,
  type DateRangePreset,
  type IsoDateRange,
  type IsoDateString,
  type PresetLabelKey,
} from "../lib/date";
import { CalendarGrid, toDayMatchers, useCalendarWeek, type CalendarLabels, type DayMatcher } from "./calendar";
import { useDateInputText, type DateInputError, type DatePickerCalendarProps, type DatePickerLabels } from "./date-picker";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";

const dateRangePickerLabels = {
  placeholder: "Pick a date range",
  openCalendar: "Open calendar",
  clear: "Clear",
  apply: "Apply",
  cancel: "Cancel",
  presets: "Quick ranges",
  start: "Start date",
  end: "End date",
  dialog: "Choose dates",
  days: "{count, plural, one {# day} other {# days}}",
  summary: "From {from} to {to}, {days}",
  pickEnd: "From {from}. Now pick the end date.",
  minDays: "Pick at least {count} days",
  maxDays: "Pick at most {count} days",
  today: "Today",
  yesterday: "Yesterday",
  last7: "Last 7 days",
  last30: "Last 30 days",
  thisWeek: "This week",
  thisMonth: "This month",
  lastMonth: "Last month",
  last90: "Last 90 days",
  thisYear: "This year",
};
export type DateRangePickerLabels = typeof dateRangePickerLabels;

export interface DateRangePickerProps {
  /** `{ from, to }` as `YYYY-MM-DD`; `null` when empty. While picking, `to` can be missing. */
  value?: IsoDateRange | null;
  defaultValue?: IsoDateRange | null;
  onValueChange?: (value: IsoDateRange | null) => void;
  /** Quick ranges beside the calendar. `true` = Today, Yesterday, Last 7 / 30 days, This / Last month… */
  presets?: DateRangePreset[] | boolean;
  /** Months side by side. Default 2 (1 below the `sm` breakpoint). */
  numberOfMonths?: 1 | 2;
  /** `"apply"`: changes are committed only with Apply (expensive report queries). Default `"immediate"`. */
  commit?: "immediate" | "apply";
  /** Minimum length in days (inclusive). */
  minDays?: number;
  /** Maximum length in days (inclusive). */
  maxDays?: number;
  min?: IsoDateString;
  max?: IsoDateString;
  disabledDays?: DayMatcher | DayMatcher[];
  /** A range may not span disabled days (bookings). */
  excludeDisabled?: boolean;
  /** `"button"` (default): one trigger showing the range. `"input"`: two typeable fields. */
  trigger?: "input" | "button";
  /** Hidden input names; submit `YYYY-MM-DD`. */
  nameFrom?: string;
  nameTo?: string;
  placeholder?: string;
  /** Clear button in the footer (and in the input). */
  clearable?: boolean;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  align?: "start" | "center" | "end";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Typed entry problems (input trigger). */
  onInputError?: (error: DateInputError | null, message: string) => void;
  calendarProps?: DatePickerCalendarProps;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  labels?: Partial<DateRangePickerLabels>;
  inputLabels?: Partial<DatePickerLabels>;
  calendarLabels?: Partial<CalendarLabels>;
}

const sameRange = (a: IsoDateRange | null | undefined, b: IsoDateRange | null | undefined) => (a?.from ?? null) === (b?.from ?? null) && (a?.to ?? null) === (b?.to ?? null);

/**
 * A from–to range in one popover: presets column, one or two month grids, and a footer with the
 * selected length. Hovering previews the band; `commit="apply"` holds changes until Apply.
 * Values are `YYYY-MM-DD` strings.
 *
 * ```tsx
 * <DateRangePicker presets value={range} onValueChange={setRange} />
 * <DateRangePicker commit="apply" maxDays={31} min={todayIso()} />
 * ```
 */
export const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(function DateRangePicker(rawProps, ref) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    presets: presetsProp = false,
    numberOfMonths = 2,
    commit = "immediate",
    minDays,
    maxDays,
    min,
    max,
    disabledDays,
    excludeDisabled,
    trigger = "button",
    nameFrom,
    nameTo,
    placeholder,
    clearable,
    size = "md",
    invalid,
    align = "start",
    open: openProp,
    defaultOpen,
    onOpenChange,
    onInputError,
    calendarProps,
    className,
    labels,
    inputLabels,
    calendarLabels,
    ...rest
  } = rawProps;
  const control = useFieldControl({ ...rest, "aria-invalid": invalid ? true : undefined });
  const t = useLabels("dateRangePicker", dateRangePickerLabels, labels);
  const { format, timeZone } = useLocale();
  const week = useCalendarWeek();
  const wide = useMediaQuery("(min-width: 640px)");
  const months = numberOfMonths === 2 && wide !== false ? 2 : 1;
  const today = todayIso(timeZone === "UTC" ? undefined : timeZone);
  const inert = control.disabled || control.readOnly;

  const [value, setValue] = useControllableState<IsoDateRange | null>({ value: valueProp, defaultValue: defaultValue ?? null, onChange: onValueChange, name: "DateRangePicker" });
  const [open, setOpenState] = useControllableState<boolean>({ value: openProp, defaultValue: defaultOpen ?? false, onChange: onOpenChange, name: "DateRangePicker" });
  const [draft, setDraft] = React.useState<IsoDateRange | null>(value);
  const [hover, setHover] = React.useState<IsoDateString | null>(null);
  const [month, setMonth] = React.useState<Date>(() => isoToDate(value?.from ?? today)!);
  const [lengthError, setLengthError] = React.useState<string | null>(null);

  const setOpen = (o: boolean) => {
    if (o) {
      setDraft(value);
      setHover(null);
      setLengthError(null);
      const anchor = isoToDate(value?.from ?? today)!;
      setMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
    }
    setOpenState(o);
  };

  const presets = React.useMemo<DateRangePreset[]>(() => {
    if (!presetsProp) return [];
    if (Array.isArray(presetsProp)) return presetsProp;
    const keys = Object.keys(dateRangePickerLabels).filter((k) => ["today", "yesterday", "last7", "last30", "thisWeek", "thisMonth", "lastMonth", "last90", "thisYear"].includes(k)) as PresetLabelKey[];
    return defaultRangePresets(Object.fromEntries(keys.map((k) => [k, t(k)])) as Partial<Record<PresetLabelKey, string>>);
  }, [presetsProp, t]);

  const shown = commit === "apply" || open ? draft : value;
  const activePreset = presets.find((p) => sameRange(p.range(today, week), shown))?.id ?? null;

  const commitRange = (r: IsoDateRange | null, close: boolean) => {
    setDraft(r);
    if (commit === "immediate") setValue(r);
    if (close && commit === "immediate") setOpenState(false);
  };

  const checkLength = (r: IsoDateRange): string | null => {
    if (!r.to) return null;
    const n = rangeLength(r);
    if (minDays && n < minDays) return t("minDays", { count: minDays });
    if (maxDays && n > maxDays) return t("maxDays", { count: maxDays });
    return null;
  };

  const onSelect = (r: { from?: Date; to?: Date } | undefined) => {
    setHover(null);
    if (!r?.from) {
      setLengthError(null);
      return commitRange(null, false);
    }
    const next: IsoDateRange = { from: dateToIso(r.from), ...(r.to ? { to: dateToIso(r.to) } : {}) };
    const problem = checkLength(next);
    setLengthError(problem);
    if (problem) {
      setDraft({ from: next.from });
      return;
    }
    commitRange(next, !!next.to);
  };

  // While the end is being picked, block days that would break min/max length.
  const matchers = React.useMemo<Matcher[]>(() => {
    const base = toDayMatchers({ min, max, disabledDays });
    if (draft?.from && !draft.to) {
      const from = isoToDate(draft.from)!;
      if (maxDays) {
        base.push({ after: isoToDate(addIsoDays(draft.from, maxDays - 1))! }, { before: isoToDate(addIsoDays(draft.from, -(maxDays - 1)))! });
      }
      if (minDays && minDays > 1) {
        const lo = isoToDate(addIsoDays(draft.from, -(minDays - 2)))!;
        const hi = isoToDate(addIsoDays(draft.from, minDays - 2))!;
        base.push((d: Date) => d >= lo && d <= hi && d.getTime() !== from.getTime());
      }
    }
    return base;
  }, [min, max, disabledDays, draft, minDays, maxDays]);

  const previewModifiers = React.useMemo(() => {
    if (!draft?.from || draft.to || !hover || hover === draft.from) return undefined;
    const [lo, hi] = hover > draft.from ? [draft.from, hover] : [hover, draft.from];
    const a = isoToDate(lo)!;
    const b = isoToDate(hi)!;
    return { preview: (d: Date) => d >= a && d <= b };
  }, [draft, hover]);

  const fmtRange = (r: IsoDateRange | null | undefined, style: "medium" | "long" = "medium") => {
    if (!r?.from) return "";
    if (!r.to) return `${format.date(r.from, style)} – …`;
    return r.from === r.to ? format.date(r.from, style) : format.dateRange(r.from, r.to, style);
  };

  const announcement = draft?.from
    ? draft.to
      ? t("summary", { from: format.date(draft.from, "long"), to: format.date(draft.to, "long"), days: t("days", { count: rangeLength(draft) }) })
      : t("pickEnd", { from: format.date(draft.from, "long") })
    : "";

  /* ---------------- presets listbox ---------------- */
  const presetRef = React.useRef<HTMLDivElement>(null);
  const pickPreset = (p: DateRangePreset) => {
    const r = p.range(today, week);
    setLengthError(null);
    const anchor = isoToDate(r.from)!;
    setMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
    commitRange(r, true);
  };
  const onPresetKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const opts = Array.from(presetRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
    const cur = opts.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (e.key === "ArrowDown") next = (cur + 1) % opts.length;
    else if (e.key === "ArrowUp") next = (cur - 1 + opts.length) % opts.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = opts.length - 1;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const p = presets[cur];
      if (p) pickPreset(p);
      return;
    } else return;
    e.preventDefault();
    opts[next]?.focus();
  };
  const focusablePreset = Math.max(0, presets.findIndex((p) => p.id === activePreset));

  const footer = (
    <div className="-mx-1 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line px-1 pt-2.5">
      <p className={cn("me-auto min-w-0 text-xs tabular", lengthError ? "text-danger" : "text-fg-muted")}>
        {lengthError ?? (draft?.from ? (
          <>
            <span className="text-fg">{fmtRange(draft)}</span>
            {draft.to ? <span className="ms-2 text-fg-subtle">{t("days", { count: rangeLength(draft) })}</span> : null}
          </>
        ) : (
          (placeholder ?? t("placeholder"))
        ))}
      </p>
      <div className="flex items-center gap-1.5">
        {clearable && draft?.from ? (
          <Button size="xs" variant="ghost" onClick={() => commitRange(null, false)}>
            {t("clear")}
          </Button>
        ) : null}
        {commit === "apply" ? (
          <>
            <Button size="xs" variant="ghost" onClick={() => setOpenState(false)}>
              {t("cancel")}
            </Button>
            <Button
              size="xs"
              variant="primary"
              disabled={!!draft?.from && !draft.to}
              onClick={() => {
                setValue(draft);
                setOpenState(false);
              }}
            >
              {t("apply")}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );

  const content = (
    <PopoverContent
      size="auto"
      padded={false}
      align={align}
      aria-label={t("dialog")}
      onOpenAutoFocus={(e) => e.preventDefault()}
      className="max-w-[calc(100vw-1.5rem)]"
    >
      <FieldContextReset>
        <div className="flex flex-col sm:flex-row">
          {presets.length ? (
            <div
              ref={presetRef}
              role="listbox"
              aria-label={t("presets")}
              onKeyDown={onPresetKeyDown}
              className="flex gap-1 overflow-x-auto border-b border-line p-2 scrollbar-none sm:w-40 sm:flex-col sm:overflow-visible sm:border-e sm:border-b-0"
            >
              {presets.map((p, i) => {
                const selected = p.id === activePreset;
                return (
                  <div
                    key={p.id}
                    role="option"
                    aria-selected={selected}
                    tabIndex={i === focusablePreset ? 0 : -1}
                    onClick={() => pickPreset(p)}
                    className={cn(
                      itemVariants({ size: "sm" }),
                      "shrink-0 whitespace-nowrap focus-ring sm:w-full",
                      selected && "bg-accent-soft! font-medium text-accent-ink",
                    )}
                  >
                    {p.label}
                  </div>
                );
              })}
            </div>
          ) : null}
          <div className="p-(--popover-p) [--popover-p:calc(var(--gap)*0.85)]">
            <CalendarGrid
              autoFocus={!presets.length}
              {...calendarProps}
              labels={calendarLabels}
              mode="range"
              resetOnSelect
              excludeDisabled={excludeDisabled}
              selected={draft ? { from: isoToDate(draft.from) ?? undefined, to: isoToDate(draft.to) ?? undefined } : undefined}
              onSelect={onSelect}
              month={month}
              onMonthChange={setMonth}
              numberOfMonths={months}
              disabled={matchers}
              modifiers={previewModifiers}
              onDayMouseEnter={(d) => setHover(dateToIso(d))}
              onDayFocus={(d) => setHover(dateToIso(d))}
              onDayMouseLeave={() => setHover(null)}
              startMonth={calendarProps?.startMonth ?? (isoToDate(min) ?? undefined)}
              endMonth={calendarProps?.endMonth ?? (isoToDate(max) ?? undefined)}
              footer={footer}
            />
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </FieldContextReset>
    </PopoverContent>
  );

  const hidden = (
    <>
      {nameFrom ? <input type="hidden" name={nameFrom} value={value?.from ?? ""} /> : null}
      {nameTo ? <input type="hidden" name={nameTo} value={value?.to ?? ""} /> : null}
    </>
  );

  if (trigger === "input") {
    return (
      <RangeInputs
        value={value}
        setValue={setValue}
        open={open}
        setOpen={(o) => !inert && setOpen(o)}
        control={control}
        size={size}
        className={className}
        labels={labels}
        inputLabels={inputLabels}
        clearable={clearable}
        min={min}
        max={max}
        disabledDays={disabledDays}
        onInputError={onInputError}
        content={content}
        hidden={hidden}
        buttonRef={ref}
      />
    );
  }

  return (
    <Popover open={open} onOpenChange={(o) => !inert && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          id={control.id}
          disabled={control.disabled}
          // The visible range stays part of the accessible name: a Field label is joined with the
          // button's own text, and an aria-label becomes a visually hidden prefix.
          aria-labelledby={control["aria-labelledby"] ? `${control["aria-labelledby"]} ${control.id}` : undefined}
          aria-describedby={control["aria-describedby"]}
          aria-invalid={control["aria-invalid"] || undefined}
          // No aria-required: not allowed on a button (axe aria-allowed-attr). The Field marks the label.
          data-slot="date-range-picker"
          data-readonly={control.readOnly ? "" : undefined}
          data-placeholder={value?.from ? undefined : ""}
          className={cn(controlVariants({ size }), "w-auto cursor-default justify-start text-start focus-ring", className)}
        >
          <CalendarRange aria-hidden className="text-fg-subtle" />
          {control["aria-label"] && !control["aria-labelledby"] ? <span className="sr-only">{control["aria-label"]}, </span> : null}
          <span className={cn("truncate tabular", !value?.from && "text-fg-subtle")}>{value?.from ? fmtRange(value) : (placeholder ?? t("placeholder"))}</span>
        </button>
      </PopoverTrigger>
      {content}
      {hidden}
    </Popover>
  );
});

/* Two typeable fields in one box (trigger="input"). */
function RangeInputs({
  value,
  setValue,
  open,
  setOpen,
  control,
  size,
  className,
  labels,
  inputLabels,
  clearable,
  min,
  max,
  disabledDays,
  onInputError,
  content,
  hidden,
  buttonRef,
}: {
  value: IsoDateRange | null;
  setValue: (v: IsoDateRange | null) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  control: ReturnType<typeof useFieldControl<{ id?: string; disabled?: boolean; readOnly?: boolean; required?: boolean; "aria-label"?: string; "aria-labelledby"?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>>;
  size: "sm" | "md" | "lg";
  className?: string;
  labels?: Partial<DateRangePickerLabels>;
  inputLabels?: Partial<DatePickerLabels>;
  clearable?: boolean;
  min?: IsoDateString;
  max?: IsoDateString;
  disabledDays?: DayMatcher | DayMatcher[];
  onInputError?: (error: DateInputError | null, message: string) => void;
  content: React.ReactNode;
  hidden: React.ReactNode;
  buttonRef: React.ForwardedRef<HTMLButtonElement>;
}) {
  const t = useLabels("dateRangePicker", dateRangePickerLabels, labels);
  const errorId = React.useId();
  const from = useDateInputText({
    value: value?.from ?? null,
    onCommit: (f) => {
      if (!f) return setValue(null);
      const to = value?.to && value.to >= f ? value.to : undefined;
      setValue({ from: f, ...(to ? { to } : {}) });
    },
    min,
    max,
    disabledDays,
    labels: inputLabels,
    onError: onInputError,
  });
  const to = useDateInputText({
    value: value?.to ?? null,
    onCommit: (tv) => {
      if (!tv) return setValue(value?.from ? { from: value.from } : null);
      if (!value?.from) return setValue({ from: tv, to: tv });
      setValue(tv < value.from ? { from: tv, to: value.from } : { from: value.from, to: tv });
    },
    min,
    max,
    disabledDays,
    labels: inputLabels,
    onError: onInputError,
  });
  const inert = control.disabled || control.readOnly;
  const errorMessage = from.error ? from.errorMessage : to.error ? to.errorMessage : "";
  const field = "h-full w-[calc(10ch+1rem)] min-w-0 flex-1 bg-transparent px-2 text-[length:inherit] text-fg tabular outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed";
  const shared = {
    type: "text",
    autoComplete: "off",
    spellCheck: false,
    disabled: control.disabled,
    readOnly: control.readOnly,
    "aria-describedby": mergeIds(control["aria-describedby"], errorMessage ? errorId : undefined),
  } as const;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          role="group"
          aria-labelledby={control["aria-labelledby"]}
          aria-label={control["aria-label"]}
          data-slot="date-range-picker"
          data-readonly={control.readOnly ? "" : undefined}
          className={cn(controlVariants({ size }), "w-auto cursor-text gap-0 px-0", className)}
        >
          <CalendarRange aria-hidden className="ms-3 shrink-0 text-fg-subtle" />
          <input
            {...shared}
            id={control.id}
            aria-label={t("start")}
            aria-invalid={!!from.error || !!control["aria-invalid"] || undefined}
            placeholder={from.placeholder}
            value={from.text}
            onChange={(e) => from.setText(e.currentTarget.value)}
            onBlur={() => from.commit()}
            onKeyDown={(e) => e.key === "Enter" && from.commit()}
            className={cn(field, "ps-2")}
          />
          <span aria-hidden className="text-fg-subtle">
            –
          </span>
          <input
            {...shared}
            aria-label={t("end")}
            aria-invalid={!!to.error || !!control["aria-invalid"] || undefined}
            placeholder={to.placeholder}
            value={to.text}
            onChange={(e) => to.setText(e.currentTarget.value)}
            onBlur={() => to.commit()}
            onKeyDown={(e) => e.key === "Enter" && to.commit()}
            className={field}
          />
          {errorMessage ? (
            <span id={errorId} className="sr-only">
              {errorMessage}
            </span>
          ) : null}
          <span className="flex shrink-0 items-center gap-0.5 pe-1">
            {clearable && value?.from && !inert ? (
              <button
                type="button"
                tabIndex={-1}
                aria-label={t("clear")}
                onClick={() => setValue(null)}
                className="inline-flex size-[calc(var(--control-h)-0.75rem)] items-center justify-center rounded-ui-sm text-fg-muted hover:bg-hover hover:text-fg [&_svg]:size-3.5"
              >
                <X aria-hidden />
              </button>
            ) : null}
            <PopoverTrigger asChild>
              <button
                ref={buttonRef}
                type="button"
                aria-label={t("openCalendar")}
                disabled={inert}
                className="inline-flex size-[calc(var(--control-h)-0.75rem)] items-center justify-center rounded-ui-sm text-fg-muted transition-colors hover:bg-hover hover:text-fg focus-ring disabled:opacity-40 [&_svg]:size-4"
              >
                <CalendarRange aria-hidden />
              </button>
            </PopoverTrigger>
          </span>
        </div>
      </PopoverAnchor>
      {content}
      {hidden}
    </Popover>
  );
}
