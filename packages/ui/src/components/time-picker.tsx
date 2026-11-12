"use client";

import * as React from "react";
import { ChevronDown, Clock } from "lucide-react";
import { cn } from "../lib/cn";
import { useLocale } from "../lib/locale";
import { useLabels } from "../lib/labels";
import { useFieldContext, useFieldControl, FieldContextReset } from "../lib/field-context";
import { useControllableState } from "../lib/use-controllable-state";
import { controlVariants, itemVariants } from "../lib/variants";
import {
  compareTime,
  dayPeriodFirst,
  formatTimeValue,
  getDayPeriodLabels,
  getHourCycle,
  getTimeSeparator,
  minutesToTime,
  parseTime,
  timeSlots,
  timeToMinutes,
} from "../lib/date";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";

const timePickerLabels = {
  hour: "Hour",
  minute: "Minute",
  second: "Second",
  dayPeriod: "AM/PM",
  time: "Time",
  showTimes: "Show times",
  times: "Times",
  start: "Start time",
  end: "End time",
  to: "to",
  durationHours: "{count} h",
  durationMinutes: "{count} min",
  nextDay: "+1 day",
  empty: "No time",
};
export type TimePickerLabels = typeof timePickerLabels;

type Segment = "hour" | "minute" | "second" | "dayPeriod";
interface Segments {
  hour: number | null; // 0–23
  minute: number | null;
  second: number | null;
  pm: boolean | null;
}

const EMPTY: Segments = { hour: null, minute: null, second: null, pm: null };

