"use client";

import * as React from "react";
import { DayPicker, type DayPickerProps, type Matcher, type Modifiers, type DayButtonProps, type DayProps, type ChevronProps, type MonthCaptionProps } from "react-day-picker";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, RotateCcw } from "lucide-react";
import { cn } from "../lib/cn";
import { useLocale } from "../lib/locale";
import { useLabels } from "../lib/labels";
import { useControllableState, useEventCallback } from "../lib/use-controllable-state";
import { dateToIso, getDateFnsLocale, isoToDate, todayIso, type IsoDateRange, type IsoDateString } from "../lib/date";
import { getWeekInfo } from "../locale-data/core/week-info";
import { holidayName } from "../locale-data/core/holidays";
import { trHolidays } from "../locale-data/tr/holidays";
import type { Holiday, HolidayProvider } from "../locale-data/core/types";
import { Button, IconButton } from "./button";

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

const calendarLabels = {
  prevMonth: "Previous month",
  nextMonth: "Next month",
  prevYear: "Previous year",
  nextYear: "Next year",
  selectMonth: "Select month",
  selectYear: "Select year",
  nav: "Calendar navigation",
  today: "Today",
  todayDay: "Today, {date}",
  selectedDay: "{date}, selected",
  weekNumber: "Week {week}",
  weekColumn: "Week",
  weekColumnShort: "Wk",
  holiday: "Holiday",
  halfDay: "{name} (from {time})",
  weekend: "Weekend",
  more: "+{count} more",
  loading: "Loading…",
  slots: "Available times",
  noSlots: "No times available on this day",
  slotsError: "Couldn't load the times.",
  retry: "Try again",
  slotsLeft: "{count, plural, one {# slot left} other {# slots left}}",
  unavailable: "unavailable",
};
export type CalendarLabels = typeof calendarLabels;

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

/** A day matcher: any react-day-picker matcher, or a `YYYY-MM-DD` string. */
export type DayMatcher = Matcher | IsoDateString;

/** Turns string / matcher input into react-day-picker matchers (min/max become `before`/`after`). */
export function toDayMatchers(options: { min?: IsoDateString; max?: IsoDateString; disabledDays?: DayMatcher | DayMatcher[] }): Matcher[] {
  const out: Matcher[] = [];
  const min = isoToDate(options.min);
  const max = isoToDate(options.max);
  if (min) out.push({ before: min });
  if (max) out.push({ after: max });
  const list = options.disabledDays === undefined ? [] : Array.isArray(options.disabledDays) ? options.disabledDays : [options.disabledDays];
  for (const m of list) {
    if (typeof m === "string") {
      const d = isoToDate(m);
      if (d) out.push(d);
    } else out.push(m);
  }
  return out;
}

