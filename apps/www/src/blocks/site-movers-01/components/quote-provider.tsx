"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { DEFAULT_QUOTE, quote, type L, type Quote, type QuoteInput, type SiteLocale } from "./content";

interface QuoteContextValue {
  locale: SiteLocale;
  t: (v: L) => string;
  input: QuoteInput;
  update: (patch: Partial<QuoteInput>) => void;
  result: Quote;
  step: number;
  setStep: (n: number) => void;
  /** Open the calculator on the quote page, optionally with answers filled in. */
  start: (preset?: Partial<QuoteInput>) => void;
  reset: () => void;
}

const QuoteContext = React.createContext<QuoteContextValue | null>(null);

export function useQuote() {
  const ctx = React.useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used inside <QuoteProvider>.");
  return ctx;
}

/** Quote answers and the current step: above the EN / TR switch so nothing is lost. */
export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const { locale: shellLocale, navigate } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const [input, setInput] = React.useState<QuoteInput>(DEFAULT_QUOTE);
  const [step, setStep] = React.useState(0);

  const value = React.useMemo<QuoteContextValue>(
    () => ({
      locale,
      t: (v) => v[locale],
      input,
      update: (patch) => setInput((q) => ({ ...q, ...patch })),
      result: quote(input),
      step,
      setStep,
      start: (preset) => {
        if (preset) setInput((q) => ({ ...q, ...preset }));
        setStep(preset ? 1 : 0);
        navigate({ page: "quote" });
      },
      reset: () => {
        setInput(DEFAULT_QUOTE);
        setStep(0);
      },
    }),
    [locale, input, step, navigate],
  );

  return (
    <QuoteContext.Provider value={value}>
      {children}
      <style>{tidyMotion}</style>
    </QuoteContext.Provider>
  );
}

/**
 * Tidyframe moves like a good crew: brisk, nothing dropped. Its signature is on the survey
 * plan: the rooms are labelled one by one, then the load is wheeled in through the living room;
 * changing the home size swaps the load. Prices settle into place when they change.
 */
const tidyMotion = `
@keyframes tf-load { from { opacity: 0; transform: translate3d(70px, 0, 0); } 70% { opacity: 1; } }
@keyframes tf-room { from { opacity: 0; } }
@keyframes tf-settle { from { opacity: 0; transform: translate3d(0, 0.3em, 0); } }
@media screen and (prefers-reduced-motion: no-preference) {
  .tf-load:where(:not([data-motion="off"] *)) { animation: tf-load 560ms var(--ease-out-quint) backwards; }
  .tf-rooms:where(:not([data-motion="off"] *)) > text { animation: tf-room 300ms linear backwards; }
  .tf-rooms > text:nth-child(1) { animation-delay: 500ms; }
  .tf-rooms > text:nth-child(2) { animation-delay: 600ms; }
  .tf-rooms > text:nth-child(3) { animation-delay: 700ms; }
  .tf-rooms > text:nth-child(4) { animation-delay: 800ms; }
  .tf-rooms > text:nth-child(5) { animation-delay: 900ms; }
  .tf-settle:where(:not([data-motion="off"] *)) { display: inline-block; animation: tf-settle 260ms var(--ease-out-quint); }
}
`;
