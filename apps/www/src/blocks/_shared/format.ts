// Formatting helpers for blocks. Everything goes through the kit's locale-aware formatter;
// these only add the fixture conventions (Money objects, {en,tr} copy, the fixed NOW).
import { useFormat, useLocale } from "@vamos-ui/react";
import type { Formatter } from "@vamos-ui/react/format";
import { langOf, tx, type L, type Lang } from "./l10n";
import { fmtMoney, type Money } from "./money";
import { NOW_MS } from "./time";

export { useFormat, useLocale };

export interface BlockFormat {
  f: Formatter;
  lang: Lang;
  /** Resolve `{ en, tr }` copy. */
  t: (value: L) => string;
  /** Pick inline copy: `c("Orders", "Siparişler")`. */
  c: (en: string, tr: string) => string;
  money: (value: Money, opts?: { compact?: boolean; whole?: boolean }) => string;
  /** "3 hours ago" measured from the fixtures' NOW, not the real clock. */
  ago: (iso: string) => string;
}

/** One hook for block copy and numbers: `const { t, c, money, ago, f } = useBlockFormat();` */
export function useBlockFormat(): BlockFormat {
  const f = useFormat();
  const { locale } = useLocale();
  const lang = langOf(locale);
  return {
    f,
    lang,
    t: (value) => tx(value, lang),
    c: (en, tr) => (lang === "tr" ? tr : en),
    money: (value, opts) => fmtMoney(f, value, opts),
    ago: (iso) => f.relative(iso, { now: NOW_MS }),
  };
}
