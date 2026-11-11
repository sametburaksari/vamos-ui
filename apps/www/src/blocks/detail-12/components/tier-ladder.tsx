"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { partner, tierLabels, tierLadder } from "./partner-data";

/**
 * The partner's place on the programme ladder: four stops, the track filled to this year's
 * sourced revenue (each segment scaled on its own, so the small tiers stay readable),
 * and what is still missing for the next tier.
 */
export function TierLadder({ certified, wonCount, winRate, mdfLeft }: { certified: number; wonCount: number; winRate: number; mdfLeft: number }) {
  const { c, t, f } = useBlockFormat();
  const revenue = Number(partner.sourcedRevenue.amount);
  const idx = tierLadder.findIndex((s) => s.tier === partner.tier);
  const next = tierLadder[idx + 1];
  const seg = 100 / (tierLadder.length - 1);
  const fill = next ? idx * seg + Math.min(1, (revenue - tierLadder[idx]!.revenue) / (next.revenue - tierLadder[idx]!.revenue)) * seg : 100;
  const usd = (n: number) => f.currency(n, { currency: "USD" }, { maximumFractionDigits: 0, minimumFractionDigits: 0 });

  const kpis = [
    { label: c("Sourced this year", "Bu yıl getirdiği"), value: revenue / 1000, prefix: "$", suffix: "k" },
    { label: c("Registrations won", "Kazanılan kayıt"), value: wonCount, suffix: ` · ${f.percent(winRate, { maximumFractionDigits: 0 })}` },
    { label: c("MDF left to claim", "Kalan pazarlama fonu"), value: mdfLeft / 1000, prefix: "$", suffix: "k" },
    { label: c("Certified people", "Sertifikalı kişi"), value: certified },
  ];

  return (
    <section aria-labelledby="tier-heading" className="surface overflow-hidden rounded-ui-lg">
      <div className="grid gap-x-8 gap-y-5 px-4 pb-5 pt-4 md:px-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <h2 id="tier-heading" className="text-[13px] font-medium text-fg">
            {c("Programme tier", "Program seviyesi")}
          </h2>
          <p className="mt-1 text-[12.5px] text-fg-muted">
            {next
              ? c(
                  `${usd(next.revenue - revenue)} and ${Math.max(0, next.certified - certified)} more certified people to reach ${t(tierLabels[next.tier])} at the March review.`,
                  `Mart değerlendirmesinde ${t(tierLabels[next.tier])} seviyesine ulaşmak için ${usd(next.revenue - revenue)} ve ${Math.max(0, next.certified - certified)} sertifikalı kişi daha gerekli.`,
                )
              : c("Top tier. Kept while revenue stays above the threshold.", "En üst seviye. Gelir eşiğin üstünde kaldıkça korunur.")}
          </p>

          <div className="relative mx-9 mt-10 mb-14 sm:mx-7" role="img" aria-label={c(`${t(tierLabels[partner.tier])} tier, ${usd(revenue)} of ${next ? usd(next.revenue) : ""} sourced`, `${t(tierLabels[partner.tier])} seviyesi, ${usd(revenue)} / ${next ? usd(next.revenue) : ""}`)}>
            <div className="h-1.5 rounded-full bg-track" />
            <div className="absolute inset-y-0 start-0 h-1.5 rounded-full bg-accent transition-[width] duration-700" style={{ width: `${fill}%` }} />
            <span className="absolute -top-7 -translate-x-1/2 whitespace-nowrap rounded-ui-sm bg-fg px-1.5 py-0.5 font-mono text-[10.5px] text-scene tabular rtl:translate-x-1/2" style={{ insetInlineStart: `${fill}%` }}>
              {usd(revenue)}
            </span>
            {tierLadder.map((s, i) => {
              const reached = i <= idx;
              return (
                <div key={s.tier} className={cn("absolute top-1/2 flex -translate-y-1/2 flex-col items-center", i === 0 ? "start-0 -translate-x-1/2 rtl:translate-x-1/2" : i === tierLadder.length - 1 ? "end-0 translate-x-1/2 rtl:-translate-x-1/2" : "-translate-x-1/2 rtl:translate-x-1/2")} style={i > 0 && i < tierLadder.length - 1 ? { insetInlineStart: `${i * seg}%` } : undefined}>
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-full border-2",
                      i === idx ? "border-accent bg-accent text-accent-fg" : reached ? "border-accent bg-surface text-accent-ink" : "border-line bg-surface text-fg-subtle",
                    )}
                  >
                    {reached ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                  <span className="absolute top-7 flex flex-col items-center whitespace-nowrap">
                    <span className={cn("text-[12.5px]", i === idx ? "font-semibold text-fg" : "text-fg-muted")}>{t(tierLabels[s.tier])}</span>
                    <span className="text-[11px] text-fg-subtle tabular max-sm:hidden">{s.revenue ? `${usd(s.revenue)}+` : c("Entry", "Giriş")}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-ui border border-line bg-line lg:w-[340px]">
          {kpis.map((k) => (
            <div key={k.label} className="flex min-w-0 flex-col gap-1 bg-surface px-3.5 py-3">
              <dt className="truncate text-[12px] text-fg-muted">{k.label}</dt>
              <dd className="font-display text-[1.6rem] leading-none text-fg tabular">
                {k.prefix}
                <CountUp value={k.value} format={{ maximumFractionDigits: k.suffix === "k" ? 1 : 0 }} />
                {k.suffix ? <span className="ms-0.5 font-sans text-[13px] text-fg-muted">{k.suffix}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
