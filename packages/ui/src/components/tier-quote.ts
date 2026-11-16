import type * as React from "react";

export interface PriceTier {
  /** First quantity of the tier. Tiers are read in ascending `min` order; a tier runs to the next tier's `min` − 1. */
  min: number;
  /** Price per unit in this tier. */
  price: number;
  /** Optional tier name: "Trade", "Pallet". */
  label?: React.ReactNode;
}

export interface TierQuote {
  /** Index of the tier `quantity` falls in; −1 below the first tier's minimum. */
  index: number;
  tier: PriceTier | null;
  next: PriceTier | null;
  /** Units still needed for the next tier (0 when there is none). */
  more: number;
  unitPrice: number;
  total: number;
  /** Saved against the first tier's price for the same quantity. */
  saved: number;
}

/** Pure: the tier, price and next break for a quantity. Tiers are sorted by `min` first. */
export function tierQuote(tiers: PriceTier[], quantity: number): TierQuote {
  const sorted = [...tiers].sort((a, b) => a.min - b.min);
  let index = -1;
  sorted.forEach((t, i) => {
    if (quantity >= t.min) index = i;
  });
  const tier = index >= 0 ? sorted[index]! : null;
  const next = sorted[index + 1] ?? null;
  const unitPrice = tier?.price ?? sorted[0]?.price ?? 0;
  const total = Math.max(0, quantity) * unitPrice;
  const saved = Math.max(0, ((sorted[0]?.price ?? unitPrice) - unitPrice) * Math.max(0, quantity));
  return { index, tier, next, more: next ? next.min - quantity : 0, unitPrice, total, saved };
}
