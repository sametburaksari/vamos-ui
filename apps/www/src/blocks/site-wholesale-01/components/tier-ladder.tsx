"use client";

import * as React from "react";
import { cn } from "@vamos-ui/react";
import { fill, priceAt, TIER_MIN, tierMin, tierNames, tierOf, tierRange, type Product } from "./content";
import { useQuote } from "./quote-provider";

const copy = {
  caption: { en: "Price per {unit}, ex VAT, by cases on this order", tr: "{unit} başı fiyat, KDV hariç, bu siparişteki koli sayısına göre" },
  cases: { en: "cases", tr: "koli" },
  jump: { en: "Order {n} cases ({tier} price)", tr: "{n} koli sipariş et ({tier} fiyatı)" },
  next: { en: "Add {more} more {cases} for {tier}: {price} per {unit} — {save} less on this line.", tr: "{tier} için {more} koli daha ekleyin: {unit} başı {price} — bu satırda {save} daha az." },
  best: { en: "Pallet price reached. For 500+ cases, ask for a contract price.", tr: "Palet fiyatına ulaştınız. 500+ koli için sözleşmeli fiyat isteyin." },
  line: { en: "{cases} cases × {per} = {units} pcs", tr: "{cases} koli × {per} = {units} adet" },
  saved: { en: "{save} under the case price", tr: "Koli fiyatının {save} altında" },
};

/**
 * The signature: a product's four quantity tiers drawn as a descending staircase. The tier the
 * current case count falls in is filled with the accent; every step is a button that sets the
 * count to that tier's minimum; the line under it says how far the next break is and what it
 * saves on this line.
 */
export function TierLadder({
  product,
  cases,
  onCasesChange,
  size = "md",
  className,
}: {
  product: Product;
  cases: number;
  onCasesChange?: (cases: number) => void;
  size?: "md" | "lg";
  className?: string;
}) {
  const { c } = useQuote();
  const { t, lira, liraRound, f } = c;
  const active = tierOf(Math.max(1, cases));
  const unit = t(product.unit);
  const top = priceAt(product, 0);
  const lineTotal = priceAt(product, active) * product.perCase * cases;
  const nextTier = active < TIER_MIN.length - 1 ? active + 1 : null;
  const captionId = React.useId();

  let nudge: string;
  if (nextTier === null) nudge = t(copy.best);
  else {
    const more = tierMin(nextTier) - cases;
    const atNext = priceAt(product, nextTier) * product.perCase * tierMin(nextTier);
    const atNowForSame = priceAt(product, active) * product.perCase * tierMin(nextTier);
    nudge = fill(t(copy.next), {
      more: f.number(more),
      cases: t(copy.cases),
      tier: t(tierNames[nextTier]!),
      price: lira(priceAt(product, nextTier)),
      unit,
      save: liraRound(atNowForSame - atNext),
    });
  }

  return (
    <figure className={cn("flex flex-col gap-3", className)} aria-labelledby={captionId}>
      <figcaption id={captionId} className="font-mono text-[11px] tracking-[0.06em] text-fg-muted uppercase">
        {fill(t(copy.caption), { unit })}
      </figcaption>
      <ol className="grid grid-cols-4 items-end gap-1" role="list">
        {TIER_MIN.map((min, i) => {
          const isActive = i === active;
          const passed = i < active;
          // Step rise above the content: the price relative to the case price, so the steps descend.
          const rise = ((priceAt(product, i) - priceAt(product, 3)) / (top - priceAt(product, 3) || 1)) * (size === "lg" ? 64 : 44);
          const label = fill(t(copy.jump), { n: min, tier: t(tierNames[i]!) });
          const body = (
            <>
              <span className={cn("truncate font-mono text-[10.5px] tracking-[0.05em] uppercase", isActive ? "text-accent-fg/85" : "text-fg-muted")}>{t(tierNames[i]!)}</span>
              <span className={cn("tabular font-display leading-none font-semibold tracking-[-0.02em]", size === "lg" ? "text-[clamp(1.05rem,2.4cqi,1.5rem)]" : "text-[1.05rem]")}>{lira(priceAt(product, i))}</span>
              <span className={cn("tabular truncate font-mono text-[10.5px]", isActive ? "text-accent-fg/85" : "text-fg-subtle")}>
                {tierRange(i)}<span className="hidden @md:inline"> {t(copy.cases)}</span>
              </span>
            </>
          );
          const cls = cn(
            "flex w-full min-w-0 flex-col justify-end gap-1 overflow-hidden rounded-t-[3px] border-t-2 px-2 pt-2 pb-2 text-start transition-[background-color,height] duration-300 motion-reduce:transition-none",
            isActive ? "border-fg bg-accent text-accent-fg" : passed ? "border-line bg-surface-2 text-fg-muted" : "border-fg bg-surface-2 text-fg",
          );
          return (
            <li key={min} style={{ height: `calc(${size === "lg" ? "5.5rem" : "5.25rem"} + ${rise.toFixed(0)}px)` }} className="flex min-w-0">
              {onCasesChange ? (
                <button type="button" title={label} aria-current={isActive ? "step" : undefined} onClick={() => onCasesChange(min)} className={cn(cls, "focus-ring hover:brightness-[0.97]")}>
                  {body}
                </button>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-dashed border-line pt-3 text-small">
        <span className="tabular font-mono text-fg-muted">
          {fill(t(copy.line), { cases: f.number(cases), per: f.number(product.perCase), units: f.number(cases * product.perCase), unit })}
        </span>
        <span className="tabular font-display text-[1.15rem] font-semibold text-fg">{liraRound(lineTotal)}</span>
      </div>
      <p aria-live="polite" className={cn("text-small", nextTier === null ? "text-accent-ink" : "text-fg")}>
        {active > 0 ? <span className="me-1.5 font-medium text-accent-ink">{fill(t(copy.saved), { save: liraRound((top - priceAt(product, active)) * product.perCase * cases) })}.</span> : null}
        {nudge}
      </p>
    </figure>
  );
}
