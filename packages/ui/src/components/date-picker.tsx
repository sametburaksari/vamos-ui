"use client";

import * as React from "react";
import { dateMatchModifiers, type DayPickerProps, type Matcher } from "react-day-picker";
import { CalendarDays, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useLocale } from "../lib/locale";
import { useLabels } from "../lib/labels";
import { useFieldContext, useFieldControl, FieldContextReset } from "../lib/field-context";
import { useControllableState, useEventCallback } from "../lib/use-controllable-state";
import { mergeIds } from "../lib/compose-refs";
import { controlVariants } from "../lib/variants";
import {
  datePlaceholder,
  dateToIso,
  formatDateInput,
  isoToDate,
  parseDateInput,
  todayIso,
  type IsoDateString,
} from "../lib/date";
import { CalendarGrid, toDayMatchers, type CalendarGridProps, type CalendarLabels, type DayMatcher } from "./calendar";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { TimePicker, type TimePickerLabels } from "./time-picker";

export {
  dateToIso,
  isoToDate,
  parseDateInput,
  formatDateInput,
  datePlaceholder,
  getDatePattern,
  getDateFnsLocale,
  registerDateLocale,
  todayIso,
  addIsoDays,
  isoDiffDays,
  rangeLength,
  isIsoDateString,
  parseTime,
  formatTimeValue,
  timeToMinutes,
  minutesToTime,
  compareTime,
  getHourCycle,
  timeSlots,
  defaultRangePresets,
  type IsoDateString,
  type IsoDateRange,
  type DateRangePreset,
  type DatePattern,
  type TimeParts,
} from "../lib/date";

const datePickerLabels = {
  openCalendar: "Open calendar",
  chooseDate: "Pick a date",
  clear: "Clear date",
  today: "Today",
  invalid: "Enter a valid date ({pattern})",
  beforeMin: "Choose {min} or later",
  afterMax: "Choose {max} or earlier",
  unavailable: "This date isn't available",
  dayToken: "DD",
  monthToken: "MM",
  yearToken: "YYYY",
  wordsToday: "today, now",
  wordsTomorrow: "tomorrow, tmrw",
  wordsYesterday: "yesterday",
  date: "Date",
  time: "Time",
  dialog: "Choose date",
};
export type DatePickerLabels = typeof datePickerLabels;

export type DateInputError = "invalid" | "beforeMin" | "afterMax" | "unavailable";

/** react-day-picker / CalendarGrid props a picker passes to its calendar. */
export type DatePickerCalendarProps = Partial<Pick<CalendarGridProps, "size" | "renderDayExtra" | "describeDay" | "dayTitle" | "labels">> &
  Omit<Partial<DayPickerProps>, "mode" | "selected" | "onSelect" | "labels" | "required">;

const words = (s: string) =>
  s
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);

/** Validates a parsed date against min / max / disabled matchers. */
export function checkDateValue(iso: IsoDateString, opts: { min?: IsoDateString; max?: IsoDateString; disabledDays?: DayMatcher | DayMatcher[] }): DateInputError | null {
  if (opts.min && iso < opts.min) return "beforeMin";
  if (opts.max && iso > opts.max) return "afterMax";
  const date = isoToDate(iso);
  if (!date) return "invalid";
  const extra = toDayMatchers({ disabledDays: opts.disabledDays });
  if (extra.length && dateMatchModifiers(date, extra as Matcher[])) return "unavailable";
  return null;
}

/**
 * Typed-date state shared by the pickers: the text in the box, parsing on commit (blur / Enter),
 * locale pattern + relative words, and the validation error.
 */
