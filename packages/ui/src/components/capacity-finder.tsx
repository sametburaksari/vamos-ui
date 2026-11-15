"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { useControllableState } from "../lib/use-controllable-state";
import { Slider } from "./slider";
import { ToggleGroup, ToggleGroupItem } from "./toggle";

export const capacityFinderLabels = {
  arrangement: "Layout",
  count: "People",
  countInput: "Number of people",
  /** Live summary when at least one option fits. */
  result: "{fit} of {total} take {count} people {arrangement}.",
  resultNone: "None takes {count} people {arrangement}.",
  /** Appended to `resultNone` when some option can be laid out this way. */
  largest: "The largest is {name}, up to {capacity}.",
  fits: "Fits",
  tooSmall: "Too small",
  unavailable: "Not in this layout",
  upTo: "up to {capacity}",
};
export type CapacityFinderLabels = typeof capacityFinderLabels;

export interface CapacityArrangement {
  id: string;
  /** Button text: "Theatre", "Boardroom". */
  label: string;
  /** Phrase used in the summary: "theatre-style", "around one table". Default: `label`, lower-cased. */
  phrase?: string;
  /** Tooltip on the button. */
  hint?: string;
}

export interface CapacityOption {
  id: string;
  name: string;
  /** Maximum head count per arrangement id. `null` / missing = cannot be laid out that way. */
  capacities: Record<string, number | null | undefined>;
  /** One line under the name — floor, size, price. */
  meta?: React.ReactNode;
  description?: React.ReactNode;
  /** Image or icon above the text. */
  media?: React.ReactNode;
}

export type CapacityStatus = "fits" | "too-small" | "unavailable";

export interface CapacityFit {
  option: CapacityOption;
  status: CapacityStatus;
  capacity: number | null;
}

/** Pure: how each option relates to `count` in `arrangement`. Keeps the input order. */
export function capacityFit(options: CapacityOption[], arrangement: string, count: number): CapacityFit[] {
  return options.map((option) => {
    const capacity = option.capacities[arrangement] ?? null;
    return { option, capacity, status: capacity == null ? "unavailable" : capacity >= count ? "fits" : "too-small" };
  });
}

export interface CapacityFinderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> {
  options: CapacityOption[];
  arrangements: CapacityArrangement[];
  count?: number;
  defaultCount?: number;
  onCountChange?: (count: number) => void;
  arrangement?: string;
  defaultArrangement?: string;
  onArrangementChange?: (arrangement: string) => void;
  /** Slider bounds. `max` defaults to the largest capacity. */
  min?: number;
  max?: number;
  step?: number;
  /** Fitting options first, then too small, then unavailable. Default `false` (input order). */
  sortByFit?: boolean;
  /** Each option's capacity in every arrangement, the current one marked. */
  showAllCapacities?: boolean;
  /** Trailing content per option — "Enquire", "Book", a checkbox. */
  renderAction?: (fit: CapacityFit) => React.ReactNode;
  /** Shown under the summary when nothing fits ("Larger groups: talk to us"). */
  noneFitMessage?: React.ReactNode;
  labels?: Partial<CapacityFinderLabels>;
}

/**
 * Filter a set of options by head count and layout and see which fit and why: rooms by seating
 * style, tables by party size, vehicles by seat configuration, sessions by format. A layout
 * switch and a count slider (with a synced number field) drive a live summary and a list where
 * every option shows its capacity against the number — "Fits · up to 120", "Too small", "Not in
 * this layout".
 *
 * ```tsx
 * <CapacityFinder
 *   arrangements={[{ id: "theatre", label: "Theatre", phrase: "theatre-style" }, { id: "boardroom", label: "Boardroom", phrase: "around one table" }]}
 *   options={[{ id: "north", name: "North Room", capacities: { theatre: 80, boardroom: 24 } }]}
 *   renderAction={({ option }) => <Button size="sm">Book {option.name}</Button>}
 * />
 * ```
 */
