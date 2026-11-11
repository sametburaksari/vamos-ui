"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { goals, type GoalId, type L, type Mode, type ProgrammeId, type SiteLocale, type Support } from "./content";

interface PlanContextValue {
  locale: SiteLocale;
  t: (v: L) => string;
  goal: GoalId;
  setGoal: (g: GoalId) => void;
  support: Support;
  setSupport: (s: Support) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  /** The programme shown in the result card (the goal's first by default). */
  programme: ProgrammeId;
  setProgramme: (p: ProgrammeId) => void;
}

const PlanContext = React.createContext<PlanContextValue | null>(null);

export function usePlan() {
  const ctx = React.useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside <PlanProvider>.");
  return ctx;
}

/**
 * The picker's answers live above the EN / TR switch, so the home picker, the programmes page
 * and the booking form share them and a language change keeps them.
 */
export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { locale: shellLocale } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const [goal, setGoalState] = React.useState<GoalId>("weight");
  const [support, setSupport] = React.useState<Support>("standard");
  const [mode, setMode] = React.useState<Mode>("clinic");
  const [programme, setProgramme] = React.useState<ProgrammeId>(goals.weight.programmes[0]);
  const setGoal = React.useCallback((g: GoalId) => {
    setGoalState(g);
    setProgramme(goals[g].programmes[0]);
  }, []);
  const value = React.useMemo<PlanContextValue>(
    () => ({ locale, t: (v) => v[locale], goal, setGoal, support, setSupport, mode, setMode, programme, setProgramme }),
    [locale, goal, setGoal, support, mode, programme],
  );
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
