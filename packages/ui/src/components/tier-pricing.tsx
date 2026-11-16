"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { useControllableState } from "../lib/use-controllable-state";
import { NumberInput } from "./formatted-input";
import { tierQuote, type PriceTier } from "./tier-quote";

export const tierPricingLabels = {
  caption: "Price per {unit} by quantity",
  quantity: "Quantity",
  range: "{min}–{max}",
  rangeOpen: "{min}+",
  unitPrice: "Price per {unit}",
  saving: "Saving",
  current: "Your price",
  /** "12 × ₺48.00" */
  line: "{quantity} × {price}",
  total: "Total",
  /** Hint towards the next break. */
  next: "{more} more for {price} per {unit}.",
  best: "You have the best price.",
  /** Before the first tier's minimum. */
  minimum: "Minimum order: {min}.",
  /** Saved against the first tier's price for this quantity. */
  saved: "You save {amount}.",
  /** Accessible name of a tier button that sets the quantity. */
  setQuantity: "Order {min} at {price} per {unit}",
  unit: "unit",
};
export type TierPricingLabels = typeof tierPricingLabels;

// Server-safe: the quote math lives in its own module so server components can call tierQuote().
export { tierQuote, type PriceTier, type TierQuote } from "./tier-quote";

export interface TierPricingProps extends Omit<React.HTMLAttributes<HTMLElement>, "children" | "onChange"> {
  tiers: PriceTier[];
  quantity?: number;
  defaultQuantity?: number;
  /** With it, every tier is a button that sets the quantity to its minimum. */
  onQuantityChange?: (quantity: number) => void;
  /** A number field for the quantity above the tiers. */
  quantityInput?: boolean;
  /** Upper bound of the quantity field. */
  maxQuantity?: number;
  /** `"table"` (default): rows with range, unit price and saving. `"ladder"`: descending steps side by side. */
  variant?: "table" | "ladder";
  /** Unit word in the texts: "case", "box", "seat". Default label `unit`. */
  unit?: string;
  /** How prices read. Default: the provider currency with two fraction digits. */
  formatPrice?: (price: number) => string;
  currency?: string;
  /** Saving per tier against the first tier, as a percentage. Default true. */
  showSaving?: boolean;
  /** The quantity × price line, total and next-break hint. Default true. */
  showSummary?: boolean;
  labels?: Partial<TierPricingLabels>;
}

/**
 * Quantity breaks: a price per unit that drops at set quantities, with the tier the current
 * quantity falls in highlighted, the unit price and total, and how many more units reach the
 * next price ("8 more for ₺42.00 per case."). A table (range, unit price, saving) or a ladder of
 * descending steps; with `onQuantityChange` each tier is a button that jumps to its minimum.
 *
 * ```tsx
 * <TierPricing
 *   unit="case"
 *   tiers={[{ min: 1, price: 52 }, { min: 10, price: 48 }, { min: 50, price: 44 }]}
 *   quantity={qty}
 *   onQuantityChange={setQty}
 *   quantityInput
 * />
 * ```
 */