export function useDateInputText(options: {
  value: IsoDateString | null;
  onCommit: (value: IsoDateString | null) => void;
  min?: IsoDateString;
  max?: IsoDateString;
  disabledDays?: DayMatcher | DayMatcher[];
  labels?: Partial<DatePickerLabels>;
  onError?: (error: DateInputError | null, message: string) => void;
}) {
  const { value, onCommit, min, max, disabledDays, labels, onError } = options;
  const t = useLabels("datePicker", datePickerLabels, labels);
  const { locale, format } = useLocale();
  const [text, setText] = React.useState(() => formatDateInput(value, locale));
  const [error, setError] = React.useState<DateInputError | null>(null);
  const placeholder = datePlaceholder(locale, { day: t("dayToken"), month: t("monthToken"), year: t("yearToken") });
  const report = useEventCallback(onError);

  // Follow external value / locale changes.
  React.useEffect(() => {
    setText(formatDateInput(value, locale));
    setError(null);
  }, [value, locale]);

  const message = (e: DateInputError | null) =>
    e === "invalid"
      ? t("invalid", { pattern: placeholder })
      : e === "beforeMin"
        ? t("beforeMin", { min: format.date(min!, "medium") })
        : e === "afterMax"
          ? t("afterMax", { max: format.date(max!, "medium") })
          : e === "unavailable"
            ? t("unavailable")
            : "";

  const fail = (e: DateInputError | null) => {
    setError(e);
    report(e, message(e));
  };

  const commit = (raw = text) => {
    if (!raw.trim()) {
      fail(null);
      if (value !== null) onCommit(null);
      return null;
    }
    const iso = parseDateInput(raw, locale, { words: { today: words(t("wordsToday")), tomorrow: words(t("wordsTomorrow")), yesterday: words(t("wordsYesterday")) } });
    if (!iso) {
      fail("invalid");
      return undefined;
    }
    const problem = checkDateValue(iso, { min, max, disabledDays });
    if (problem) {
      fail(problem);
      return undefined;
    }
    fail(null);
    setText(formatDateInput(iso, locale));
    if (iso !== value) onCommit(iso);
    return iso;
  };

  return { text, setText, commit, error, errorMessage: message(error), placeholder, clearError: () => fail(null) };
}

/* ------------------------------------------------------------------ */
/* DatePicker                                                          */
/* ------------------------------------------------------------------ */

export interface DatePickerProps {
  /** `YYYY-MM-DD`, or `null` when empty. */
  value?: IsoDateString | null;
  defaultValue?: IsoDateString | null;
  onValueChange?: (value: IsoDateString | null) => void;
  /** `"input"` (default): a typeable field + calendar button. `"button"`: a trigger for filter bars. */
  trigger?: "input" | "button";
  /** Button trigger text style. Default `"long"` ("November 23, 2026"). */
  displayFormat?: "short" | "medium" | "long" | "full";
  /** Default: the locale pattern ("MM/DD/YYYY") for the input, "Pick a date" for the button. */
  placeholder?: string;
  /** Earliest date, `YYYY-MM-DD`. */
  min?: IsoDateString;
  /** Latest date, `YYYY-MM-DD`. */
  max?: IsoDateString;
  /** Days that cannot be picked: react-day-picker matchers or `YYYY-MM-DD` strings. */
  disabledDays?: DayMatcher | DayMatcher[];
  /** Show a clear button while there is a value. */
  clearable?: boolean;
  /** Show the Today shortcut in the popover footer. Default `true`. */
  showToday?: boolean;
  /** Hidden input name; submits `YYYY-MM-DD`. */
  name?: string;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Popover alignment. Default `"start"`. */
  align?: "start" | "center" | "end";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called after a typed entry is checked; `null` once it is valid again. Use it for a Field error. */
  onInputError?: (error: DateInputError | null, message: string) => void;
  /** Extra calendar props (`captionLayout="dropdown"`, `startMonth`, `showWeekNumber`…). */
  calendarProps?: DatePickerCalendarProps;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  labels?: Partial<DatePickerLabels>;
  calendarLabels?: Partial<CalendarLabels>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
}

const iconButton =
  "inline-flex size-[calc(var(--control-h)-0.75rem)] shrink-0 items-center justify-center rounded-ui-sm text-fg-muted transition-colors hover:bg-hover hover:text-fg focus-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4";

