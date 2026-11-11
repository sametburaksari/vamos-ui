"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { Reveal } from "@vamos-ui/react/motion";
import type { L, SiteLocale } from "./content";

interface EstateContextValue {
  locale: SiteLocale;
  t: (v: L) => string;
  /** The residence shown on the residence page. */
  current: string;
  /** Show a residence (and go to its page). */
  open: (id: string, anchor?: string) => void;
}

const EstateContext = React.createContext<EstateContextValue | null>(null);

export function useEstate() {
  const ctx = React.useContext(EstateContext);
  if (!ctx) throw new Error("useEstate must be used inside <EstateProvider>.");
  return ctx;
}

/** Chosen residence above the EN / TR switch, so a language change keeps the page. */
export function EstateProvider({ children }: { children: React.ReactNode }) {
  const { locale: shellLocale, navigate } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const [current, setCurrent] = React.useState("korusu");

  // Deep link: ?page=residence&house=macka
  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("house");
    if (id) setCurrent(id);
  }, []);

  const value = React.useMemo<EstateContextValue>(
    () => ({
      locale,
      t: (v) => v[locale],
      current,
      open: (id, anchor) => {
        setCurrent(id);
        navigate({ page: "residence", anchor });
        try {
          const u = new URL(window.location.href);
          u.searchParams.set("house", id);
          window.history.replaceState(null, "", u);
        } catch {
          /* ignore */
        }
      },
    }),
    [locale, current, navigate],
  );
  return <EstateContext.Provider value={value}>{children}</EstateContext.Provider>;
}

/** Slowly settles (or, with `clip`, unveils) its content when it scrolls into view — the kit Reveal at the estate's unhurried pace. Reduced motion and data-motion="off" show it at once. */
export function SlowReveal({ children, className, effect = "rise" }: { children: React.ReactNode; className?: string; effect?: "rise" | "clip" | "fade" }) {
  return (
    <Reveal effect={effect} duration={effect === "clip" ? 1600 : 1400} rootMargin="0px 0px -12% 0px" className={className}>
      {children}
    </Reveal>
  );
}