function fromValue(value: string | null | undefined): Segments {
  const p = parseTime(value);
  return p ? { hour: p.hour, minute: p.minute, second: p.second, pm: p.hour >= 12 } : EMPTY;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------ */
/* TimeInput                                                           */
/* ------------------------------------------------------------------ */

export interface TimeInputProps {
  /** `"HH:mm"` (or `"HH:mm:ss"` with `seconds`), 24h, whatever the display. `null` = empty. */
  value?: string | null;
  defaultValue?: string | null;
  /** Called with a complete time, or `null` when the input is emptied or left incomplete. */
  onValueChange?: (value: string | null) => void;
  /** Display hour cycle. Default from the locale (en-US 12, tr 24). */
  hourCycle?: 12 | 24;
  /** Minutes per ArrowUp / ArrowDown on the minute segment. Default 1. */
  step?: number;
  /** Show a seconds segment. */
  seconds?: boolean;
  /** Earliest allowed time (`"HH:mm"`). Out of range marks the input invalid. */
  min?: string;
  /** Latest allowed time (`"HH:mm"`). */
  max?: string;
  /** Return `true` for times that are not allowed. */
  disabledTimes?: (time: string) => boolean;
  /** Hidden input name (submits `"HH:mm"`). */
  name?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost";
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Leading icon. Default a clock; `null` hides it. */
  icon?: React.ReactNode;
  /** Content at the end of the box (TimePicker puts its slot button here). */
  trailing?: React.ReactNode;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  labels?: Partial<TimePickerLabels>;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
}

/** True when a time breaks `min` / `max` / `disabledTimes`. */
export function isTimeOutOfRange(value: string | null | undefined, opts: { min?: string; max?: string; disabledTimes?: (t: string) => boolean }): boolean {
  if (!value) return false;
  if (opts.min && compareTime(value, opts.min) < 0) return true;
  if (opts.max && compareTime(value, opts.max) > 0) return true;
  return !!opts.disabledTimes?.(value);
}

/**
 * Segmented time entry: each part is an ARIA spinbutton. ↑/↓ change the value, digits type
 * ahead and auto-advance, ←/→ move between parts, Backspace clears. Segment order, separator
 * and AM/PM come from `Intl`; the value is always `"HH:mm"` 24h.
 *
 * ```tsx
 * <Field label="Start"><TimeInput value={time} onValueChange={setTime} /></Field>
 * ```
 */
export const TimeInput = /*#__PURE__*/ React.forwardRef<HTMLDivElement, TimeInputProps>(function TimeInput(rawProps, ref) {
  const field = useFieldContext();
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    hourCycle: hourCycleProp,
    step = 1,
    seconds = false,
    min,
    max,
    disabledTimes,
    name,
    size = "md",
    variant = "default",
    invalid,
    icon,
    trailing,
    className,
    labels,
    onBlur,
    ...rest
  } = rawProps;
  const props = useFieldControl({ ...rest, name, "aria-invalid": invalid ? true : rest["aria-invalid"] });
  const t = useLabels("timePicker", timePickerLabels, labels);
  const { locale } = useLocale();
  const hc = hourCycleProp ?? getHourCycle(locale);
  const [amLabel, pmLabel] = React.useMemo(() => getDayPeriodLabels(locale), [locale]);
  const sep = React.useMemo(() => getTimeSeparator(locale), [locale]);
  const periodFirst = React.useMemo(() => hc === 12 && dayPeriodFirst(locale), [hc, locale]);

  const [value, setValue] = useControllableState<string | null>({ value: valueProp, defaultValue: defaultValue ?? null, onChange: onValueChange, name: "TimeInput" });
  const [segs, setSegs] = React.useState<Segments>(() => fromValue(value));
  const lastValue = React.useRef(value);
  // External value changes (controlled) reset the segments.
  React.useEffect(() => {
    if (value !== lastValue.current) {
      lastValue.current = value;
      setSegs(fromValue(value));
    }
  }, [value]);

  const order = React.useMemo<Segment[]>(() => {
    const base: Segment[] = seconds ? ["hour", "minute", "second"] : ["hour", "minute"];
    if (hc !== 12) return base;
    return periodFirst ? ["dayPeriod", ...base] : [...base, "dayPeriod"];
  }, [seconds, hc, periodFirst]);

  const refs = React.useRef<Partial<Record<Segment, HTMLSpanElement | null>>>({});
  const buffer = React.useRef("");
  const inert = props.disabled || props.readOnly;

  const commit = (next: Segments) => {
    setSegs(next);
    const complete = next.hour !== null && next.minute !== null && (!seconds || next.second !== null) && (hc !== 12 || next.pm !== null);
    const empty = next.hour === null && next.minute === null && (!seconds || next.second === null);
    let out: string | null = null;
    if (complete) out = formatTimeValue({ hour: next.hour!, minute: next.minute!, second: next.second ?? 0 }, seconds);
    if (complete || empty || value !== null) {
      lastValue.current = out;
      setValue(out);
    }
  };

  const focusSeg = (seg: Segment | undefined) => {
    if (seg) refs.current[seg]?.focus();
  };
  const move = (seg: Segment, delta: number) => {
    const i = order.indexOf(seg) + delta;
    focusSeg(order[i]);
  };

  // 12h display helpers
  const displayHour = (h: number) => (hc === 12 ? h % 12 || 12 : h);
  const toInternalHour = (shown: number, pm: boolean | null) => (hc === 12 ? (shown % 12) + (pm ? 12 : 0) : shown);

  const now = () => new Date();
  const setSeg = (seg: Segment, v: number | boolean | null) => {
    const next = { ...segs };
    if (seg === "dayPeriod") {
      next.pm = v as boolean | null;
      if (next.hour !== null && v !== null) next.hour = (next.hour % 12) + (v ? 12 : 0);
    } else if (seg === "hour") {
      next.hour = v as number | null;
      if (next.hour !== null && hc === 12 && next.pm === null) next.pm = next.hour >= 12;
    } else next[seg] = v as number | null;
    commit(next);
  };

  const spin = (seg: Segment, dir: 1 | -1) => {
    if (seg === "dayPeriod") return setSeg("dayPeriod", segs.pm === null ? dir === 1 ? false : true : !segs.pm);
    if (seg === "hour") {
      const cur = segs.hour ?? (dir === 1 ? (hc === 12 && segs.pm ? 11 : -1) : now().getHours() + 1);
      let next = (cur + dir + 24) % 24;
      // In 12h display keep the period fixed while spinning the hour.
      if (hc === 12 && segs.pm !== null) next = (next % 12) + (segs.pm ? 12 : 0);
      return setSeg("hour", next);
    }
    const unit = seg === "minute" ? step : 1;
    const cur = segs[seg];
    let next: number;
    if (cur === null) next = 0;
    else if (dir === 1) next = (Math.floor(cur / unit) + 1) * unit;
    else next = (Math.ceil(cur / unit) - 1) * unit;
    next = ((next % 60) + 60) % 60;
    setSeg(seg, next);
  };

  const typeDigit = (seg: Segment, d: number) => {
    if (seg === "dayPeriod") return;
    const buf = buffer.current + String(d);
    const n = Number(buf);
    if (seg === "hour") {
      const maxShown = hc === 12 ? 12 : 23;
      const firstMax = hc === 12 ? 1 : 2;
      if (buf.length === 1) {
        if (d > firstMax) {
          buffer.current = "";
          setSeg("hour", toInternalHour(hc === 12 && d === 0 ? 12 : d, segs.pm));
          return move("hour", 1);
        }
        buffer.current = buf;
        if (hc === 12 && d === 0) return; // waiting for "0x"
        return setSeg("hour", toInternalHour(d, segs.pm));
      }
      buffer.current = "";
      const shown = n > maxShown || (hc === 12 && n === 0) ? d : n;
      setSeg("hour", toInternalHour(shown === 0 && hc === 12 ? 12 : shown, segs.pm));
      return move("hour", 1);
    }
    // minute / second
    if (buf.length === 1) {
      if (d > 5) {
        buffer.current = "";
        setSeg(seg, d);
        return move(seg, 1);
      }
      buffer.current = buf;
      return setSeg(seg, d);
    }
    buffer.current = "";
    setSeg(seg, n > 59 ? d : n);
    move(seg, 1);
  };

  const onSegKeyDown = (seg: Segment) => (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (inert) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        move(seg, e.key === "ArrowLeft" ? -1 : 1);
      }
      return;
    }
    const key = e.key;
    if (key === "ArrowUp" || key === "ArrowDown") {
      e.preventDefault();
      buffer.current = "";
      return spin(seg, key === "ArrowUp" ? 1 : -1);
    }
    if (key === "ArrowLeft" || key === "ArrowRight") {
      e.preventDefault();
      buffer.current = "";
      return move(seg, key === "ArrowLeft" ? -1 : 1);
    }
    if (key === "Home" || key === "End") {
      e.preventDefault();
      buffer.current = "";
      if (seg === "dayPeriod") return setSeg(seg, key === "End");
      if (seg === "hour") return setSeg(seg, hc === 12 ? (key === "Home" ? 0 : 11) + (segs.pm ? 12 : 0) : key === "Home" ? 0 : 23);
      return setSeg(seg, key === "Home" ? 0 : 59);
    }
    if (key === "Backspace" || key === "Delete") {
      e.preventDefault();
      const cur = seg === "dayPeriod" ? segs.pm : segs[seg];
      buffer.current = "";
      if (cur === null && key === "Backspace") return move(seg, -1);
      return setSeg(seg, null);
    }
    if (/^\d$/.test(key)) {
      e.preventDefault();
      return typeDigit(seg, Number(key));
    }
    if (seg === "dayPeriod" && key.length === 1) {
      const k = key.toLocaleLowerCase(locale);
      if (amLabel.toLocaleLowerCase(locale).startsWith(k) || k === "a") {
        e.preventDefault();
        return setSeg(seg, false);
      }
      if (pmLabel.toLocaleLowerCase(locale).startsWith(k) || k === "p") {
        e.preventDefault();
        return setSeg(seg, true);
      }
    }
    if (key === sep || key === ":" || key === ".") {
      e.preventDefault();
      buffer.current = "";
      return move(seg, 1);
    }
    // Block any other printable key from editing the content.
    if (key.length === 1 && !e.metaKey && !e.ctrlKey) e.preventDefault();
  };

  // Soft keyboards send beforeinput instead of keydown digits.
  const onBeforeInput = (seg: Segment) => (e: React.FormEvent<HTMLSpanElement>) => {
    e.preventDefault();
    if (inert) return;
    const data = (e.nativeEvent as InputEvent).data ?? "";
    for (const ch of data) if (/\d/.test(ch)) typeDigit(seg, Number(ch));
  };

  const current = value;
  const outOfRange = isTimeOutOfRange(current, { min, max, disabledTimes });
  const isInvalid = props["aria-invalid"] === true || props["aria-invalid"] === "true" || outOfRange;

  const segInfo = (seg: Segment) => {
    if (seg === "dayPeriod") {
      const v = segs.pm;
      return { text: v === null ? "––" : v ? pmLabel : amLabel, now: v === null ? undefined : v ? 1 : 0, min: 0, max: 1, valueText: v === null ? t("empty") : v ? pmLabel : amLabel, label: t("dayPeriod") };
    }
    const v = segs[seg];
    const shown = seg === "hour" && v !== null ? displayHour(v) : v;
    const minV = seg === "hour" ? (hc === 12 ? 1 : 0) : 0;
    const maxV = seg === "hour" ? (hc === 12 ? 12 : 23) : 59;
    return { text: shown === null ? "––" : pad2(shown), now: shown ?? undefined, min: minV, max: maxV, valueText: shown === null ? t("empty") : String(shown), label: t(seg) };
  };

  const ariaLabelledBy = props["aria-labelledby"] ?? field?.labelId;
  const groupLabel = props["aria-label"] ?? (ariaLabelledBy ? undefined : t("time"));
  const focusFirst = () => {
    const firstEmpty = order.find((s) => (s === "dayPeriod" ? segs.pm : segs[s]) === null);
    focusSeg(firstEmpty ?? order[0]);
  };

  return (
    <div
      ref={ref}
      data-slot="time-input"
      data-readonly={props.readOnly ? "" : undefined}
      aria-disabled={props.disabled || undefined}
      className={cn(controlVariants({ size, variant }), "cursor-text gap-0 px-0", className)}
      onPointerDown={(e) => {
        if (inert) return;
        if ((e.target as HTMLElement).closest("[role=spinbutton],button")) return;
        e.preventDefault();
        focusFirst();
      }}
    >
      {icon !== null ? <span className="pointer-events-none flex shrink-0 items-center ps-3 text-fg-subtle">{icon ?? <Clock aria-hidden />}</span> : null}
      <div
        role="group"
        id={props.id}
        aria-label={groupLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={props["aria-describedby"]}
        aria-invalid={isInvalid || undefined}
        // No aria-required: not allowed on role="group" (axe aria-allowed-attr). The segments' Field marks the label.
        aria-disabled={props.disabled || undefined}
        dir="ltr"
        className={cn("flex h-full min-w-0 flex-1 items-center px-2.5 font-mono text-[length:inherit] tabular", icon !== null && "ps-2")}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            buffer.current = "";
            onBlur?.(e as unknown as React.FocusEvent<HTMLDivElement>);
          }
        }}
      >
        {order.map((seg, i) => {
          const info = segInfo(seg);
          const empty = info.now === undefined;
          return (
            <React.Fragment key={seg}>
              {i > 0 ? (
                <span aria-hidden className={cn("select-none text-fg-subtle", seg === "dayPeriod" || order[i - 1] === "dayPeriod" ? "w-1.5" : "px-px")}>
                  {seg === "dayPeriod" || order[i - 1] === "dayPeriod" ? "" : sep}
                </span>
              ) : null}
              <span
                ref={(el) => {
                  refs.current[seg] = el;
                }}
                role="spinbutton"
                tabIndex={props.disabled ? -1 : 0}
                aria-label={info.label}
                aria-valuenow={info.now}
                aria-valuemin={info.min}
                aria-valuemax={info.max}
                aria-valuetext={info.valueText}
                aria-readonly={props.readOnly || undefined}
                aria-disabled={props.disabled || undefined}
                contentEditable={!inert}
                suppressContentEditableWarning
                inputMode="numeric"
                spellCheck={false}
                autoCorrect="off"
                data-segment={seg}
                data-placeholder={empty ? "" : undefined}
                onKeyDown={onSegKeyDown(seg)}
                onBeforeInput={onBeforeInput(seg)}
                onPaste={(e) => {
                  e.preventDefault();
                  if (inert) return;
                  const p = parseTime(e.clipboardData.getData("text"));
                  if (p) commit({ hour: p.hour, minute: p.minute, second: p.second, pm: p.hour >= 12 });
                }}
                onFocus={() => {
                  buffer.current = "";
                }}
                className={cn(
                  "rounded-ui-sm px-[3px] py-0.5 text-center leading-none caret-transparent outline-none transition-colors",
                  seg === "dayPeriod" ? "min-w-[2.6ch] font-sans text-[0.92em] font-medium" : "min-w-[2.4ch]",
                  empty ? "text-fg-subtle" : "text-fg",
                  !props.disabled && "focus:bg-accent-soft focus:text-accent-ink",
                )}
              >
                {info.text}
              </span>
            </React.Fragment>
          );
        })}
      </div>
      {trailing ? <span className="flex shrink-0 items-center pe-1">{trailing}</span> : null}
      {name ? <input type="hidden" name={name} value={current ?? ""} /> : null}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* TimePicker (input + slot list)                                      */