/**
 * Single date in a field with a popover calendar. Type in the locale's pattern (`11/23/2026`,
 * `23.11.2026`), digits only, a partial date (this year) or "tomorrow" — or pick from the calendar.
 * The value is a `YYYY-MM-DD` string; it never goes through UTC.
 *
 * ```tsx
 * <Field label="Due date"><DatePicker value={due} onValueChange={setDue} min={todayIso()} /></Field>
 * <DatePicker trigger="button" placeholder="Any date" clearable />
 * ```
 */
export const DatePicker = React.forwardRef<HTMLInputElement | HTMLButtonElement, DatePickerProps>(function DatePicker(rawProps, forwardedRef) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    trigger = "input",
    displayFormat = "long",
    placeholder,
    min,
    max,
    disabledDays,
    clearable,
    showToday = true,
    name,
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
    calendarLabels,
    onBlur,
    ...rest
  } = rawProps;
  const control = useFieldControl({ ...rest, "aria-invalid": invalid ? true : undefined });
  const t = useLabels("datePicker", datePickerLabels, labels);
  const { locale, format, timeZone } = useLocale();
  const [value, setValue] = useControllableState<IsoDateString | null>({ value: valueProp, defaultValue: defaultValue ?? null, onChange: onValueChange, name: "DatePicker" });
  const [open, setOpen] = useControllableState<boolean>({ value: openProp, defaultValue: defaultOpen ?? false, onChange: onOpenChange, name: "DatePicker" });
  const inputRef = React.useRef<HTMLInputElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const errorId = React.useId();
  const inert = control.disabled || control.readOnly;
  const today = todayIso(timeZone === "UTC" ? undefined : timeZone);

  const typed = useDateInputText({ value, onCommit: setValue, min, max, disabledDays, labels, onError: onInputError });
  const [month, setMonth] = React.useState<Date>(() => isoToDate(value) ?? isoToDate(today)!);
  React.useEffect(() => {
    if (open) setMonth(isoToDate(value) ?? isoToDate(today)!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const matchers = React.useMemo(() => toDayMatchers({ min, max, disabledDays }), [min, max, disabledDays]);
  const todayDisabled = checkDateValue(today, { min, max, disabledDays }) !== null;
  const invalidNow = control["aria-invalid"] === true || typed.error !== null;

  const choose = (iso: IsoDateString | null) => {
    setValue(iso);
    typed.clearError();
    setOpen(false);
  };

  const footer =
    showToday || clearable ? (
      <div className="-mx-1 flex items-center justify-between gap-2 border-t border-line px-1 pt-2.5">
        {showToday ? (
          <Button size="xs" variant="ghost" disabled={todayDisabled} onClick={() => choose(today)}>
            {t("today")}
          </Button>
        ) : (
          <span />
        )}
        {clearable && value ? (
          <Button size="xs" variant="ghost" onClick={() => choose(null)}>
            {t("clear")}
          </Button>
        ) : null}
      </div>
    ) : undefined;

  const content = (
    <PopoverContent
      size="auto"
      align={align}
      aria-label={t("dialog")}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onCloseAutoFocus={(e) => {
        if (trigger === "input") {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }}
    >
      <FieldContextReset>
        <CalendarGrid
          autoFocus
          {...calendarProps}
          labels={calendarLabels}
          mode="single"
          selected={isoToDate(value) ?? undefined}
          onSelect={(d?: Date) => choose(d ? dateToIso(d) : value)}
          month={month}
          onMonthChange={setMonth}
          disabled={matchers}
          startMonth={calendarProps?.startMonth ?? (isoToDate(min) ?? undefined)}
          endMonth={calendarProps?.endMonth ?? (isoToDate(max) ?? undefined)}
          footer={footer}
        />
      </FieldContextReset>
    </PopoverContent>
  );

  const hidden = name ? <input type="hidden" name={name} value={value ?? ""} /> : null;

  if (trigger === "button") {
    const label = value ? format.date(value, displayFormat) : (placeholder ?? t("chooseDate"));
    return (
      <Popover open={open} onOpenChange={(o) => !inert && setOpen(o)}>
        <PopoverTrigger asChild>
          <button
            ref={(el) => {
              buttonRef.current = el;
              if (typeof forwardedRef === "function") forwardedRef(el);
              else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = el;
            }}
            type="button"
            id={control.id}
            disabled={control.disabled}
            // The visible date stays part of the accessible name: a Field label is joined with the
            // button's own text, and an aria-label becomes a visually hidden prefix.
            aria-labelledby={control["aria-labelledby"] ? mergeIds(control["aria-labelledby"], control.id) : undefined}
            aria-describedby={control["aria-describedby"]}
            aria-invalid={invalidNow || undefined}
            // No aria-required: not allowed on a button (axe aria-allowed-attr). The Field marks the label.
            data-slot="date-picker"
            data-readonly={control.readOnly ? "" : undefined}
            data-placeholder={value ? undefined : ""}
            onBlur={onBlur}
            className={cn(controlVariants({ size }), "w-auto cursor-default justify-start text-start focus-ring", className)}
          >
            <CalendarDays aria-hidden className="text-fg-subtle" />
            {control["aria-label"] && !control["aria-labelledby"] ? <span className="sr-only">{control["aria-label"]}, </span> : null}
            <span className={cn("truncate", !value && "text-fg-subtle")}>{label}</span>
          </button>
        </PopoverTrigger>
        {content}
        {hidden}
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={(o) => !inert && setOpen(o)}>
      <PopoverAnchor asChild>
        <div
          data-slot="date-picker"
          data-readonly={control.readOnly ? "" : undefined}
          className={cn(controlVariants({ size }), "cursor-text gap-0 px-0", className)}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault();
              inputRef.current?.focus();
            }
          }}
        >
          <input
            ref={(el) => {
              inputRef.current = el;
              if (typeof forwardedRef === "function") forwardedRef(el);
              else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = el;
            }}
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            id={control.id}
            disabled={control.disabled}
            readOnly={control.readOnly}
            required={control.required}
            aria-label={control["aria-label"]}
            aria-labelledby={control["aria-labelledby"]}
            aria-describedby={mergeIds(control["aria-describedby"], typed.error ? errorId : undefined)}
            aria-invalid={invalidNow || undefined}
            placeholder={placeholder ?? typed.placeholder}
            value={typed.text}
            onChange={(e) => typed.setText(e.currentTarget.value)}
            onBlur={(e) => {
              typed.commit();
              onBlur?.(e);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const r = typed.commit();
                if (r === undefined) e.preventDefault();
              } else if (e.key === "ArrowDown" && (e.altKey || e.metaKey) && !inert) {
                e.preventDefault();
                typed.commit();
                setOpen(true);
              }
            }}
            className="h-full min-w-0 flex-1 bg-transparent px-3 font-[inherit] text-[length:inherit] text-fg tabular outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed"
          />
          {typed.error ? (
            <span id={errorId} className="sr-only">
              {typed.errorMessage}
            </span>
          ) : null}
          <span className="flex shrink-0 items-center gap-0.5 pe-1">
            {clearable && value && !inert ? (
              <button type="button" tabIndex={-1} aria-label={t("clear")} className={iconButton} onClick={() => choose(null)}>
                <X aria-hidden className="size-3.5!" />
              </button>
            ) : null}
            <PopoverTrigger asChild>
              <button
                ref={buttonRef}
                type="button"
                aria-label={t("openCalendar")}
                disabled={inert}
                className={iconButton}
                onClick={() => typed.commit()}
              >
                <CalendarDays aria-hidden />
              </button>
            </PopoverTrigger>
          </span>
        </div>
      </PopoverAnchor>
      {content}
      {hidden}
    </Popover>
  );
});

