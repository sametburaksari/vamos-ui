"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { defaultBuild, sessionById, type Build, type L, type SessionId, type SiteLocale } from "./content";

interface BuildContextValue {
  locale: SiteLocale;
  t: (v: L) => string;
  build: Build;
  /** Merge a change; switching the session resets hours, images and people to its base. */
  update: (patch: Partial<Build>) => void;
  /** Load a whole build (presets) and optionally go to a page. */
  load: (build: Build, page?: "packages" | "booking") => void;
  /** True once the visitor has touched the builder or picked a preset. */
  chosen: boolean;
}

const BuildContext = React.createContext<BuildContextValue | null>(null);

export function useBuild() {
  const ctx = React.useContext(BuildContext);
  if (!ctx) throw new Error("useBuild must be used inside <BuildProvider>.");
  return ctx;
}

/** The package being built, above the EN / TR switch so language and page changes keep it. */
export function BuildProvider({ children }: { children: React.ReactNode }) {
  const { locale: shellLocale, navigate } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const [build, setBuild] = React.useState<Build>(() => defaultBuild());
  const [chosen, setChosen] = React.useState(false);

  const value = React.useMemo<BuildContextValue>(
    () => ({
      locale,
      t: (v) => v[locale],
      build,
      chosen,
      update: (patch) => {
        setChosen(true);
        setBuild((b) => {
          if (patch.session && patch.session !== b.session) {
            const s = sessionById(patch.session as SessionId);
            return { ...b, ...patch, hours: s.hours, images: s.images, people: s.people?.included ?? 1 };
          }
          return { ...b, ...patch };
        });
      },
      load: (next, page) => {
        setChosen(true);
        setBuild(next);
        if (page) navigate({ page });
      },
    }),
    [locale, build, chosen, navigate],
  );

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>;
}