/** react-day-picker `weekStartsOn` (0 = Sunday) and `firstWeekContainsDate` of a locale. */
export function useCalendarWeek(locale?: string) {
  const ctx = useLocale();
  const info = getWeekInfo(locale ?? ctx.locale);
  return React.useMemo(
    () => ({
      weekStartsOn: (info.firstDay % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      firstWeekContainsDate: (info.minimalDays >= 4 ? 4 : 1) as 1 | 4,
      /** ISO weekdays (1 = Monday … 7 = Sunday) of the weekend. */
      weekend: info.weekend,
    }),
    [info],
  );
}

/* ------------------------------------------------------------------ */
/* CalendarGrid                                                        */
/* ------------------------------------------------------------------ */

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type CalendarGridSize = "sm" | "md" | "lg";

interface CalendarGridOwnProps {
  /** Cell size: sm = 32px, md = `--control-h` (density axis), lg = 76px cells with a content area. */
  size?: CalendarGridSize;
  /** Content under the day number: dots, a count, a price. */
  renderDayExtra?: (date: Date, modifiers: Modifiers) => React.ReactNode;
  /** Extra words appended to a day's accessible name ("Republic Day, 2 scheduled posts"). */
  describeDay?: (date: Date, modifiers: Modifiers) => string | undefined;
  /** Native tooltip of a day (holiday names). */
  dayTitle?: (date: Date, modifiers: Modifiers) => string | undefined;
  /** Mark the locale's weekend days with `data-weekend`. Default `true`. */
  markWeekends?: boolean;
  /** Built-in strings (`calendar` namespace). */
  labels?: Partial<CalendarLabels>;
  /** react-day-picker's own label functions (advanced). */
  ariaLabels?: DayPickerProps["labels"];
}

/**
 * The shared month grid behind Calendar, Date picker and Date range picker: react-day-picker v9
 * styled with tokens, with locale-aware week start (`getWeekInfo`), weekend marks, localized
 * labels, and stable `data-*` hooks (`data-today`, `data-selected`, `data-range-start|middle|end`,
 * `data-disabled`, `data-outside`, `data-weekend`, `data-holiday`).
 *
 * All react-day-picker props pass through (`mode`, `selected`, `onSelect`, `modifiers`,
 * `numberOfMonths`, `captionLayout`, `showWeekNumber`…). Dates here are `Date` objects; the
 * higher-level components take `YYYY-MM-DD` strings.
 *
 * ```tsx
 * <CalendarGrid mode="single" selected={day} onSelect={setDay} />
 * ```
 */
export type CalendarGridProps = DistributiveOmit<DayPickerProps, "labels"> & CalendarGridOwnProps;

interface GridContextValue {
  renderDayExtra?: CalendarGridOwnProps["renderDayExtra"];
  dayTitle?: CalendarGridOwnProps["dayTitle"];
  size: CalendarGridSize;
}
const GridContext = React.createContext<GridContextValue>({ size: "md" });

// Modifiers surfaced as data attributes on the day cell (in addition to rdp's own).
const DATA_MODIFIERS: Record<string, string> = {
  range_start: "data-range-start",
  range_middle: "data-range-middle",
  range_end: "data-range-end",
  weekend: "data-weekend",
  holiday: "data-holiday",
  preview: "data-preview",
  previewEnd: "data-preview-end",
  marked: "data-marked",
};

function GridDay({ day, modifiers, children, ...props }: DayProps) {
  const ctx = React.useContext(GridContext);
  const extra: Record<string, string> = {};
  for (const [mod, attr] of Object.entries(DATA_MODIFIERS)) if (modifiers[mod]) extra[attr] = "";
  // Non-interactive grids (mode "none") get plain text from rdp; wrap it in the same day box so
  // holidays, markers, today and outside days keep their styling.
  const isStatic = !React.isValidElement(children);
  const dayExtra = isStatic ? ctx.renderDayExtra?.(day.date, modifiers) : null;
  return (
    <td {...props} {...extra}>
      {isStatic ? (
        <span className="ui-cal-day" data-static="" title={ctx.dayTitle?.(day.date, modifiers)}>
          <span data-slot="calendar-day-number">{children}</span>
          {dayExtra != null && dayExtra !== false ? (
            <span data-slot="calendar-day-extra" aria-hidden>
              {dayExtra}
            </span>
          ) : null}
        </span>
      ) : (
        children
      )}
    </td>
  );
}

function GridDayButton({ day, modifiers, className, children, ...props }: DayButtonProps) {
  const ctx = React.useContext(GridContext);
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  const extra = ctx.renderDayExtra?.(day.date, modifiers);
  const title = ctx.dayTitle?.(day.date, modifiers);
  const hasExtra = extra != null && extra !== false;
  // With visible extras (event lines, counts) the day's name moves from aria-label into hidden
  // text: an aria-label that doesn't contain the visible "2 Discovery call" fails WCAG 2.5.3.
  const { "aria-label": ariaLabel, ...buttonProps } = props;
  return (
    <button ref={ref} title={title} {...buttonProps} aria-label={hasExtra ? undefined : ariaLabel} className={cn("ui-cal-day", className)}>
      {hasExtra && ariaLabel ? <span className="sr-only">{ariaLabel}</span> : null}
      <span data-slot="calendar-day-number" aria-hidden={hasExtra && ariaLabel ? true : undefined}>
        {children}
      </span>
      {hasExtra ? (
        <span data-slot="calendar-day-extra" aria-hidden>
          {extra}
        </span>
      ) : null}
    </button>
  );
}

function GridChevron({ orientation = "left", className }: ChevronProps) {
  const Icon = orientation === "right" ? ChevronRight : orientation === "down" ? ChevronDown : orientation === "up" ? ChevronUp : ChevronLeft;
  return <Icon aria-hidden className={cn("size-4", (orientation === "left" || orientation === "right") && "rtl:-scale-x-100", className)} />;
}

const MonthDateContext = React.createContext<Date | null>(null);

function GridMonthCaption({ calendarMonth, displayIndex: _i, ...props }: MonthCaptionProps) {
  return (
    <MonthDateContext.Provider value={calendarMonth.date}>
      <div {...props} />
    </MonthDateContext.Provider>
  );
}

function GridCaptionLabel({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  const month = React.useContext(MonthDateContext);
  const { locale } = useLocale();
  // In label mode the caption is a status region: split "November 2026" into month + muted year.
  if (props.role === "status" && month) {
    const parts = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).formatToParts(month);
    return (
      <span {...props} className={className}>
        {parts.map((p, i) =>
          p.type === "year" ? (
            <span key={i} className="font-normal text-fg-muted">
              {p.value}
            </span>
          ) : (
            <React.Fragment key={i}>{p.value}</React.Fragment>
          ),
        )}
      </span>
    );
  }
  return (
    <span {...props} className={className}>
      {children}
    </span>
  );
}

const gridComponents = {
  Day: GridDay,
  DayButton: GridDayButton,
  Chevron: GridChevron,
  MonthCaption: GridMonthCaption,
  CaptionLabel: GridCaptionLabel,
};

const navButton =
  "inline-flex size-8 items-center justify-center rounded-ui-sm text-fg-muted transition-colors hover:bg-hover hover:text-fg focus-ring aria-disabled:pointer-events-none aria-disabled:opacity-30";

const gridClassNames = {
  root: "ui-cal relative w-fit max-w-full",
  months: "ui-cal-months relative flex flex-col gap-x-8 gap-y-5 sm:flex-row",
  month: "grid content-start gap-2",
  month_caption: "flex h-8 items-center ps-1.5 pe-[4.5rem]",
  caption_label: "inline-flex items-center gap-1 text-sm font-semibold tracking-[-0.01em] text-fg [&_svg]:size-3.5 [&_svg]:text-fg-subtle",
  nav: "absolute end-0 top-0 z-[1] flex h-8 items-center gap-0.5",
  button_previous: navButton,
  button_next: navButton,
  chevron: "",
  dropdowns: "flex items-center gap-1.5",
  dropdown_root:
    "relative inline-flex h-7 items-center rounded-ui-sm border border-field-border bg-field ps-2 pe-1.5 transition-[border-color,box-shadow] hover:border-field-border-hover has-[:focus-visible]:border-ring has-[:focus-visible]:shadow-[0_0_0_3px_var(--accent-soft)]",
  dropdown: "absolute inset-0 w-full cursor-pointer appearance-none opacity-0",
  month_grid: "ui-cal-grid border-separate border-spacing-x-0 border-spacing-y-0.5",
  weekdays: "",
  weekday: "ui-cal-weekday h-7 p-0 text-center align-middle text-[10.5px] font-medium uppercase tracking-[0.08em] text-fg-subtle",
  weeks: "",
  week: "",
  week_number_header: "ui-cal-weekno h-7 p-0 text-center align-middle font-mono text-[10px] font-normal tracking-wide text-fg-subtle",
  week_number: "ui-cal-weekno p-0 text-center align-middle font-mono text-[10px] font-normal text-fg-subtle tabular",
  day: "ui-cal-cell p-0 text-center align-middle",
  day_button: "",
  footer: "ui-cal-footer",
  // State classes are replaced by data attributes (see GridDay).
  selected: "",
  range_start: "",
  range_middle: "",
  range_end: "",
  today: "",
  outside: "",
  disabled: "",
  hidden: "invisible",
  focused: "",
};

/** react-day-picker styled with tokens. See `CalendarGridProps`. */
export function CalendarGrid(props: CalendarGridProps) {
  const {
    size = "md",
    renderDayExtra,
    describeDay,
    dayTitle,
    markWeekends = true,
    labels,
    ariaLabels,
    className,
    classNames,
    components,
    modifiers,
    ...rest
  } = props as CalendarGridOwnProps & DayPickerProps;
  const t = useLabels("calendar", calendarLabels, labels);
  const { locale, dir } = useLocale();
  const fnsLocale = getDateFnsLocale(locale);
  const week = useCalendarWeek();

  const allModifiers = React.useMemo(() => {
    if (!markWeekends) return modifiers;
    const weekend = week.weekend;
    return { weekend: (d: Date) => weekend.includes(((d.getDay() + 6) % 7) + 1), ...modifiers };
  }, [markWeekends, modifiers, week.weekend]);

  const describe = useEventCallback(describeDay);
  const dayLabelFormat = React.useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "full" }), [locale]);
  const rdpLabels = React.useMemo<DayPickerProps["labels"]>(
    () => ({
      labelPrevious: () => t("prevMonth"),
      labelNext: () => t("nextMonth"),
      labelMonthDropdown: () => t("selectMonth"),
      labelYearDropdown: () => t("selectYear"),
      labelNav: () => t("nav"),
      labelWeekNumber: (week: number) => t("weekNumber", { week }),
      labelWeekNumberHeader: () => t("weekColumn"),
      // Non-interactive cells (read-only grids) are labelled on the <td>; same Intl date.
      labelGridcell: (date: Date, mods?: Modifiers) => {
        const label = dayLabelFormat.format(date);
        return mods?.today ? t("todayDay", { date: label }) : label;
      },
      labelDayButton: (date: Date, mods: Modifiers) => {
        // Intl, not date-fns "PPPP": the name must contain the visible day number ("November 1",
        // not "November 1st") or it fails WCAG 2.5.3 label-in-name on every day button.
        let label = dayLabelFormat.format(date);
        if (mods.today) label = t("todayDay", { date: label });
        const more = describe(date, mods);
        if (more) label = `${label}, ${more}`;
        if (mods.disabled) label = `${label}, ${t("unavailable")}`;
        if (mods.selected) label = t("selectedDay", { date: label });
        return label;
      },
      ...ariaLabels,
    }),
    [t, dayLabelFormat, describe, ariaLabels],
  );

  const ctx = React.useMemo<GridContextValue>(() => ({ renderDayExtra, dayTitle, size }), [renderDayExtra, dayTitle, size]);

  return (
    <GridContext.Provider value={ctx}>
      <DayPicker
        locale={fnsLocale}
        dir={dir}
        weekStartsOn={week.weekStartsOn}
        firstWeekContainsDate={week.firstWeekContainsDate}
        showOutsideDays
        formatters={{ formatWeekNumberHeader: () => t("weekColumnShort") }}
        {...(rest as DayPickerProps)}
        modifiers={allModifiers}
        labels={rdpLabels}
        className={cn(className)}
        data-size={size}
        classNames={{ ...gridClassNames, ...classNames }}
        components={{ ...gridComponents, ...components }}
      />
    </GridContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Calendar (standalone)                                               */
/* ------------------------------------------------------------------ */

export type CalendarTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

/** Something on a day: a scheduled post, an absence, "3 slots left". */
export interface CalendarMarker {
  label: string;
  tone?: CalendarTone;
  /** Shown as a number in `lg` cells and summed for density. */
  count?: number;
}

export interface CalendarDayInfo {
  iso: IsoDateString;
  isToday: boolean;
  isWeekend: boolean;
  outside: boolean;
  selected: boolean;
  disabled: boolean;
  holidays: Holiday[];
  markers: CalendarMarker[];
}

export interface CalendarLegendItem {
  label: string;
  tone?: CalendarTone;
  /** `"dot"` (default), `"holiday"` (tinted cell) or `"today"` (accent bar). */
  kind?: "dot" | "holiday" | "today";
}

type CalendarSelectionProps =
  | {
      /** Selection mode. Default `"single"`. */
      mode?: "single";
      value?: IsoDateString | null;
      defaultValue?: IsoDateString | null;
      onValueChange?: (value: IsoDateString | null) => void;
    }
  | {
      mode: "multiple";
      value?: IsoDateString[];
      defaultValue?: IsoDateString[];
      onValueChange?: (value: IsoDateString[]) => void;
    }
  | {
      mode: "range";
      value?: IsoDateRange | null;
      defaultValue?: IsoDateRange | null;
      onValueChange?: (value: IsoDateRange | null) => void;
    }
  | {
      /** Display only: no selection. */
      mode: "none";
      value?: undefined;
      defaultValue?: undefined;
      onValueChange?: undefined;
    };

interface CalendarBaseProps {
  /** Visible months: 1, 2, 3, or 12 (year view with compact cells). Default 1. */
  months?: 1 | 2 | 3 | 12;
  /** Visible month (`YYYY-MM` or any date in it), controlled. */
  month?: string;
  /** Initial visible month. Default: the month of the value, else today. */
  defaultMonth?: string;
  /** Called with `YYYY-MM-01` of the first visible month. */
  onMonthChange?: (month: IsoDateString) => void;
  /** Called with the visible window, e.g. to fetch events for it. */
  onVisibleRangeChange?: (range: { start: IsoDateString; end: IsoDateString }) => void;
  /** Earliest selectable date. */
  min?: IsoDateString;
  /** Latest selectable date. */
  max?: IsoDateString;
  /** Days that cannot be picked (unavailable, fully booked). */
  disabledDays?: DayMatcher | DayMatcher[];
  /** `true`: a selected day cannot be cleared by clicking it again (single mode). */
  required?: boolean;
  /** Week numbers in the first column (locale week rules). */
  showWeekNumbers?: boolean;
  /** Holiday data. Default: the active locale's pack (`tr` → Turkish public holidays); `false` hides them. */
  holidays?: HolidayProvider | HolidayProvider[] | false;
  /** Holiday region filter (ISO 3166-2). */
  holidayRegion?: string;
  /** Per-day markers, keyed by `YYYY-MM-DD`. */
  markers?: Record<IsoDateString, CalendarMarker | CalendarMarker[]>;
  /** Custom content under the day number (replaces the marker dots). */
  renderDay?: (date: Date, info: CalendarDayInfo) => React.ReactNode;
  /** Cell size. sm 32px, md `--control-h`, lg 76px with a content area. Default `"md"` (`"sm"` in the year view). */
  size?: CalendarGridSize;
  /** `"card"` wraps the calendar in a surface. Default `"plain"`. */
  variant?: "plain" | "card";
  /** Header with title, previous / next and Today. Default `true`. */
  header?: boolean;
  /** Extra content at the end of the header (filters, a view switch). */
  headerAction?: React.ReactNode;
  /** Legend under the grid. Holidays in view are added automatically. */
  legend?: CalendarLegendItem[] | boolean;
  /** Placeholder dots while the visible range is loading. */
  loading?: boolean;
  /** Week start override (0 = Sunday … 6). Default from the locale. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Content under the grid (pickers put Clear / Apply here). */
  footer?: React.ReactNode;
  /** Extra react-day-picker props for the grid. */
  gridProps?: Partial<CalendarGridOwnProps> & Omit<Partial<DayPickerProps>, "mode" | "selected" | "onSelect" | "labels">;
  className?: string;
  id?: string;
  "aria-label"?: string;
  labels?: Partial<CalendarLabels>;
}

export type CalendarProps = CalendarBaseProps & CalendarSelectionProps;

const monthOf = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const iso = /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value;
  const d = isoToDate(iso);
  return d ? new Date(d.getFullYear(), d.getMonth(), 1) : null;
};
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const lastOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const asArray = <T,>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