/* ------------------------------------------------------------------ */
/* DateTimePicker                                                      */
/* ------------------------------------------------------------------ */

export interface DateTimePickerProps extends Omit<DatePickerProps, "value" | "defaultValue" | "onValueChange" | "trigger" | "name"> {
  /** Local wall-clock `"YYYY-MM-DDTHH:mm"`, or `null`. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Time used when only the date has been picked. Default `"09:00"`; `null` waits for a time. */
  defaultTime?: string | null;
  /** Minutes between time slots. Default 15. */
  step?: number;
  hourCycle?: 12 | 24;
  /** Earliest / latest time of day (`"HH:mm"`). */
  minTime?: string;
  maxTime?: string;
  /** Time zone shown after the inputs, e.g. `"Europe/Istanbul"` → "GMT+3". */
  timeZone?: string;
  /** Hidden input name; submits `"YYYY-MM-DDTHH:mm"`. */
  name?: string;
  timeLabels?: Partial<TimePickerLabels>;
}

function zoneLabel(timeZone: string, locale: string): string {
  try {
    const parts = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: "shortOffset" }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

/**
 * Date + time for scheduling (publish at, appointment, reminder). The value is a local
 * wall-clock `"YYYY-MM-DDTHH:mm"`; convert it with the shown `timeZone` on the server.
 *
 * ```tsx
 * <DateTimePicker value={publishAt} onValueChange={setPublishAt} timeZone="Europe/Istanbul" />
 * ```
 */
export const DateTimePicker = React.forwardRef<HTMLDivElement, DateTimePickerProps>(function DateTimePicker(
  { value: valueProp, defaultValue, onValueChange, defaultTime = "09:00", step = 15, hourCycle, minTime, maxTime, timeZone, name, timeLabels, labels, className, size = "md", ...dateProps },
  ref,
) {
  const t = useLabels("datePicker", datePickerLabels, labels);
  const { locale } = useLocale();
  const field = useFieldContext();
  const [value, setValue] = useControllableState<string | null>({ value: valueProp, defaultValue: defaultValue ?? null, onChange: onValueChange, name: "DateTimePicker" });
  const [date, setDate] = React.useState<IsoDateString | null>(() => value?.slice(0, 10) ?? null);
  const [time, setTime] = React.useState<string | null>(() => value?.slice(11, 16) ?? null);
  React.useEffect(() => {
    if (value) {
      setDate(value.slice(0, 10));
      setTime(value.slice(11, 16));
    } else if (valueProp === null) {
      setDate(null);
      setTime(null);
    }
  }, [value, valueProp]);
  const emit = (d: IsoDateString | null, tm: string | null) => {
    setValue(d && tm ? `${d}T${tm}` : null);
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={field?.labelId}
      data-slot="date-time-picker"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      <FieldContextReset>
        <DatePicker
          {...dateProps}
          size={size}
          labels={labels}
          aria-label={t("date")}
          aria-describedby={field?.describedBy}
          invalid={dateProps.invalid ?? field?.invalid}
          disabled={dateProps.disabled ?? field?.disabled}
          readOnly={dateProps.readOnly ?? field?.readOnly}
          className="w-auto min-w-0 flex-[1.4] basis-40"
          value={date}
          onValueChange={(d) => {
            setDate(d);
            const tm = time ?? (d ? defaultTime : null);
            if (tm !== time) setTime(tm);
            emit(d, tm);
          }}
        />
        <TimePicker
          size={size}
          labels={timeLabels}
          aria-label={t("time")}
          slots
          step={step}
          hourCycle={hourCycle}
          min={minTime}
          max={maxTime}
          disabled={dateProps.disabled ?? field?.disabled}
          readOnly={dateProps.readOnly ?? field?.readOnly}
          className="w-auto min-w-0 flex-1 basis-32"
          value={time}
          onValueChange={(tm) => {
            setTime(tm);
            emit(date, tm);
          }}
        />
      </FieldContextReset>
      {timeZone ? (
        <span className="shrink-0 rounded-ui-sm bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-fg-muted" title={timeZone}>
          {zoneLabel(timeZone, locale)}
        </span>
      ) : null}
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
    </div>
  );
});
