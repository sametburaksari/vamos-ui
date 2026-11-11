"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { areas, type AreaId, type L, type SiteLocale, type TreatmentId, type View } from "./content";

interface AreaContextValue {
  locale: SiteLocale;
  t: (v: L) => string;
  area: AreaId;
  /** Selecting an area also turns the figure to a side where it is visible. */
  setArea: (a: AreaId) => void;
  view: View;
  setView: (v: View) => void;
  /** Treatment handed to the booking form ("Book" links on any list). */
  treatment: TreatmentId | null;
  setTreatment: (id: TreatmentId | null) => void;
}

const AreaContext = React.createContext<AreaContextValue | null>(null);

export function useArea() {
  const ctx = React.useContext(AreaContext);
  if (!ctx) throw new Error("useArea must be used inside <AreaProvider>.");
  return ctx;
}

/** The chosen body area, above the EN / TR switch: the home selector, treatments and booking share it. */
export function AreaProvider({ children }: { children: React.ReactNode }) {
  const { locale: shellLocale } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const [area, setAreaState] = React.useState<AreaId>("knee");
  const [view, setView] = React.useState<View>("front");
  const [treatment, setTreatment] = React.useState<TreatmentId | null>(null);
  const setArea = React.useCallback((a: AreaId) => {
    setAreaState(a);
    setTreatment(null);
    setView((v) => (areas[a].spot[v] ? v : v === "front" ? "back" : "front"));
  }, []);
  const value = React.useMemo<AreaContextValue>(() => ({ locale, t: (v) => v[locale], area, setArea, view, setView, treatment, setTreatment }), [locale, area, setArea, view, treatment]);
  return <AreaContext.Provider value={value}>{children}</AreaContext.Provider>;
}
