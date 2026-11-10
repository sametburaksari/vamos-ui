"use client";

import * as React from "react";
import { AlertTriangle, Check, Minus } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { Spinner } from "./spinner";

const stepperLabels = {
  label: "Progress",
  step: "Step {current} of {total}",
  optional: "Optional",
  complete: "Completed",
  current: "Current",
  error: "Needs attention",
  skipped: "Skipped",
};
type StepperLabels = Partial<typeof stepperLabels>;

export type StepStatus = "upcoming" | "current" | "complete" | "error" | "skipped";

export interface StepItem {
  /** Stable key. Defaults to the index. */
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Overrides the status derived from `value` (e.g. `"error"` from validation, `"skipped"`). */
  status?: StepStatus;
  /** Shows an "Optional" note under the title. */
  optional?: boolean;
  /** Replaces the number in the indicator (upcoming / current steps). */
  icon?: React.ReactNode;
  /** Never clickable. */
  disabled?: boolean;
  /** Vertical only: content shown under the current step. */
  content?: React.ReactNode;
}

export interface StepProps extends Omit<StepItem, "content"> {
  /** Vertical only: content shown under this step while it is current. */
  children?: React.ReactNode;
}

/**
 * One step, for the compound API: `<Stepper value={1}><Step title="Upload" /><Step title="Map columns" /></Stepper>`.
 * It only describes the step; `Stepper` renders it.
 */
export function Step(_props: StepProps): React.ReactElement | null {
  return null;
}

type Variant = "numbered" | "dots" | "bar" | "compact";
type Size = "sm" | "md";

export interface StepperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Current step, 0-based. */
  value: number;
  /** Makes navigable steps clickable. Moving between steps doesn't move focus; focus your step heading. */
  onValueChange?: (index: number) => void;
  /** Which steps may be clicked: `"completed"` (default, steps before the current one) · `"all"` · a predicate. */
  navigable?: "completed" | "all" | ((index: number) => boolean);
  orientation?: "horizontal" | "vertical";
  /** `numbered` (default) · `dots` · `bar` (segments) · `compact` ("Step 2 of 4 · Map columns" + thin bar). */
  variant?: Variant;
  size?: Size;
  /** Data-driven steps. Or pass `<Step>` children. */
  steps?: StepItem[];
  /** Spinner in the current step's indicator (e.g. while validating). */
  loading?: boolean;
  /** Horizontal steppers switch to `compact` below 640px. Default `true`. */
  responsive?: boolean;
  labels?: StepperLabels;
  children?: React.ReactNode;
}

const indicatorSize = { sm: "size-6 text-[11px] [&_svg]:size-3", md: "size-7 text-xs [&_svg]:size-3.5" } as const;

export interface StepIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StepStatus;
  /** 1-based number shown for upcoming / current steps. */
  number?: number;
  icon?: React.ReactNode;
  loading?: boolean;
  size?: Size;
}

/** The circle: number, check, warning or spinner. Decorative (`aria-hidden`) — status is in the step's text. */
export function StepIndicator({ status, number, icon, loading, size = "md", className, ...props }: StepIndicatorProps) {
  return (
    <span
      aria-hidden
      data-slot="step-indicator"
      data-status={status}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold tabular transition-[background-color,box-shadow,color] duration-200",
        indicatorSize[size],
        status === "complete" && "bg-accent text-accent-fg",
        status === "current" && "bg-surface text-fg shadow-[0_0_0_1.5px_var(--accent-ink),0_0_0_5px_var(--accent-soft)]",
        status === "upcoming" && "text-fg-subtle shadow-[inset_0_0_0_1.5px_var(--track)]",
        status === "error" && "tone-danger tone-soft shadow-[inset_0_0_0_1.5px_var(--danger)]",
        status === "skipped" && "border-[1.5px] border-dashed border-field-border text-fg-subtle",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner size="xs" />
      ) : status === "complete" ? (
        <Check strokeWidth={3} />
      ) : status === "error" ? (
        <AlertTriangle strokeWidth={2.5} />
      ) : status === "skipped" ? (
        <Minus strokeWidth={2.5} />
      ) : (
        (icon ?? number)
      )}
    </span>
  );
}

interface ResolvedStep extends StepItem {
  index: number;
  status: StepStatus;
  clickable: boolean;
  key: string;
}

/**
 * Shows position and status in an ordered process (wizards, import flows, approvals, checkout).
 * Display and navigation only — form state belongs to the consumer.
 *
 * ```tsx
 * <Stepper value={1} steps={[{ title: "Upload" }, { title: "Map columns" }, { title: "Review" }, { title: "Import" }]} />
 * <Stepper value={step} onValueChange={setStep} orientation="vertical">
 *   <Step title="Company details">…form…</Step>
 *   <Step title="Billing" optional />
 * </Stepper>
 * ```
 *
 * An ordered list; the current step has `aria-current="step"` and every step's name includes its
 * position and status ("Step 2 of 4, Map columns, current").
 */
