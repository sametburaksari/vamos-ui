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

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}
