"use client";

import * as React from "react";
import { Direction } from "radix-ui";
import { en, type Messages, type MessagesInput } from "../locales/en";
import { createFormatter, type Formatter } from "../format/core";
import { formatMessage } from "./message-format";
import * as text from "./text";

/** A merged dictionary: the full `Messages` shape plus any extra component namespaces. */
export type ResolvedMessages = Messages & Record<string, Record<string, string>>;

export interface LocaleValue {
  /** BCP 47 tag used for Intl formatting and text rules, e.g. "en-US", "tr-TR". */
  locale: string;
  /** The merged dictionary (base locale + partial overrides). */
  messages: ResolvedMessages;
  dir: "ltr" | "rtl";
  /** IANA time zone for instants. Default "UTC" (explicit, so SSR and client agree). */
  timeZone: string;
  /** Default ISO 4217 currency. Default "USD". */
  currency: string;
  /** Formatter bound to locale, currency and time zone. Same object as `useFormat()`. */
  format: Formatter;
  /** Look up and format a message by path: `t("pagination.range", { from: 1, to: 20, total: 340 })`. */
  t: (key: string, vars?: Record<string, unknown>) => string;
}

export interface LocaleProviderProps {
  /** Default "en-US" (or the parent provider's locale). */
  locale?: string;
  /**
   * Full or partial dictionary, deep-merged over the base. The base is the parent provider's
   * dictionary when `locale` is unchanged, otherwise the built-in English `en`.
   */
  messages?: MessagesInput;
  /** Text direction. Default: derived from the locale (ar, he, fa, ur → "rtl"). */
  dir?: "ltr" | "rtl";
  timeZone?: string;
  currency?: string;
  children: React.ReactNode;
}

const RTL_LANGS = new Set(["ar", "he", "fa", "ur", "ps", "sd", "ug", "yi", "dv", "ckb"]);

/** "rtl" for right-to-left languages. */
export function directionOf(locale: string): "ltr" | "rtl" {
  return RTL_LANGS.has(text.baseLanguage(locale)) ? "rtl" : "ltr";
}

/** Deep-merges a partial dictionary over a base dictionary (one level of namespaces). */
export function mergeMessages(base: ResolvedMessages | Messages, override?: MessagesInput): ResolvedMessages {
  const out: Record<string, Record<string, string>> = { ...(base as Record<string, Record<string, string>>) };
  if (!override) return out as ResolvedMessages;
  for (const [ns, values] of Object.entries(override)) {
    if (!values) continue;
    const merged: Record<string, string> = { ...out[ns] };
    for (const [k, v] of Object.entries(values)) if (typeof v === "string") merged[k] = v;
    out[ns] = merged;
  }
  return out as ResolvedMessages;
}

function lookup(messages: ResolvedMessages, key: string): string | undefined {
  const dot = key.indexOf(".");
  if (dot === -1) return undefined;
  return messages[key.slice(0, dot)]?.[key.slice(dot + 1)];
}

function createValue(locale: string, messages: ResolvedMessages, dir: "ltr" | "rtl", timeZone: string, currency: string): LocaleValue {
  return {
    locale,
    messages,
    dir,
    timeZone,
    currency,
    format: createFormatter(locale, { currency, timeZone }),
    t: (key, vars) => formatMessage(lookup(messages, key) ?? key, vars, locale),
  };
}

const defaultValue = createValue("en-US", en as ResolvedMessages, "ltr", "UTC", "USD");
const LocaleContext = React.createContext<LocaleValue>(defaultValue);

/**
 * Locale for built-in strings, text rules and Intl formatting. No i18n library required.
 * Zero config means English (`en-US`, USD, UTC). Nest providers to override a subtree.
 *
 * ```tsx
 * import { tr } from "@vamos-cms/ui/locale/tr";
 * <LocaleProvider locale="tr-TR" messages={tr} timeZone="Europe/Istanbul" currency="TRY">…</LocaleProvider>
 *
 * // Rename one string without writing a locale:
 * <LocaleProvider messages={{ common: { remove: "Move to bin" } }}>…</LocaleProvider>
 * ```
 */
export function LocaleProvider({ locale, messages, dir, timeZone, currency, children }: LocaleProviderProps) {
  const parent = React.useContext(LocaleContext);
  const nextLocale = locale ?? parent.locale;
  const localeChanged = nextLocale !== parent.locale;
  const base = localeChanged ? (en as ResolvedMessages) : parent.messages;
  const merged = React.useMemo(() => mergeMessages(base, messages), [base, messages]);
  const nextDir = dir ?? (localeChanged ? directionOf(nextLocale) : parent.dir);
  const tz = timeZone ?? parent.timeZone;
  const cur = currency ?? parent.currency;
  const value = React.useMemo(() => createValue(nextLocale, merged, nextDir, tz, cur), [nextLocale, merged, nextDir, tz, cur]);
  return (
    <LocaleContext.Provider value={value}>
      <Direction.Provider dir={nextDir}>{children}</Direction.Provider>
    </LocaleContext.Provider>
  );
}

/** `{ locale, messages, dir, timeZone, currency, format, t }` from the nearest LocaleProvider. */
export const useLocale = (): LocaleValue => React.useContext(LocaleContext);

/** The merged dictionary. Prefer `useLabels()` in components (it supports per-instance overrides). */
export const useMessages = (): ResolvedMessages => React.useContext(LocaleContext).messages;

/**
 * Formatter bound to the provider's locale, currency and time zone.
 *
 * ```ts
 * const f = useFormat();
 * f.currency("1250.50");        // "$1,250.50" (provider currency)
 * f.currency(5, "EUR");          // "€5.00"
 * f.date("2026-11-08");          // "Nov 8, 2026"
 * f.relative(-1, "day");         // "yesterday"
 * ```
 */
export const useFormat = (): Formatter => React.useContext(LocaleContext).format;

/** Text helpers from `lib/text` bound to the provider's locale. */
export function useText() {
  const { locale } = useLocale();
  return React.useMemo(
    () => ({
      locale,
      fold: (s: string) => text.foldText(s, locale),
      match: (s: string, q: string) => text.matchText(s, q, locale),
      highlight: (s: string, q: string) => text.highlightText(s, q, locale),
      highlightParts: (s: string, q: string) => text.highlightParts(s, q, locale),
      compare: text.compareText(locale),
      cmdkFilter: text.cmdkFilter(locale),
      upper: (s: string) => text.upperText(s, locale),
      lower: (s: string) => text.lowerText(s, locale),
      initials: (name: string, max?: 1 | 2) => text.initials(name, locale, max),
      slugify: (s: string, o?: Omit<text.SlugifyOptions, "locale">) => text.slugify(s, { ...o, locale }),
    }),
    [locale],
  );
}