/* ------------------------------------------------------------------ */

export interface TimePickerProps extends TimeInputProps {
  /** Show a slot list popover (every `step` minutes). Default `false`. */
  slots?: boolean;
  /** Minutes between slots and per arrow press. Default 15. */
  step?: number;
  /** First and last slot of the list. Default `min`/`max`, else the whole day. */
  slotRange?: { start: string; end: string };
  /** Popover open state (controlled). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Time of day: a segmented input with an optional list of slots every `step` minutes.
 * The value is `"HH:mm"` 24h; the display follows the locale (en-US 2:30 PM, tr 14:30).
 *
 * ```tsx
 * <TimePicker value={time} onValueChange={setTime} slots step={30} min="09:00" max="18:00" />
 * ```
 */
export const TimePicker = /*#__PURE__*/ React.forwardRef<HTMLDivElement, TimePickerProps>(function TimePicker(
  { slots = false, step = 15, slotRange, open: openProp, onOpenChange, value: valueProp, defaultValue, onValueChange, labels, ...props },
  ref,
) {
  const t = useLabels("timePicker", timePickerLabels, labels);
  const { locale } = useLocale();
  const [value, setValue] = useControllableState<string | null>({ value: valueProp, defaultValue: defaultValue ?? null, onChange: onValueChange, name: "TimePicker" });
  const [open, setOpen] = useControllableState<boolean>({ value: openProp, defaultValue: false, onChange: onOpenChange, name: "TimePicker" });
  const listRef = React.useRef<HTMLDivElement>(null);
  const listId = React.useId();
  const hc = props.hourCycle ?? getHourCycle(locale);
  const fmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone: "UTC", hourCycle: hc === 12 ? "h12" : "h23" }), [locale, hc]);
  const show = (v: string) => {
    const p = parseTime(v)!;
    return fmt.format(new Date(Date.UTC(1970, 0, 1, p.hour, p.minute)));
  };

  const list = React.useMemo(() => {
    const start = slotRange?.start ?? props.min ?? "00:00";
    const end = slotRange?.end ?? (props.max ? minutesToTime(timeToMinutes(props.max) + 1) : "24:00");
    return timeSlots(step, start, end === "00:00" ? "24:00" : end);
  }, [slotRange, props.min, props.max, step]);

  const pick = (v: string) => {
    setValue(v);
    setOpen(false);
  };

  const onListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const opts = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])') ?? []);
    const cur = opts.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (e.key === "ArrowDown") next = Math.min(opts.length - 1, cur + 1);
    else if (e.key === "ArrowUp") next = Math.max(0, cur - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = opts.length - 1;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const v = (document.activeElement as HTMLElement | null)?.dataset.value;
      if (v) pick(v);
      return;
    } else return;
    e.preventDefault();
    opts[next]?.focus();
  };

  if (!slots) return <TimeInput ref={ref} value={value} onValueChange={setValue} labels={labels} step={step} {...props} />;

  const inert = props.disabled || props.readOnly;
  const active = value && list.includes(value) ? value : list.find((s) => value && compareTime(s, value) >= 0) ?? list[0];

  return (
    <Popover open={open} onOpenChange={(o) => !inert && setOpen(o)}>
      <PopoverAnchor asChild>
        <TimeInput
          ref={ref}
          value={value}
          onValueChange={setValue}
          labels={labels}
          step={step}
          {...props}
          trailing={
            <PopoverTrigger asChild disabled={inert}>
              <button
                type="button"
                aria-label={t("showTimes")}
                aria-haspopup="listbox"
                className="inline-flex size-[calc(var(--control-h)-0.75rem)] items-center justify-center rounded-ui-sm text-fg-muted transition-colors hover:bg-hover hover:text-fg focus-ring disabled:opacity-40 [&_svg]:size-4"
              >
                <ChevronDown aria-hidden />
              </button>
            </PopoverTrigger>
          }
        />
      </PopoverAnchor>
      <PopoverContent
        size="auto"
        padded={false}
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-36 max-w-56"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-value="${active}"]`)?.focus());
        }}
      >
        <FieldContextReset>
          <div
            ref={(el) => {
              listRef.current = el;
              el?.querySelector<HTMLElement>(`[data-value="${active}"]`)?.scrollIntoView({ block: "center" });
            }}
            id={listId}
            role="listbox"
            aria-label={t("times")}
            onKeyDown={onListKeyDown}
            className="grid max-h-64 gap-px overflow-y-auto overscroll-contain p-1"
          >
            {list.map((s) => {
              const disabled = isTimeOutOfRange(s, props);
              const selected = s === value;
              return (
                <div
                  key={s}
                  role="option"
                  tabIndex={-1}
                  aria-selected={selected}
                  aria-disabled={disabled || undefined}
                  data-value={s}
                  data-state={selected ? "checked" : undefined}
                  onClick={() => !disabled && pick(s)}
                  className={cn(itemVariants({ size: "sm" }), "justify-between font-mono tabular aria-selected:bg-accent-soft aria-selected:text-accent-ink focus:bg-hover")}
                >
                  {show(s)}
                </div>
              );
            })}
          </div>
        </FieldContextReset>
      </PopoverContent>
    </Popover>
  );
});

