import * as React from "react";
import { Star } from "lucide-react";
import { createFormatter } from "../../format/core";
import { cn2 as cn } from "./shared/kit-2";
import { BlockLink } from "../block-link";
import type { BlockAdapters } from "../types";
import { commerceText, type CommerceBlockLabels } from "./shared/labels-commerce";

export type StarRatingSize = "sm" | "md" | "lg";

const DISPLAY_SIZE: Record<StarRatingSize, string> = { sm: "size-3.5", md: "size-4", lg: "size-5" };
const INPUT_SIZE: Record<StarRatingSize, string> = { sm: "size-6", md: "size-8", lg: "size-10" };
const TEXT_SIZE: Record<StarRatingSize, string> = { sm: "text-xs", md: "text-small", lg: "text-body" };

/** Clamps to 0…max and snaps to the step (0.5 = half stars). */
const snap = (v: number, max: number, step: number) => Math.min(max, Math.max(0, Math.round(v / step) * step));

const oneDecimal = (n: number, locale: string) => createFormatter(locale).number(n, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export interface StarRatingProps {
  /** The rating, e.g. 4.6. Clamped to 0…max. */
  value: number;
  /** Number of stars. Default 5. */
  max?: number;
  /** Visual fill precision: 0.5 = half stars (default), 0.1 = tenths, 1 = whole stars. The text label stays exact. */
  step?: 0.1 | 0.5 | 1;
  size?: StarRatingSize;
  /** Show the average as text after the stars ("4.6"). */
  showValue?: boolean;
  /** Number of reviews, shown as "128 reviews". */
  count?: number;
  /** Turns the count into a link (to the reviews section). */
  countHref?: string;
  /** Overrides the accessible label ("Rated 4.6 out of 5"). */
  label?: string;
  className?: string;
  labels?: CommerceBlockLabels;
  locale?: string;
  components?: BlockAdapters;
}

/**
 * Read-only stars with a text alternative: `role="img"` and "Rated 4.5 out of 5", half stars,
 * optional average and review count. Server component, no JS. Stars fill from the inline start, so
 * they mirror in RTL.
 *
 * ```tsx
 * <StarRating value={4.6} count={128} showValue countHref="#reviews" />
 * ```
 */
export function StarRating({ value, max = 5, step = 0.5, size = "md", showValue, count, countHref, label, className, labels, locale = "en-US", components }: StarRatingProps) {
  const t = commerceText(labels, locale);
  const exact = Math.min(max, Math.max(0, value));
  const shown = snap(value, max, step);
  const valueText = oneDecimal(exact, locale);
  const countText = count !== undefined ? t("ratingCount", { count }) : null;
  const s = DISPLAY_SIZE[size];

  return (
    <span className={cn("vb-stars inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-fg", TEXT_SIZE[size], className)} data-size={size}>
      <span role="img" aria-label={label ?? t("ratingValue", { rating: valueText, max })} className="inline-flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const fill = Math.max(0, Math.min(1, shown - i));
          return (
            <span key={i} aria-hidden className={cn("relative inline-flex shrink-0", s)}>
              <Star strokeWidth={1.5} className={cn("absolute inset-0 text-fg-subtle", s)} />
              {fill > 0 ? (
                <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star strokeWidth={1.5} className={cn("vb-star-glyph fill-current", s)} />
                </span>
              ) : null}
            </span>
          );
        })}
      </span>
      {showValue ? (
        <span aria-hidden className="tabular font-medium">
          {valueText}
        </span>
      ) : null}
      {countText ? (
        countHref ? (
          <BlockLink href={countHref} components={components} labels={labels} locale={locale} className="tabular rounded-[2px] text-fg-muted underline decoration-line underline-offset-[0.25em] focus-ring hover:text-fg hover:decoration-current">
            {countText}
          </BlockLink>
        ) : (
          <span className="tabular text-fg-muted">{showValue ? `(${countText})` : countText}</span>
        )
      ) : null}
    </span>
  );
}

