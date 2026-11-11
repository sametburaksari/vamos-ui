"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import type { L, ReasonId, SiteLocale } from "./content";

export interface VisitDraft {
  reason: ReasonId;
  childName: string;
  dob: string | null;
  day: string | null;
  time: string | null;
  /** Which check-up on the path the visit is for ("m9"), when it came from the planner. */
  stop: string | null;
}

interface VisitContextValue {
  locale: SiteLocale;
  t: (v: L) => string;
  draft: VisitDraft;
  update: (patch: Partial<VisitDraft>) => void;
  /** Open the booking page with some fields already filled. */
  start: (preset?: Partial<VisitDraft>) => void;
  reset: () => void;
}

const VisitContext = React.createContext<VisitContextValue | null>(null);

export function useVisit() {
  const ctx = React.useContext(VisitContext);
  if (!ctx) throw new Error("useVisit must be used inside <VisitProvider>.");
  return ctx;
}

const EMPTY: VisitDraft = { reason: "checkup", childName: "", dob: null, day: null, time: null, stop: null };

/** The child and the visit being booked, above the EN / TR switch so a language change keeps them. */
export function VisitProvider({ children }: { children: React.ReactNode }) {
  const { locale: shellLocale, navigate } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const [draft, setDraft] = React.useState<VisitDraft>(EMPTY);

  const value = React.useMemo<VisitContextValue>(
    () => ({
      locale,
      t: (v) => v[locale],
      draft,
      update: (patch) => setDraft((d) => ({ ...d, ...patch })),
      start: (preset) => {
        setDraft((d) => ({ ...d, day: null, time: null, stop: null, ...preset }));
        navigate({ page: "book" });
      },
      reset: () => setDraft((d) => ({ ...EMPTY, childName: d.childName, dob: d.dob })),
    }),
    [locale, draft, navigate],
  );
  return <VisitContext.Provider value={value}>{children}</VisitContext.Provider>;
}
