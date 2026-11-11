"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
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

/** Fades and slowly settles its content when it scrolls into view (skipped for reduced motion). */
export function SlowReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(true);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) return;
    setShown(false);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} data-shown={shown ? "" : undefined} className={className} style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(28px)", transition: "opacity 1.6s cubic-bezier(.2,.7,.1,1), transform 1.8s cubic-bezier(.2,.7,.1,1)" }}>
      {children}
    </div>
  );
}
