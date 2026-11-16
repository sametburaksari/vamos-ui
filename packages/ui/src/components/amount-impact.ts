import type * as React from "react";
import type { AmountOption } from "./amount-picker";

/** Impact of the largest preset at or below `amount` (presets sorted by value first). */
export function impactFor(options: AmountOption[], amount: number | null): React.ReactNode {
  if (amount == null) return null;
  const below = [...options].filter((o) => o.value <= amount && o.impact != null).sort((a, b) => b.value - a.value);
  return below[0]?.impact ?? null;
}
