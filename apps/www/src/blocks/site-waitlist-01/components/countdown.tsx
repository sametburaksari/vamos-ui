"use client";

import * as React from "react";
import { copyFor, LAUNCH_AT, type SiteLocale } from "./content";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/**
 * Days · hours · minutes · seconds until the first wave opens. Ticks once a second after
 * hydration (the server renders dashes, so markup never mismatches). The visible digits are
 * hidden from screen readers; one sentence with the day count is read instead.
 */
export function Countdown({ locale, className }: { locale: SiteLocale; className?: string }) {
  const { t, f } = copyFor(locale);
  const target = React.useMemo(() => new Date(LAUNCH_AT).getTime(), []);
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const p = now == null ? null : parts(target - now);
  const units: [keyof ReturnType<typeof parts>, string][] = [
    ["d", t({ en: "days", tr: "gün" })],
    ["h", t({ en: "hours", tr: "saat" })],
    ["m", t({ en: "min", tr: "dk" })],
    ["s", t({ en: "sec", tr: "sn" })],
  ];
  return (
    <div className={className}>
      <p className="sr-only">
        {p ? t({ en: `Opens in ${p.d} days, on 1 March 2027.`, tr: `${p.d} gün sonra, 1 Mart 2027’de açılıyor.` }) : t({ en: "Opens on 1 March 2027.", tr: "1 Mart 2027’de açılıyor." })}
      </p>
      <ol aria-hidden className="m-0 grid list-none grid-cols-4 gap-2 p-0">
        {units.map(([k, label]) => (
          <li key={k} className="flex flex-col items-start rounded-ui border border-line bg-[color-mix(in_oklch,var(--surface)_60%,transparent)] px-3 py-2.5">
            <span className="font-display text-[1.75rem] leading-none text-fg tabular">
              {/* Keyed by the value: each change rises into place (styles in waitlist-site). */}
              <span key={p ? p[k] : "–"} className={p ? "lm-shoot" : undefined}>
                {p ? f.number(p[k], { minimumIntegerDigits: k === "d" ? 1 : 2 }) : "–"}
              </span>
            </span>
            <span className="mt-1.5 font-mono text-[10px] tracking-[0.1em] text-fg-muted uppercase">{label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