export const CapacityFinder = /*#__PURE__*/ React.forwardRef<HTMLDivElement, CapacityFinderProps>(function CapacityFinder(
  {
    options,
    arrangements,
    count: countProp,
    defaultCount,
    onCountChange,
    arrangement: arrangementProp,
    defaultArrangement,
    onArrangementChange,
    min = 1,
    max: maxProp,
    step = 1,
    sortByFit = false,
    showAllCapacities = false,
    renderAction,
    noneFitMessage,
    labels,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("capacityFinder", capacityFinderLabels, labels);
  const f = useFormat();
  const id = React.useId();
  const largestCap = Math.max(min, ...options.flatMap((o) => Object.values(o.capacities).filter((v): v is number => typeof v === "number")));
  const max = maxProp ?? largestCap;
  const [arrangement, setArrangement] = useControllableState({
    value: arrangementProp,
    defaultValue: defaultArrangement ?? arrangements[0]?.id ?? "",
    onChange: onArrangementChange,
    name: "CapacityFinder",
  });
  const [count, setCount] = useControllableState({ value: countProp, defaultValue: defaultCount ?? min, onChange: onCountChange, name: "CapacityFinder" });

  const current = arrangements.find((a) => a.id === arrangement);
  const phrase = current ? (current.phrase ?? current.label.toLocaleLowerCase(f.locale)) : "";
  const fits = capacityFit(options, arrangement, count);
  const order: Record<CapacityStatus, number> = { fits: 0, "too-small": 1, unavailable: 2 };
  const list = sortByFit ? [...fits].sort((a, b) => order[a.status] - order[b.status]) : fits;
  const fitting = fits.filter((x) => x.status === "fits");
  const largest = fits.reduce<CapacityFit | null>((best, x) => (x.capacity != null && (best?.capacity == null || x.capacity > best.capacity) ? x : best), null);
  const n = f.number(count);
  const summary = fitting.length
    ? t("result", { fit: f.number(fitting.length), total: f.number(options.length), count: n, arrangement: phrase })
    : [t("resultNone", { count: n, arrangement: phrase }), largest?.capacity != null ? t("largest", { name: largest.option.name, capacity: f.number(largest.capacity) }) : ""].filter(Boolean).join(" ");

  return (
    <div ref={ref} data-slot="capacity-finder" className={cn("grid min-w-0 gap-5", className)} {...props}>
      <div className="grid gap-x-10 gap-y-5 border-b border-line pb-5 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end">
        <div className="grid min-w-0 gap-2">
          <span id={`${id}-arrangement`} className="text-xs font-medium text-fg-muted">
            {t("arrangement")}
          </span>
          <ToggleGroup aria-labelledby={`${id}-arrangement`} value={arrangement} onValueChange={setArrangement} className="max-w-full flex-wrap">
            {arrangements.map((a) => (
              <ToggleGroupItem key={a.id} value={a.id} title={a.hint}>
                {a.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="grid min-w-0 gap-2">
          <span aria-hidden="true" className="text-xs font-medium text-fg-muted">
            {t("count")}
          </span>
          <Slider value={[count]} onValueChange={(v) => setCount(v[0] ?? count)} min={min} max={max} step={step} withInputs thumbLabels={[t("countInput")]} />
        </div>
      </div>

      <div className="grid gap-1.5">
        <p className="m-0 text-h3 font-semibold text-fg" aria-live="polite" data-slot="capacity-summary">
          {summary}
        </p>
        {!fitting.length && noneFitMessage ? <div className="text-small text-fg-muted">{noneFitMessage}</div> : null}
      </div>

      <ul className="m-0 grid list-none gap-0 p-0" data-slot="capacity-options">
        {list.map((x) => {
          const pct = x.capacity ? Math.min(100, (count / x.capacity) * 100) : 0;
          const statusText = x.status === "unavailable" ? t("unavailable") : `${t(x.status === "fits" ? "fits" : "tooSmall")} · ${t("upTo", { capacity: f.number(x.capacity!) })}`;
          return (
            <li key={x.option.id} data-option={x.option.id} data-status={x.status} className="grid gap-3 border-b border-line py-4">
              {x.option.media ? <div className={cn("overflow-hidden rounded-ui transition-opacity motion-reduce:transition-none", x.status !== "fits" && "opacity-60")}>{x.option.media}</div> : null}
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="m-0 text-base font-semibold text-fg">{x.option.name}</h3>
                {x.option.meta ? <span className="text-xs text-fg-muted">{x.option.meta}</span> : null}
              </div>
              {x.option.description ? <div className="text-small text-fg-muted">{x.option.description}</div> : null}
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-track">
                  <div className={cn("h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none", x.status === "fits" ? "bg-accent" : "bg-fg-subtle")} style={{ width: `${pct}%` }} />
                </div>
                <span className={cn("text-xs font-medium tabular", x.status === "fits" ? "text-accent-ink" : "text-fg-muted")}>{statusText}</span>
              </div>
              {showAllCapacities ? (
                <dl className="m-0 grid grid-cols-3 gap-px overflow-hidden rounded-ui-sm border border-line bg-line text-center sm:grid-cols-6">
                  {arrangements.map((a) => (
                    <div key={a.id} data-current={a.id === arrangement ? "" : undefined} className={cn("bg-surface px-1 py-2", a.id === arrangement && "bg-accent-soft")}>
                      <dt className="truncate text-[11px] text-fg">{a.label}</dt>
                      <dd className="m-0 font-mono text-sm text-fg tabular">{x.option.capacities[a.id] != null ? f.number(x.option.capacities[a.id]!) : "—"}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {renderAction ? <div className="flex flex-wrap items-center justify-end gap-3">{renderAction(x)}</div> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
});
