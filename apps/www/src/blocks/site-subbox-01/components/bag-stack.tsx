"use client";

import { cn } from "@vamos-ui/react";
import { useBox } from "./box-provider";
import { copyFor, grinds, roasts, sizes, type SiteLocale } from "./content";

/**
 * The box as it will arrive: one to four 250 g bags, each with the Brewcraft label printed with
 * the chosen roast and grind. Drawn with tokens only (surface, line, accent); decorative — the
 * summary next to it carries the same facts as text.
 */
export function BagStack({ locale, roastDate }: { locale: SiteLocale; roastDate: string }) {
  const { t, f } = copyFor(locale);
  const { plan } = useBox();
  const size = sizes.find((s) => s.id === plan.size)!;
  const roast = roasts.find((r) => r.id === plan.roast)!;
  const grind = grinds.find((g) => g.id === plan.grind)!;
  return (
    <div aria-hidden className="flex min-h-[15rem] items-end justify-center gap-2 px-2 pt-6 sm:gap-3">
      {Array.from({ length: size.bags }, (_, i) => (
        <div
          key={`${plan.size}-${i}`}
          className={cn(
            "relative flex w-[clamp(4.25rem,22%,7.5rem)] flex-col items-stretch",
            "motion-safe:animate-[bx-drop_420ms_cubic-bezier(.2,.8,.2,1)_both]",
          )}
          style={{ animationDelay: `${i * 70}ms` }}
        >
          {/* Crimped top */}
          <div className="h-3 rounded-t-[3px] border border-b-0 border-fg/70 bg-[repeating-linear-gradient(90deg,var(--surface-2)_0_3px,var(--line)_3px_4px)]" />
          <div className="relative flex aspect-[3/4.4] flex-col overflow-hidden rounded-b-[6px] border border-fg/70 bg-surface-2 px-1.5 pt-3 pb-2 shadow-[0_10px_24px_-14px_var(--fg)] sm:px-2">
            <span className="text-center font-display text-[13px] leading-none text-fg sm:text-[15px]">Brewcraft</span>
            <span className="mx-auto mt-1 h-px w-8 bg-fg/40" />
            <div className="mt-auto rounded-[3px] bg-accent px-1 py-1.5 text-center text-accent-fg">
              <span className="block font-mono text-[8px] tracking-[0.08em] uppercase sm:text-[9px]">{t(roast.name)}</span>
              <span className="block truncate text-[9px] font-semibold sm:text-[10px]">{t(grind.name)}</span>
            </div>
            <span className="mt-1.5 flex justify-between font-mono text-[7.5px] text-fg-muted sm:text-[8.5px]">
              <span>250 g</span>
              <span>{f.date(roastDate, { day: "2-digit", month: "2-digit" })}</span>
            </span>
          </div>
        </div>
      ))}
      <style>{`@keyframes bx-drop{from{transform:translateY(-14px);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  );
}