/* ------------------------------------------------------------------ */
/* TimeRangePicker                                                     */
/* ------------------------------------------------------------------ */

export interface TimeRange {
  start: string | null;
  end: string | null;
}

export interface TimeRangePickerProps extends Omit<TimeInputProps, "value" | "defaultValue" | "onValueChange" | "name" | "trailing" | "icon"> {
  value?: TimeRange;
  defaultValue?: TimeRange;
  onValueChange?: (value: TimeRange) => void;
  /** Allow an end before the start (night shift, ends the next day). Default `false`. */
  overnight?: boolean;
  /** Show the duration after the inputs. Default `true`. */
  showDuration?: boolean;
  nameStart?: string;
  nameEnd?: string;
}

/** Minutes between two times; with `overnight` an earlier end counts as the next day. */
export function timeRangeMinutes(range: TimeRange, overnight = false): number | null {
  if (!range.start || !range.end) return null;
  let d = timeToMinutes(range.end) - timeToMinutes(range.start);
  if (d <= 0 && overnight) d += 1440;
  return d;
}

/**
 * Start and end time with a duration hint (shift start/end, opening hours). The end must be after
 * the start unless `overnight` is set.
 */
export const TimeRangePicker = /*#__PURE__*/ React.forwardRef<HTMLDivElement, TimeRangePickerProps>(function TimeRangePicker(
  { value: valueProp, defaultValue, onValueChange, overnight = false, showDuration = true, nameStart, nameEnd, labels, className, size = "md", ...props },
  ref,
) {
  const t = useLabels("timePicker", timePickerLabels, labels);
  const [value, setValue] = useControllableState<TimeRange>({ value: valueProp, defaultValue: defaultValue ?? { start: null, end: null }, onChange: onValueChange, name: "TimeRangePicker" });
  const minutes = timeRangeMinutes(value, overnight);
  const reversed = minutes !== null && minutes <= 0;
  const crosses = overnight && value.start && value.end && timeToMinutes(value.end) <= timeToMinutes(value.start);
  const durationId = React.useId();
  const field = useFieldContext();
  const groupProps = useFieldControl({ ...props });
  const h = minutes !== null && minutes > 0 ? Math.floor(minutes / 60) : 0;
  const m = minutes !== null && minutes > 0 ? minutes % 60 : 0;
  const duration = minutes !== null && minutes > 0 ? [h ? t("durationHours", { count: h }) : "", m ? t("durationMinutes", { count: m }) : ""].filter(Boolean).join(" ") : "";

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={groupProps["aria-labelledby"] ?? field?.labelId}
      aria-label={groupProps["aria-label"]}
      data-slot="time-range-picker"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      <FieldContextReset>
        <TimeInput
          {...props}
          size={size}
          className="w-auto min-w-0 flex-1 basis-32"
          aria-label={t("start")}
          aria-describedby={showDuration ? durationId : undefined}
          disabled={groupProps.disabled}
          readOnly={groupProps.readOnly}
          invalid={!!groupProps["aria-invalid"]}
          value={value.start}
          onValueChange={(start) => setValue((v) => ({ ...v, start }))}
          name={nameStart}
          labels={labels}
        />
        <span aria-hidden className="text-sm text-fg-subtle">
          –
        </span>
        <TimeInput
          {...props}
          size={size}
          className="w-auto min-w-0 flex-1 basis-32"
          aria-label={t("end")}
          aria-describedby={showDuration ? durationId : undefined}
          disabled={groupProps.disabled}
          readOnly={groupProps.readOnly}
          invalid={reversed || !!groupProps["aria-invalid"]}
          value={value.end}
          onValueChange={(end) => setValue((v) => ({ ...v, end }))}
          name={nameEnd}
          labels={labels}
        />
      </FieldContextReset>
      {showDuration ? (
        <span id={durationId} aria-live="polite" className={cn("min-w-16 font-mono text-xs tabular", reversed ? "text-danger" : "text-fg-muted")}>
          {duration}
          {crosses ? <span className="ms-1.5 rounded-ui-sm bg-surface-2 px-1 py-px font-sans text-[10.5px] text-fg-muted">{t("nextDay")}</span> : null}
        </span>
      ) : null}
    </div>
  );
});
