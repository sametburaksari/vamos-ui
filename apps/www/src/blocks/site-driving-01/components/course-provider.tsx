"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import type { CourseId, L, LicenceId, SiteLocale } from "./content";

interface CourseContextValue {
  locale: SiteLocale;
  t: (v: L) => string;
  licence: LicenceId;
  setLicence: (l: LicenceId) => void;
  course: CourseId;
  setCourse: (c: CourseId) => void;
  /** Lessons per week the learner can manage (drives the weeks-to-test row). */
  perWeek: number;
  setPerWeek: (n: number) => void;
  /** Go to sign-up with a course (and optionally a licence) chosen. */
  signUp: (course?: CourseId, licence?: LicenceId) => void;
}

const CourseContext = React.createContext<CourseContextValue | null>(null);

export function useCourse() {
  const ctx = React.useContext(CourseContext);
  if (!ctx) throw new Error("useCourse must be used inside <CourseProvider>.");
  return ctx;
}

/** Licence, chosen course and pace: above the EN / TR switch so a language change keeps them. */
export function CourseProvider({ children }: { children: React.ReactNode }) {
  const { locale: shellLocale, navigate } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const [licence, setLicence] = React.useState<LicenceId>("manual");
  const [course, setCourse] = React.useState<CourseId>("standard");
  const [perWeek, setPerWeek] = React.useState(3);

  const value = React.useMemo<CourseContextValue>(
    () => ({
      locale,
      t: (v) => v[locale],
      licence,
      setLicence,
      course,
      setCourse,
      perWeek,
      setPerWeek,
      signUp: (c, l) => {
        if (c) setCourse(c);
        if (l) setLicence(l);
        navigate({ page: "signup" });
      },
    }),
    [locale, licence, course, perWeek, navigate],
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}
