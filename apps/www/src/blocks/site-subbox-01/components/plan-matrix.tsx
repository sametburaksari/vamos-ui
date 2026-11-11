"use client";

import { cn } from "@vamos-ui/react";
import { useBox } from "./box-provider";
import { copyFor, frequencies, GRAMS_PER_CUP, priceFor, sizes, type SiteLocale } from "./content";

/**
 * The signature of Brewcraft Box: size × frequency as one price grid. Every cell is a radio
 * (one tab stop, arrow keys move through the nine plans); the chosen cell fills with the
 * coffee accent, and its row and column headers light up so the plan reads as coordinates.
 */
export function PlanMatrix({ locale, caption, idPrefix }: { locale: SiteLocale; caption?: string; /** Unique per instance on the page ("bx-home"). */ idPrefix: string }) {
  const { t, tl, tl2, f } = copyFor(locale);
  const { plan, setPlan } = useBox();
  const name = `${idPrefix}-${locale}`;

  return (
    <div className="overflow-hidden rounded-ui-lg border border-fg/80 bg-surface">
      <table className="w-full table-fixed border-collapse text-start">
        <caption className="sr-only">{caption ?? t({ en: "Choose a size and how often it arrives", tr: "Bir boyut ve ne sıklıkla geleceğini seçin" })}</caption>
        <thead>
          <tr>
            <th scope="col" className="w-[30%] border-b border-line p-3 text-start align-bottom font-mono text-[10px] font-normal tracking-[0.08em] text-fg-muted uppercase sm:p-4 sm:text-[11px]">
              {t({ en: "Size ↓ · how often →", tr: "Boyut ↓ · sıklık →" })}
            </th>
            {frequencies.map((fr) => {
              const on = plan.freq === fr.id;
              return (
                <th key={fr.id} scope="col" className={cn("border-b border-s border-line p-3 text-start align-bottom transition-colors sm:p-4", on && "bg-accent-soft")}>
                  <span className={cn("block text-[13px] font-semibold sm:text-sm", on ? "text-accent-ink" : "text-fg")}>{t(fr.name)}</span>
                  <span className={cn("mt-0.5 block font-mono text-[10px] sm:text-[11px]", on ? "text-accent-ink" : "text-fg-muted")}>{fr.discount ? `−${f.percent(fr.discount, { maximumFractionDigits: 0 })}` : t({ en: "list price", tr: "liste fiyatı" })}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sizes.map((s) => {
            const rowOn = plan.size === s.id;
            const cups = Math.floor(s.grams / GRAMS_PER_CUP);
            return (
              <tr key={s.id}>
                <th scope="row" className={cn("border-t border-line p-3 text-start align-top transition-colors sm:p-4", rowOn && "bg-accent-soft")}>
                  <span className={cn("block text-[13px] font-semibold sm:text-sm", rowOn ? "text-accent-ink" : "text-fg")}>{t(s.name)}</span>
                  <span className={cn("mt-0.5 block text-[11px] sm:text-xs", rowOn ? "text-accent-ink" : "text-fg-muted")}>{t({ en: `${s.grams} g · ~${cups} cups`, tr: `${s.grams} g · ~${cups} fincan` })}</span>
                </th>
                {frequencies.map((fr) => {
                  const price = priceFor(s.id, fr.id);
                  const on = rowOn && plan.freq === fr.id;
                  const id = `${name}-${s.id}-${fr.id}`;
                  return (
                    <td key={fr.id} className="border-t border-s border-line p-0">
                      <label
                        htmlFor={id}
                        className={cn(
                          "flex h-full min-h-[4.5rem] cursor-pointer flex-col justify-between gap-1 p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-4 has-[:focus-visible]:outline-ring sm:p-4",
                          on ? "bg-accent text-accent-fg" : "hover:bg-hover",
                        )}
                      >
                        <input
                          id={id}
                          type="radio"
                          name={name}
                          className="sr-only"
                          checked={on}
                          onChange={() => setPlan({ size: s.id, freq: fr.id })}
                          aria-label={`${t(s.name)}, ${t(fr.name)}: ${tl(price)}`}
                        />
                        <span className="font-display text-[1.15rem] leading-none tabular sm:text-[1.5rem]">{tl(price)}</span>
                        <span className={cn("font-mono text-[10px] sm:text-[11px]", on ? "text-accent-fg/80" : "text-fg-muted")}>
                          {tl2(price / cups)} {t({ en: "/ cup", tr: "/ fincan" })}
                        </span>
                      </label>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
