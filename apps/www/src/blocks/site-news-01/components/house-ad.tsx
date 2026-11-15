import { ArrowRight } from "lucide-react";

/**
 * The paper's own promotions, shown in ad slots that have nothing sold (house ads track nothing,
 * so their slots skip the consent gate). Typeset, not an image: crisp at any slot size.
 */
export function HouseAd({ kind, locale, href }: { kind: "print" | "newsletter"; locale: "en" | "tr"; href: string }) {
  const tr = locale === "tr";
  if (kind === "print") {
    return (
      <a href={href} className="group flex size-full items-center justify-between gap-4 bg-fg px-[4%] text-scene focus-ring">
        <span className="flex flex-col leading-tight">
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] opacity-70">{tr ? "Hafta sonu baskısı" : "The weekend edition"}</span>
          <span className="font-display text-[clamp(1rem,2.6cqi,1.6rem)] italic">{tr ? "Cumartesi sabahı kapınızda." : "On your doorstep by Saturday breakfast."}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[2px] bg-accent px-3 py-2 text-[0.75rem] font-semibold text-accent-fg">
          {tr ? "Ayda 149 TL" : "149 TL a month"}
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
        </span>
      </a>
    );
  }
  return (
    <a href={href} className="group flex size-full flex-col items-start justify-between gap-3 border border-line bg-surface-2 p-5 text-fg focus-ring">
      <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-accent-ink">{tr ? "Sabah bülteni" : "The morning briefing"}</span>
      <span className="font-display text-[1.5rem] leading-tight">{tr ? "Günün beş haberi, 07.00’de, beş dakikada." : "Five stories by 7 a.m., read in five minutes."}</span>
      <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold underline decoration-line underline-offset-[0.25em] group-hover:decoration-current">
        {tr ? "Ücretsiz abone olun" : "Sign up free"}
        <ArrowRight aria-hidden className="size-3.5 rtl:-scale-x-100" />
      </span>
    </a>
  );
}