export interface StarRatingInputProps {
  /** Form field name. Default: an auto id (the value is still readable through `onValueChange`). */
  name?: string;
  /** Controlled value (0 = no rating yet). */
  value?: number;
  /** Uncontrolled initial value. */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Number of stars. Default 5. */
  max?: number;
  /** Half-star steps: two radios per star (0.5, 1, 1.5…). */
  allowHalf?: boolean;
  /** Default `"md"` (32px stars). `"sm"` keeps the 24px minimum target for whole stars. */
  size?: StarRatingSize;
  /** The question ("How was the delivery?"). Default "Rating". */
  label?: React.ReactNode;
  /** Keep the label for screen readers only. */
  hideLabel?: boolean;
  /** Small text under the label. */
  description?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Associates the radios with a form elsewhere on the page. */
  form?: string;
  id?: string;
  className?: string;
  labels?: CommerceBlockLabels;
  locale?: string;
}

/**
 * Star input as a native radio group in a `<fieldset>`: one tab stop, arrow keys move between
 * values, each radio is named ("4 stars", "4.5 stars"), and it posts with the surrounding form.
 * Hover and checked fills are CSS (`styles/commerce.css`); no JS unless you pass `onValueChange`.
 *
 * ```tsx
 * <StarRatingInput name="rating" label="How would you rate it?" allowHalf onValueChange={setRating} />
 * ```
 */
export function StarRatingInput({
  name,
  value,
  defaultValue,
  onValueChange,
  max = 5,
  allowHalf,
  size = "md",
  label,
  hideLabel,
  description,
  required,
  disabled,
  form,
  id,
  className,
  labels,
  locale = "en-US",
}: StarRatingInputProps) {
  const t = commerceText(labels, locale);
  const auto = React.useId();
  const base = id ?? `stars-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const fieldName = name ?? base;
  const step = allowHalf ? 0.5 : 1;
  const options = Array.from({ length: max / step }, (_, i) => (i + 1) * step);
  const controlled = value !== undefined;
  const s = INPUT_SIZE[size];
  const nf = createFormatter(locale);

  return (
    <fieldset id={base} disabled={disabled} className={cn("vb-stars-input m-0 flex min-w-0 flex-col gap-2 border-0 p-0", className)} data-size={size} data-half={allowHalf ? "" : undefined} data-disabled={disabled ? "" : undefined} aria-describedby={description ? `${base}-desc` : undefined}>
      <legend className={cn(hideLabel ? "sr-only" : "mb-2 text-sm font-medium text-fg")}>
        {label ?? t("ratingInput")}
        {required ? <span aria-hidden className="ms-0.5 text-danger-ink">*</span> : null}
      </legend>
      {description ? (
        <p id={`${base}-desc`} className="-mt-1 text-small text-fg-muted">
          {description}
        </p>
      ) : null}
      <div className="vb-stars-row inline-flex w-fit items-center">
        {options.map((v) => {
          const half = allowHalf ? (v % 1 === 0 ? "end" : "start") : undefined;
          const checkedProps = controlled ? { checked: value === v, ...(onValueChange ? null : { readOnly: true }) } : { defaultChecked: defaultValue === v };
          return (
            <label key={v} className="vb-star-opt relative inline-block shrink-0 cursor-pointer overflow-hidden" data-half={half}>
              <input
                type="radio"
                name={fieldName}
                value={String(v)}
                required={required}
                form={form}
                className="sr-only"
                onChange={onValueChange ? (e) => e.currentTarget.checked && onValueChange(v) : undefined}
                {...checkedProps}
              />
              <span className="sr-only">{t("ratingStars", { value: nf.number(v, { maximumFractionDigits: 1 }) })}</span>
              <span aria-hidden className={cn("vb-star-box absolute top-0", s, half === "end" ? "end-0" : "start-0")}>
                <Star strokeWidth={1.5} className={cn("absolute inset-0 text-fg-subtle", s)} />
                <Star strokeWidth={1.5} className={cn("vb-star-fill absolute inset-0 fill-current text-fg", s)} />
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