export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  {
    value,
    onValueChange,
    navigable = "completed",
    orientation = "horizontal",
    variant = "numbered",
    size = "md",
    steps: stepsProp,
    loading,
    responsive = true,
    labels,
    className,
    children,
    "aria-label": ariaLabel,
    ...props
  },
  ref,
) {
  const t = useLabels("stepper", stepperLabels, labels);
  const raw: StepItem[] =
    stepsProp ??
    React.Children.toArray(children)
      .filter((c): c is React.ReactElement<StepProps> => React.isValidElement(c) && c.type === Step)
      .map(({ props: { children: content, ...rest } }) => ({ ...rest, content }));

  const total = raw.length;
  const canNavigate = (i: number, status: StepStatus) =>
    typeof navigable === "function" ? navigable(i) : navigable === "all" ? true : i < value || status === "complete";
  const steps: ResolvedStep[] = raw.map((s, i) => {
    const status: StepStatus = s.status ?? (i < value ? "complete" : i === value ? "current" : "upcoming");
    return { ...s, index: i, status, key: s.id ?? String(i), clickable: Boolean(onValueChange) && !s.disabled && i !== value && canNavigate(i, status) };
  });
  const statusWord = (s: StepStatus) => (s === "upcoming" ? "" : t(s === "complete" ? "complete" : s));
  const name = (s: ResolvedStep) => ({
    before: `${t("step", { current: s.index + 1, total })}, `,
    after: statusWord(s.status) ? `, ${statusWord(s.status)}` : "",
  });

  const effective: Variant = orientation === "vertical" && variant === "bar" ? "numbered" : variant;
  const showCompactOnMobile = responsive && orientation === "horizontal" && effective !== "compact";
  const current = steps[Math.min(Math.max(value, 0), Math.max(total - 1, 0))];

  const compact = current ? (
    <div data-slot="stepper-compact" className={cn("flex flex-col gap-2", showCompactOnMobile && "sm:hidden")}>
      <p className="flex min-w-0 items-baseline gap-1.5 text-[13px]">
        <span className="tabular shrink-0 text-fg-muted">{t("step", { current: current.index + 1, total })}</span>
        <span aria-hidden className="text-fg-subtle">
          ·
        </span>
        <span className="truncate font-medium text-fg">{current.title}</span>
        {current.status === "error" ? <span className="shrink-0 text-danger">{t("error")}</span> : null}
      </p>
      <span aria-hidden className="block h-1 overflow-hidden rounded-full bg-track">
        <span className="block h-full rounded-full bg-accent transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${((current.index + 1) / total) * 100}%` }} />
      </span>
    </div>
  ) : null;

  const renderTrigger = (s: ResolvedStep, inner: React.ReactNode, extra?: string) => {
    const n = name(s);
    const body = (
      <>
        <span className="sr-only">{n.before}</span>
        {inner}
        {n.after ? <span className="sr-only">{n.after}</span> : null}
      </>
    );
    return s.clickable ? (
      <button
        type="button"
        data-slot="step-trigger"
        onClick={() => onValueChange?.(s.index)}
        className={cn("group/step -m-1 flex min-w-0 items-start gap-3 rounded-ui-sm p-1 text-start outline-none focus-ring", extra)}
      >
        {body}
      </button>
    ) : (
      <div data-slot="step-trigger" className={cn("flex min-w-0 items-start gap-3", extra)}>
        {body}
      </div>
    );
  };

  const text = (s: ResolvedStep, opts: { hideTitle?: boolean } = {}) => (
    <span className={cn("flex min-w-0 flex-col", size === "sm" ? "gap-0 pt-0.5" : "gap-0.5 pt-1", opts.hideTitle && "sr-only")}>
      <span
        data-slot="step-title"
        className={cn(
          "font-medium leading-tight",
          size === "sm" ? "text-[13px]" : "text-sm",
          s.status === "upcoming" || s.status === "skipped" ? "text-fg-muted" : "text-fg",
          s.status === "error" && "text-danger",
          s.clickable && "group-hover/step:underline group-hover/step:decoration-line group-hover/step:underline-offset-4",
        )}
      >
        {s.title}
      </span>
      {s.optional ? <span className="text-xs text-fg-subtle">{t("optional")}</span> : null}
      {s.description ? <span className={cn("text-fg-subtle", size === "sm" ? "text-xs" : "text-[13px]")}>{s.description}</span> : null}
    </span>
  );

  const listLabel = ariaLabel ?? t("label");
  const passed = (s: ResolvedStep) => s.index < value && s.status !== "error";
  const connectorTop = size === "sm" ? "mt-3" : "mt-3.5";
  let list: React.ReactNode = null;

  if (effective === "numbered" && orientation === "horizontal") {
    list = (
      <ol aria-label={listLabel} className={cn("flex items-start gap-3", showCompactOnMobile && "max-sm:hidden")}>
        {steps.map((s, i) => (
          <li key={s.key} data-status={s.status} aria-current={s.status === "current" || i === value ? "step" : undefined} className="flex min-w-0 flex-auto items-start gap-3 last:flex-none">
            {renderTrigger(s, <><StepIndicator status={s.status} number={i + 1} icon={s.icon} loading={loading && i === value} size={size} />{text(s)}</>, "min-w-min")}
            {i < total - 1 ? (
              <span aria-hidden className={cn("h-px min-w-6 flex-1 transition-colors duration-300", connectorTop, passed(s) ? "bg-accent-ink" : "bg-line")} />
            ) : null}
          </li>
        ))}
      </ol>
    );
  } else if (effective === "numbered" || (effective === "dots" && orientation === "vertical")) {
    const dots = effective === "dots";
    list = (
      <ol aria-label={listLabel} className="flex flex-col">
        {steps.map((s, i) => (
          <li key={s.key} data-status={s.status} aria-current={i === value ? "step" : undefined} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
            <span className="flex flex-col items-center">
              {dots ? (
                <span aria-hidden className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", dotClass(s.status))} />
              ) : (
                <StepIndicator
                  status={s.status}
                  number={i + 1}
                  icon={s.icon}
                  loading={loading && i === value}
                  size={size}
                  onClick={s.clickable ? () => onValueChange?.(s.index) : undefined}
                  className={s.clickable ? "cursor-pointer" : undefined}
                />
              )}
              {i < total - 1 ? <span aria-hidden className={cn("my-1.5 w-px min-h-5 flex-1 transition-colors duration-300", passed(s) ? "bg-accent-ink" : "bg-line")} /> : null}
            </span>
            <div className={cn("min-w-0", i < total - 1 && (size === "sm" ? "pb-4" : "pb-6"))}>
              {renderTrigger(s, text(s), dots ? "-mt-0.5" : undefined)}
              {i === value && s.content ? (
                <div data-slot="step-content" className={cn("pt-3", size === "sm" ? "text-[13px]" : "text-sm")}>
                  {s.content}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    );
  } else if (effective === "dots") {
    list = (
      <ol aria-label={listLabel} className={cn("flex items-center gap-2", showCompactOnMobile && "max-sm:hidden")}>
        {steps.map((s, i) => (
          <li key={s.key} data-status={s.status} aria-current={i === value ? "step" : undefined} className="flex flex-1 items-center gap-2 last:flex-none">
            {renderTrigger(
              s,
              <>
                <span aria-hidden title={typeof s.title === "string" ? s.title : undefined} className={cn("block h-2.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none", i === value ? "w-6" : "w-2.5", dotClass(s.status))} />
                {text(s, { hideTitle: true })}
              </>,
              "items-center p-1.5 -m-1.5",
            )}
            {i < total - 1 ? <span aria-hidden className={cn("h-px min-w-3 flex-1", passed(s) ? "bg-accent-ink" : "bg-line")} /> : null}
          </li>
        ))}
      </ol>
    );
  } else if (effective === "bar") {
    list = (
      <ol aria-label={listLabel} className={cn("grid gap-1.5", showCompactOnMobile && "max-sm:hidden")} style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {steps.map((s, i) => (
          <li key={s.key} data-status={s.status} aria-current={i === value ? "step" : undefined} className="min-w-0">
            {renderTrigger(
              s,
              <span className="flex w-full min-w-0 flex-col gap-2">
                <span aria-hidden className={cn("block h-1 rounded-full transition-colors duration-300", barClass(s.status))} />
                {text(s)}
              </span>,
              "w-full",
            )}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div ref={ref} data-slot="stepper" data-orientation={orientation} data-variant={effective} className={cn("min-w-0", className)} {...props}>
      {effective === "compact" ? (
        <ol aria-label={listLabel} className="sr-only">
          {steps.map((s, i) => (
            <li key={s.key} aria-current={i === value ? "step" : undefined}>
              {name(s).before}
              {s.title}
              {name(s).after}
            </li>
          ))}
        </ol>
      ) : (
        list
      )}
      {effective === "compact" || showCompactOnMobile ? <div aria-hidden={effective === "compact" || undefined}>{compact}</div> : null}
    </div>
  );
});

function dotClass(status: StepStatus) {
  return status === "complete" ? "bg-accent-ink" : status === "current" ? "bg-accent shadow-[0_0_0_1.5px_var(--accent-ink)]" : status === "error" ? "bg-danger" : "bg-track";
}
function barClass(status: StepStatus) {
  return status === "complete"
    ? "bg-accent-ink"
    : status === "current"
      ? "bg-accent"
      : status === "error"
        ? "bg-danger"
        : status === "skipped"
          ? "bg-[repeating-linear-gradient(90deg,var(--track)_0_4px,transparent_4px_7px)]"
          : "bg-track";
}
