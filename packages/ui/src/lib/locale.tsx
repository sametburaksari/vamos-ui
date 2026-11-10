"use client";

import * as React from "react";
import { en, type Messages } from "../locales/en";

interface LocaleValue {
  /** BCP 47 tag used for Intl formatting, e.g. "en-US", "tr-TR". */
  locale: string;
  messages: Messages;
  dir: "ltr" | "rtl";
}

const LocaleContext = React.createContext<LocaleValue>({ locale: "en-US", messages: en, dir: "ltr" });

/**
 * Provides the locale for built-in strings and Intl formatting.
 * No i18n library required: pass a messages object that matches `Messages`.
 *
 *   <LocaleProvider locale="tr-TR" messages={tr}>…</LocaleProvider>
 */
export function LocaleProvider({
  locale = "en-US",
  messages = en,
  dir = "ltr",
  children,
}: Partial<LocaleValue> & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ locale, messages, dir }), [locale, messages, dir]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => React.useContext(LocaleContext);
export const useMessages = () => React.useContext(LocaleContext).messages;

/** Locale-aware formatters, memoised per locale. */
export function useFormat() {
  const { locale } = useLocale();
  return React.useMemo(
    () => ({
      number: (n: number, o?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, o).format(n),
      currency: (n: number, currency: string, o?: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat(locale, { style: "currency", currency, ...o }).format(n),
      percent: (n: number, o?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, { style: "percent", ...o }).format(n),
      date: (d: Date | number, o?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, o).format(d),
      relative: (value: number, unit: Intl.RelativeTimeFormatUnit) => new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(value, unit),
    }),
    [locale],
  );
}
