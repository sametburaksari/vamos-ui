"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { estimate, serviceById, type Estimate, type L, type SiteLocale, type VehicleId } from "./content";

interface JobContextValue {
  locale: SiteLocale;
  t: (v: L) => string;
  vehicle: VehicleId;
  setVehicle: (v: VehicleId) => void;
  selected: string[];
  toggle: (id: string, on?: boolean) => void;
  clear: () => void;
  est: Estimate;
  /** Drop-off day (YYYY-MM-DD) and time (HH:mm). */
  day: string | null;
  time: string | null;
  setDropOff: (patch: { day?: string | null; time?: string | null }) => void;
  /** Go to the booking page with the current job. */
  book: () => void;
}

const JobContext = React.createContext<JobContextValue | null>(null);

export function useJob() {
  const ctx = React.useContext(JobContext);
  if (!ctx) throw new Error("useJob must be used inside <JobProvider>.");
  return ctx;
}

/** The job being built: above the EN / TR switch so changing language keeps it. */
export function JobProvider({ children }: { children: React.ReactNode }) {
  const { locale: shellLocale, navigate } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const [vehicle, setVehicle] = React.useState<VehicleId>("sedan");
  const [selected, setSelected] = React.useState<string[]>(["oil", "express"]);
  const [drop, setDrop] = React.useState<{ day: string | null; time: string | null }>({ day: null, time: null });

  const toggle = React.useCallback((id: string, on?: boolean) => {
    setSelected((prev) => {
      const has = prev.includes(id);
      const want = on ?? !has;
      if (want === has) return prev;
      if (!want) return prev.filter((x) => x !== id);
      const s = serviceById(id);
      // A bundle replaces what it includes; picking an included item drops the bundle.
      const without = prev.filter((x) => !s?.includes?.includes(x) && !serviceById(x)?.includes?.includes(id));
      return [...without, id];
    });
  }, []);

  const value = React.useMemo<JobContextValue>(
    () => ({
      locale,
      t: (v) => v[locale],
      vehicle,
      setVehicle,
      selected,
      toggle,
      clear: () => setSelected([]),
      est: estimate(selected, vehicle),
      day: drop.day,
      time: drop.time,
      setDropOff: (patch) => setDrop((d) => ({ ...d, ...patch })),
      book: () => navigate({ page: "booking" }),
    }),
    [locale, vehicle, selected, toggle, drop, navigate],
  );

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
}