const toneVar: Record<CalendarTone, string> = {
  neutral: "var(--fg-muted)",
  accent: "var(--accent-ink)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--info)",
};

function initialSelectionMonth(props: CalendarProps): string | null | undefined {
  const v = props.value ?? props.defaultValue;
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return (v as IsoDateRange).from;
}

/**
 * Standalone month, multi-month or year calendar with per-day content: marker dots, holidays,
 * counts, availability. Values are `YYYY-MM-DD` strings. Week start, weekend and month names
 * follow the locale; holidays come from the locale pack (Turkish public holidays for `tr`).
 *
 * ```tsx
 * <Calendar
 *   value={day}
 *   onValueChange={setDay}
 *   markers={{ "2026-11-12": { label: "2 scheduled posts", tone: "accent", count: 2 } }}
 * />
 * <Calendar months={12} size="sm" markers={density} />
 * ```
 */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const {
    months = 1,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    onVisibleRangeChange,
    min,
    max,
    disabledDays,
    required,
    showWeekNumbers,
    holidays: holidaysProp,
    holidayRegion,
    markers,
    renderDay,
    size: sizeProp,
    variant = "plain",
    header = true,
    headerAction,
    legend,
    loading,
    weekStartsOn,
    footer,
    gridProps,
    className,
    id,
    labels,
  } = props;
  const mode = props.mode ?? "single";
  const t = useLabels("calendar", calendarLabels, labels);
  const { locale, timeZone } = useLocale();
  const isYear = months === 12;
  const size = sizeProp ?? (isYear ? "sm" : "md");
  const today = todayIso(timeZone === "UTC" ? undefined : timeZone);

  // Visible month
  const startOf = React.useCallback((d: Date) => (isYear ? new Date(d.getFullYear(), 0, 1) : d), [isYear]);
  const initialMonth = () => startOf(monthOf(defaultMonth) ?? monthOf(initialSelectionMonth(props)) ?? monthOf(today)!);
  const [visibleMonth, setVisibleMonth] = useControllableState<Date>({
    value: monthProp ? (monthOf(monthProp) ?? undefined) : undefined,
    defaultValue: initialMonth,
    onChange: (d) => onMonthChange?.(dateToIso(d)),
    name: "Calendar",
  });
  const firstMonth = startOf(visibleMonth);
  const lastMonth = addMonths(firstMonth, months - 1);
  const rangeStart = dateToIso(firstMonth);
  const rangeEnd = dateToIso(lastOfMonth(lastMonth));

  const reportRange = useEventCallback(onVisibleRangeChange);
  React.useEffect(() => {
    reportRange({ start: rangeStart, end: rangeEnd });
  }, [rangeStart, rangeEnd, reportRange]);

  // Selection (string values ↔ rdp Dates)
  const [single, setSingle] = useControllableState<IsoDateString | null>({
    value: mode === "single" ? (props.value as IsoDateString | null | undefined) : undefined,
    defaultValue: mode === "single" ? ((props.defaultValue as IsoDateString | null | undefined) ?? null) : null,
    onChange: mode === "single" ? (props.onValueChange as ((v: IsoDateString | null) => void) | undefined) : undefined,
    name: "Calendar",
  });
  const [multiple, setMultiple] = useControllableState<IsoDateString[]>({
    value: mode === "multiple" ? (props.value as IsoDateString[] | undefined) : undefined,
    defaultValue: mode === "multiple" ? ((props.defaultValue as IsoDateString[] | undefined) ?? []) : [],
    onChange: mode === "multiple" ? (props.onValueChange as ((v: IsoDateString[]) => void) | undefined) : undefined,
    name: "Calendar",
  });
  const [range, setRange] = useControllableState<IsoDateRange | null>({
    value: mode === "range" ? (props.value as IsoDateRange | null | undefined) : undefined,
    defaultValue: mode === "range" ? ((props.defaultValue as IsoDateRange | null | undefined) ?? null) : null,
    onChange: mode === "range" ? (props.onValueChange as ((v: IsoDateRange | null) => void) | undefined) : undefined,
    name: "Calendar",
  });

  // Holidays in view
  const providers = React.useMemo<HolidayProvider[]>(() => {
    if (holidaysProp === false) return [];
    if (holidaysProp) return asArray(holidaysProp);
    return locale.toLowerCase().startsWith("tr") ? [trHolidays] : [];
  }, [holidaysProp, locale]);
  const padStart = dateToIso(new Date(firstMonth.getFullYear(), firstMonth.getMonth(), -6));
  const padEnd = dateToIso(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 7));
  const holidayMap = React.useMemo(() => {
    const map = new Map<string, Holiday[]>();
    for (const p of providers)
      for (const h of p.get({ start: padStart, end: padEnd }, { region: holidayRegion })) {
        const list = map.get(h.date) ?? [];
        list.push(h);
        map.set(h.date, list);
      }
    return map;
  }, [providers, padStart, padEnd, holidayRegion]);

  const holidayLabel = React.useCallback(
    (h: Holiday) => {
      const name = holidayName(h, locale, "tr");
      return h.partial ? t("halfDay", { name, time: h.partial.from }) : name;
    },
    [locale, t],
  );

  const markerList = React.useCallback((iso: string) => asArray(markers?.[iso]), [markers]);

  const describeDay = React.useCallback(
    (date: Date) => {
      const iso = dateToIso(date);
      const words = [...(holidayMap.get(iso) ?? []).map(holidayLabel), ...markerList(iso).map((m) => m.label)];
      return words.length ? words.join(", ") : undefined;
    },
    [holidayMap, holidayLabel, markerList],
  );
  const dayTitle = React.useCallback(
    (date: Date) => {
      const iso = dateToIso(date);
      const words = [...(holidayMap.get(iso) ?? []).map(holidayLabel), ...markerList(iso).map((m) => m.label)];
      return words.length ? words.join(" · ") : undefined;
    },
    [holidayMap, holidayLabel, markerList],
  );

  const renderDayExtra = React.useCallback(
    (date: Date, mods: Modifiers) => {
      const iso = dateToIso(date);
      const hs = holidayMap.get(iso) ?? [];
      const ms = markerList(iso);
      if (renderDay) {
        return renderDay(date, {
          iso,
          isToday: !!mods.today,
          isWeekend: !!mods.weekend,
          outside: !!mods.outside,
          selected: !!mods.selected,
          disabled: !!mods.disabled,
          holidays: hs,
          markers: ms,
        });
      }
      if (loading && !mods.outside) return <span className="ui-cal-dots"><span className="ui-cal-dot ui-cal-dot-loading" /></span>;
      if (size === "lg") {
        if (!hs.length && !ms.length) return null;
        const shown = ms.slice(0, 2);
        return (
          <span className="ui-cal-lines">
            {hs.map((h, i) => (
              <span key={`h${i}`} className="ui-cal-line ui-cal-line-holiday">
                {holidayLabel(h)}
              </span>
            ))}
            {shown.map((m, i) => (
              <span key={i} className="ui-cal-line" style={{ "--tone": toneVar[m.tone ?? "accent"] } as React.CSSProperties}>
                {m.label}
              </span>
            ))}
            {ms.length > shown.length ? <span className="ui-cal-line-more">{t("more", { count: ms.length - shown.length })}</span> : null}
          </span>
        );
      }
      const dots: { tone: string; key: string }[] = [];
      if (hs.length) dots.push({ tone: "var(--warning)", key: "holiday" });
      for (const [i, m] of ms.entries()) if (dots.length < 3) dots.push({ tone: toneVar[m.tone ?? "accent"], key: String(i) });
      if (!dots.length) return null;
      return (
        <span className="ui-cal-dots">
          {dots.map((d) => (
            <span key={d.key} className="ui-cal-dot" style={{ "--tone": d.tone } as React.CSSProperties} />
          ))}
        </span>
      );
    },
    [holidayMap, markerList, renderDay, loading, size, holidayLabel, t],
  );

  const modifiers = React.useMemo(
    () => ({
      holiday: (d: Date) => holidayMap.has(dateToIso(d)),
      marked: (d: Date) => markerList(dateToIso(d)).length > 0,
    }),
    [holidayMap, markerList],
  );

  const disabled = React.useMemo(() => toDayMatchers({ min, max, disabledDays }), [min, max, disabledDays]);

  // Navigation
  const step = isYear ? 12 : months;
  const minMonth = monthOf(min);
  const maxMonth = monthOf(max);
  const canPrev = !minMonth || addMonths(firstMonth, -1) >= startOf(minMonth);
  const canNext = !maxMonth || addMonths(lastMonth, 1) <= maxMonth;
  const go = (n: number) => setVisibleMonth(addMonths(firstMonth, n));
  const goToday = () => setVisibleMonth(startOf(monthOf(today)!));
  const showingToday = today >= rangeStart && today <= rangeEnd;

  const title = isYear
    ? new Intl.DateTimeFormat(locale, { year: "numeric" }).format(firstMonth)
    : months === 1
      ? null
      : new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).formatRange(firstMonth, lastMonth).replace(/[\u2009\u202f]/g, " ");
  const monthParts = months === 1 ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).formatToParts(firstMonth) : null;

  // Legend: given items + holidays when any are in view.
  const legendItems = React.useMemo<CalendarLegendItem[]>(() => {
    if (!legend) return [];
    const items = Array.isArray(legend) ? [...legend] : [];
    const anyHoliday = [...holidayMap.keys()].some((k) => k >= rangeStart && k <= rangeEnd);
    if (anyHoliday && !items.some((i) => i.kind === "holiday")) items.push({ label: t("holiday"), kind: "holiday" });
    return items;
  }, [legend, holidayMap, rangeStart, rangeEnd, t]);

  const selectionProps: Record<string, unknown> =
    mode === "single"
      ? { mode: "single", required, selected: isoToDate(single) ?? undefined, onSelect: (d?: Date) => setSingle(d ? dateToIso(d) : null) }
      : mode === "multiple"
        ? { mode: "multiple", selected: multiple.map((v) => isoToDate(v)).filter(Boolean), onSelect: (ds?: Date[]) => setMultiple((ds ?? []).map(dateToIso).sort()) }
        : mode === "range"
          ? {
              mode: "range",
              selected: range ? { from: isoToDate(range.from) ?? undefined, to: isoToDate(range.to) ?? undefined } : undefined,
              onSelect: (r?: { from?: Date; to?: Date }) => setRange(r?.from ? { from: dateToIso(r.from), ...(r.to ? { to: dateToIso(r.to) } : {}) } : null),
            }
          : {};

  const week = useCalendarWeek();
  const { classNames: gridClassNamesProp, ...restGrid } = gridProps ?? {};

  return (
    <div
      ref={ref}
      id={id}
      data-slot="calendar"
      data-variant={variant}
      data-months={months}
      aria-busy={loading || undefined}
      className={cn("grid min-w-0 gap-3", variant === "card" && "surface rounded-ui-lg p-[calc(var(--gap)*1.1)]", size === "lg" && "w-full", className)}
    >
      {header ? (
        <div data-slot="calendar-header" className="flex min-h-8 flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="me-auto min-w-0 text-[15px] font-semibold tracking-[-0.015em] text-fg">
            {monthParts
              ? monthParts.map((p, i) =>
                  p.type === "year" ? (
                    <span key={i} className="font-normal text-fg-muted">
                      {p.value}
                    </span>
                  ) : (
                    <React.Fragment key={i}>{p.value}</React.Fragment>
                  ),
                )
              : title}
          </h3>
          {headerAction}
          <div className="flex items-center gap-1">
            <Button size="xs" variant="secondary" onClick={goToday} disabled={showingToday}>
              {t("today")}
            </Button>
            <IconButton size="sm" label={isYear ? t("prevYear") : t("prevMonth")} tooltip={false} onClick={() => go(-step)} disabled={!canPrev}>
              <ChevronLeft className="rtl:-scale-x-100" />
            </IconButton>
            <IconButton size="sm" label={isYear ? t("nextYear") : t("nextMonth")} tooltip={false} onClick={() => go(step)} disabled={!canNext}>
              <ChevronRight className="rtl:-scale-x-100" />
            </IconButton>
          </div>
        </div>
      ) : null}
      <CalendarGrid
        {...(selectionProps as object)}
        size={size}
        labels={labels}
        month={firstMonth}
        onMonthChange={(d: Date) => setVisibleMonth(startOf(d))}
        numberOfMonths={months}
        pagedNavigation
        hideNavigation={header}
        showOutsideDays={months === 1}
        fixedWeeks={months === 1 && size !== "lg"}
        showWeekNumber={showWeekNumbers}
        weekStartsOn={weekStartsOn ?? week.weekStartsOn}
        startMonth={minMonth ?? undefined}
        endMonth={maxMonth ?? undefined}
        disabled={disabled}
        modifiers={modifiers}
        renderDayExtra={renderDayExtra}
        describeDay={describeDay}
        dayTitle={dayTitle}
        aria-label={props["aria-label"]}
        footer={footer}
        classNames={{
          ...(months === 1 && header ? { month_caption: "sr-only" } : null),
          ...(isYear ? { months: "ui-cal-months grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", month_caption: "flex h-7 items-center ps-1.5" } : null),
          ...(size === "lg" ? { root: "ui-cal relative w-full", months: "ui-cal-months relative grid gap-6", month: "grid min-w-0 content-start gap-2" } : null),
          ...gridClassNamesProp,
        }}
        {...(restGrid as object)}
      />
      {legendItems.length ? <CalendarLegend items={legendItems} /> : null}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* CalendarLegend                                                      */
/* ------------------------------------------------------------------ */

export interface CalendarLegendProps extends React.HTMLAttributes<HTMLUListElement> {
  items: CalendarLegendItem[];
  labels?: Partial<CalendarLabels>;
}

/** Key for the marks on a Calendar (dot tones, holidays, today). */
export const CalendarLegend = React.forwardRef<HTMLUListElement, CalendarLegendProps>(function CalendarLegend({ items, className, labels: _labels, ...props }, ref) {
  return (
    <ul ref={ref} data-slot="calendar-legend" className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-fg-muted", className)} {...props}>
      {items.map((item, i) => (
        <li key={i} className="inline-flex items-center gap-1.5">
          {item.kind === "holiday" ? (
            <span aria-hidden className="ui-cal-legend-holiday" />
          ) : item.kind === "today" ? (
            <span aria-hidden className="h-0.5 w-3 rounded-full bg-accent-ink" />
          ) : (
            <span aria-hidden className="size-1.5 rounded-full" style={{ background: toneVar[item.tone ?? "accent"] }} />
          )}
          {item.label}
        </li>
      ))}
    </ul>
  );
});

/* ------------------------------------------------------------------ */
/* CalendarSlots                                                       */
/* ------------------------------------------------------------------ */

export interface CalendarSlot {
  /** `"HH:mm"` (24h). The value reported on select. */
  start: string;
  end?: string;
  available: boolean;
  /** Extra text ("1 left", "$45"). */
  label?: string;
}

export interface CalendarSlotsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  slots: CalendarSlot[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (start: string | null) => void;
  /** The day the slots belong to (`YYYY-MM-DD`), shown as the heading. */
  day?: IsoDateString | null;
  loading?: boolean;
  /** Error text; shows a retry button when `onRetry` is set. */
  error?: React.ReactNode;
  onRetry?: () => void;
  /** Display hour cycle. Default from the locale. */
  hourCycle?: 12 | 24;
  /** Columns of the slot grid. Default 3. */
  columns?: 2 | 3 | 4;
  labels?: Partial<CalendarLabels>;
}

/**
 * Time slots for the selected day (booking). A `radiogroup` with roving focus: arrows move,
 * Space / Enter selects. Unavailable slots are shown struck through and skipped.
 *
 * ```tsx
 * <CalendarSlots day={day} slots={slots} value={time} onValueChange={setTime} />
 * ```
 */
export const CalendarSlots = React.forwardRef<HTMLDivElement, CalendarSlotsProps>(function CalendarSlots(
  { slots, value: valueProp, defaultValue, onValueChange, day, loading, error, onRetry, hourCycle, columns = 3, labels, className, ...props },
  ref,
) {
  const t = useLabels("calendar", calendarLabels, labels);
  const { locale, format } = useLocale();
  const [value, setValue] = useControllableState<string | null>({ value: valueProp, defaultValue: defaultValue ?? null, onChange: onValueChange, name: "CalendarSlots" });
  const headingId = React.useId();
  const listRef = React.useRef<HTMLDivElement>(null);
  const timeFmt = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone: "UTC", ...(hourCycle ? { hourCycle: hourCycle === 12 ? "h12" : "h23" } : null) }),
    [locale, hourCycle],
  );
  const show = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return timeFmt.format(new Date(Date.UTC(1970, 0, 1, h ?? 0, m ?? 0)));
  };
  const enabled = slots.filter((s) => s.available);
  const focusIndex = Math.max(0, enabled.findIndex((s) => s.start === value));
  const available = enabled.length;

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys) && e.key !== "Home" && e.key !== "End") return;
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([aria-disabled="true"])') ?? []);
    const cur = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (!buttons.length) return;
    e.preventDefault();
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    let delta = keys[e.key] ?? 0;
    if (rtl && (e.key === "ArrowLeft" || e.key === "ArrowRight")) delta = -delta;
    const next = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (cur + delta + buttons.length) % buttons.length;
    const el = buttons[next]!;
    el.focus();
    setValue(el.dataset.value ?? null);
  };

  return (
    <div ref={ref} data-slot="calendar-slots" className={cn("grid content-start gap-3", className)} {...props}>
      <div className="flex items-baseline justify-between gap-3">
        <h4 id={headingId} className="text-[13px] font-semibold text-fg">
          {day ? format.date(day, { weekday: "long", month: "long", day: "numeric" }) : t("slots")}
        </h4>
        {!loading && !error && slots.length ? <span className="text-xs text-fg-subtle tabular">{t("slotsLeft", { count: available })}</span> : null}
      </div>
      {loading ? (
        <div className={cn("grid gap-1.5", columns === 2 ? "grid-cols-2" : columns === 4 ? "grid-cols-4" : "grid-cols-3")} aria-label={t("loading")} role="status">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="h-(--control-h) animate-pulse rounded-ui-sm bg-skeleton motion-reduce:animate-none" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="grid justify-items-start gap-2 rounded-ui border border-dashed border-line px-3 py-3 text-[13px] text-fg-muted">
          <span>{error === true ? t("slotsError") : error}</span>
          {onRetry ? (
            <Button size="xs" variant="secondary" onClick={onRetry}>
              <RotateCcw /> {t("retry")}
            </Button>
          ) : null}
        </div>
      ) : !slots.length || !available ? (
        <p className="rounded-ui border border-dashed border-line px-3 py-4 text-center text-[13px] text-fg-muted">{t("noSlots")}</p>
      ) : (
        <div
          ref={listRef}
          role="radiogroup"
          aria-labelledby={headingId}
          onKeyDown={onKeyDown}
          className={cn("grid gap-1.5", columns === 2 ? "grid-cols-2" : columns === 4 ? "grid-cols-4" : "grid-cols-3")}
        >
          {slots.map((s) => {
            const checked = s.start === value;
            const idx = enabled.indexOf(s);
            return (
              <button
                key={s.start}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-disabled={!s.available || undefined}
                data-value={s.start}
                data-state={checked ? "checked" : "unchecked"}
                tabIndex={s.available && idx === focusIndex ? 0 : -1}
                onClick={() => s.available && setValue(s.start)}
                className={cn(
                  "flex h-(--control-h) flex-col items-center justify-center rounded-ui-sm border text-[13px] font-medium tabular transition-[background-color,border-color,color] focus-ring",
                  checked
                    ? "border-transparent bg-accent text-accent-fg"
                    : s.available
                      ? "border-field-border bg-field text-fg hover:border-field-border-hover hover:bg-hover"
                      : "cursor-not-allowed border-dashed border-line text-fg-subtle line-through decoration-fg-subtle/60",
                )}
              >
                <span>{show(s.start)}</span>
                {s.label ? <span className={cn("text-[10.5px] font-normal leading-none", checked ? "text-accent-fg/80" : "text-fg-subtle")}>{s.label}</span> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});
