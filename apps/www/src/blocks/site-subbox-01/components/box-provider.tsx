"use client";

import * as React from "react";
import type { FreqId, GrindId, RoastId, SizeId } from "./content";

export interface Plan {
  size: SizeId;
  freq: FreqId;
  roast: RoastId;
  grind: GrindId;
}

export const defaultPlan: Plan = { size: "double", freq: "fortnightly", roast: "rotating", grind: "filter" };

interface BoxContextValue {
  plan: Plan;
  setPlan: (patch: Partial<Plan>) => void;
  /** Set after "Start subscription": the order reference. */
  order: string | null;
  placeOrder: () => string;
  resetOrder: () => void;
}

const BoxContext = React.createContext<BoxContextValue | null>(null);

export function useBox() {
  const ctx = React.useContext(BoxContext);
  if (!ctx) throw new Error("useBox must be used inside <BoxProvider>.");
  return ctx;
}

/** The plan being built (shared by the home matrix and the plans page) and the placed order. */
export function BoxProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlanState] = React.useState<Plan>(defaultPlan);
  const [order, setOrder] = React.useState<string | null>(null);
  const value = React.useMemo<BoxContextValue>(
    () => ({
      plan,
      setPlan: (patch) => {
        setOrder(null);
        setPlanState((p) => ({ ...p, ...patch }));
      },
      order,
      placeOrder: () => {
        const code = `BX-${plan.size.slice(0, 1).toUpperCase()}${plan.freq.slice(0, 1).toUpperCase()}-${(4100 + plan.roast.length * 13 + plan.grind.length * 7).toString()}`;
        setOrder(code);
        return code;
      },
      resetOrder: () => setOrder(null),
    }),
    [plan, order],
  );
  return <BoxContext.Provider value={value}>{children}</BoxContext.Provider>;
}
