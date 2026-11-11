"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import type { GroupId, L, SiteLocale } from "./content";

interface SchoolContextValue {
  locale: SiteLocale;
  t: (v: L) => string;
  /** The age group shown in the daily rhythm (and suggested on the enrol form). */
  group: GroupId;
  setGroup: (g: GroupId) => void;
}

const SchoolContext = React.createContext<SchoolContextValue | null>(null);

export function useSchool() {
  const ctx = React.useContext(SchoolContext);
  if (!ctx) throw new Error("useSchool must be used inside <SchoolProvider>.");
  return ctx;
}

/** Group choice above the EN / TR switch, so changing language or page keeps it. */
export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const { locale: shellLocale } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const [group, setGroup] = React.useState<GroupId>("saplings");
  const value = React.useMemo<SchoolContextValue>(() => ({ locale, t: (v) => v[locale], group, setGroup }), [locale, group]);
  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
}