export const TierPricing = /*#__PURE__*/ React.forwardRef<HTMLElement, TierPricingProps>(function TierPricing(
  {
    tiers,
    quantity: quantityProp,
    defaultQuantity,
    onQuantityChange,
    quantityInput = false,
    maxQuantity,
    variant = "table",
    unit: unitProp,
    formatPrice,
    currency,
    showSaving = true,
    showSummary = true,
    labels,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("tierPricing", tierPricingLabels, labels);
  const f = useFormat();
  const id = React.useId();
  const sorted = React.useMemo(() => [...tiers].sort((a, b) => a.min - b.min), [tiers]);
  const [quantity, setQuantity] = useControllableState({ value: quantityProp, defaultValue: defaultQuantity ?? sorted[0]?.min ?? 1, onChange: onQuantityChange, name: "TierPricing" });
  const q = tierQuote(sorted, quantity);
  const unit = unitProp ?? t("unit");
  const price = (n: number) => (formatPrice ? formatPrice(n) : f.currency(n, currency ?? f.currencyCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const interactive = !!onQuantityChange || quantityInput;
  const top = sorted[0]?.price ?? 0;
  const bottom = sorted[sorted.length - 1]?.price ?? 0;
  const range = (i: number) => {
    const next = sorted[i + 1];
    return next ? (next.min - 1 === sorted[i]!.min ? f.number(sorted[i]!.min) : t("range", { min: f.number(sorted[i]!.min), max: f.number(next.min - 1) })) : t("rangeOpen", { min: f.number(sorted[i]!.min) });
  };
  const saving = (p: number) => (top > 0 && p < top ? `−${f.percent((top - p) / top, { maximumFractionDigits: 0 })}` : "—");
  const captionId = `${id}-caption`;

  const hint =
    q.index < 0 ? t("minimum", { min: f.number(sorted[0]?.min ?? 1) }) : q.next ? t("next", { more: f.number(q.more), price: price(q.next.price), unit }) : t("best");

  const stepButton = (i: number, body: React.ReactNode, cls: string, style?: React.CSSProperties) => {
    const tier = sorted[i]!;
    const active = i === q.index;
    return interactive ? (
      <button type="button" aria-current={active ? "true" : undefined} aria-label={t("setQuantity", { min: f.number(tier.min), price: price(tier.price), unit })} onClick={() => setQuantity(tier.min)} className={cn(cls, "focus-ring hover:bg-hover")} style={style}>
        {body}
      </button>
    ) : (
      <div aria-current={active ? "true" : undefined} className={cls} style={style}>
        {body}
      </div>
    );
  };

  return (
    <figure ref={ref as React.Ref<HTMLElement>} data-slot="tier-pricing" aria-labelledby={captionId} className={cn("m-0 grid min-w-0 gap-3", className)} {...props}>
      <figcaption id={captionId} className="text-xs font-medium tracking-[0.06em] text-fg-muted uppercase">
        {t("caption", { unit })}
      </figcaption>

      {quantityInput ? (
        <label className="flex flex-wrap items-center gap-3 text-sm text-fg">
          <span>{t("quantity")}</span>
          <NumberInput value={quantity} onValueChange={(n) => setQuantity(Math.max(0, n ?? 0))} min={0} max={maxQuantity} precision={0} stepper className="w-36" />
        </label>
      ) : null}

      {variant === "table" ? (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-fg-muted">
              <th scope="col" className="py-2 pe-3 text-start font-medium">
                {t("quantity")}
              </th>
              <th scope="col" className="py-2 pe-3 text-end font-medium">
                {t("unitPrice", { unit })}
              </th>
              {showSaving ? (
                <th scope="col" className="py-2 text-end font-medium">
                  {t("saving")}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {sorted.map((tier, i) => {
              const active = i === q.index;
              return (
                <tr key={tier.min} data-tier={i} aria-current={active ? "true" : undefined} className={cn("border-b border-line", active && "bg-accent-soft")}>
                  <th scope="row" className="py-2.5 ps-2 pe-3 text-start font-normal">
                    {interactive ? (
                      <button type="button" className="rounded-ui-sm text-start text-fg underline-offset-4 focus-ring hover:underline" aria-label={t("setQuantity", { min: f.number(tier.min), price: price(tier.price), unit })} onClick={() => setQuantity(tier.min)}>
                        <span className="font-mono tabular">{range(i)}</span>
                        {tier.label ? <span className="ms-2 text-fg-muted">{tier.label}</span> : null}
                      </button>
                    ) : (
                      <>
                        <span className="font-mono text-fg tabular">{range(i)}</span>
                        {tier.label ? <span className="ms-2 text-fg-muted">{tier.label}</span> : null}
                      </>
                    )}
                    {active ? <span className="ms-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-fg">{t("current")}</span> : null}
                  </th>
                  <td className={cn("py-2.5 pe-3 text-end font-mono tabular", active ? "font-semibold text-accent-ink" : "text-fg")}>{price(tier.price)}</td>
                  {showSaving ? <td className="py-2.5 pe-2 text-end font-mono text-fg-muted tabular">{saving(tier.price)}</td> : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <ol className="m-0 grid list-none items-end gap-1 p-0" style={{ gridTemplateColumns: `repeat(${sorted.length}, minmax(0, 1fr))` }}>
          {sorted.map((tier, i) => {
            const active = i === q.index;
            const passed = i < q.index;
            const rise = top === bottom ? 0 : ((tier.price - bottom) / (top - bottom)) * 2.75;
            const body = (
              <>
                <span className={cn("truncate text-[11px] font-medium", active ? "text-accent-fg" : "text-fg-muted")}>{tier.label ?? range(i)}</span>
                <span className="font-mono text-base leading-none font-semibold tabular">{price(tier.price)}</span>
                {tier.label ? <span className={cn("truncate font-mono text-[11px] tabular", active ? "text-accent-fg" : "text-fg-subtle")}>{range(i)}</span> : null}
              </>
            );
            return (
              <li key={tier.min} data-tier={i} className="flex min-w-0" style={{ height: `${5 + rise}rem` }}>
                {stepButton(
                  i,
                  body,
                  cn(
                    "flex w-full min-w-0 flex-col justify-end gap-1 overflow-hidden rounded-t-ui-sm border-t-2 p-2 text-start transition-colors motion-reduce:transition-none",
                    active ? "border-accent bg-accent text-accent-fg" : passed ? "border-line bg-surface-2 text-fg-muted" : "border-fg bg-surface-2 text-fg",
                  ),
                )}
              </li>
            );
          })}
        </ol>
      )}

      {showSummary ? (
        <div className="grid gap-1 border-t border-line pt-3 text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="font-mono text-fg-muted tabular">{t("line", { quantity: f.number(Math.max(0, quantity)), price: price(q.unitPrice) })}</span>
            <span className="flex items-baseline gap-2">
              <span className="text-xs text-fg-muted">{t("total")}</span>
              <span className="font-mono text-lg font-semibold text-fg tabular" data-slot="tier-total">
                {price(q.total)}
              </span>
            </span>
          </div>
          <p className={cn("m-0", q.next || q.index < 0 ? "text-fg" : "text-accent-ink")} aria-live="polite" data-slot="tier-hint">
            {q.saved > 0 ? <span className="me-1.5 font-medium text-accent-ink">{t("saved", { amount: price(q.saved) })}</span> : null}
            {hint}
          </p>
        </div>
      ) : null}
    </figure>
  );
});
