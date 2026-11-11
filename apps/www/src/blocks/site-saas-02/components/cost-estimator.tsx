"use client";

import * as React from "react";
import { Badge, Field, Slider, useFormat } from "@vamos-ui/react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { copyFor, PRICING, type SiteLocale } from "./content";

type PlanId = "free" | "team" | "business";

/**
 * Pricing estimator: editors and data scanned per month → the monthly bill on each plan, with
 * the cheapest plan that fits marked. Viewers are always free, so only editors are counted.
 */
export function CostEstimator() {
  const { locale } = useSiteShell();
  const { t } = copyFor(locale as SiteLocale);
  const f = useFormat();
  const [editors, setEditors] = React.useState([6]);
  const [gb, setGb] = React.useState([800]);
  const e = editors[0]!;
  const g = gb[0]!;

  const rows: { id: PlanId; name: string; total: number | null; parts: string; fits: boolean }[] = [
    {
      id: "free",
      name: "Free",
      total: e <= 3 && g <= 50 ? 0 : null,
      parts: t({ en: "Up to 3 editors and 50 GB scanned", tr: "3 editöre ve 50 GB taramaya kadar" }),
      fits: e <= 3 && g <= 50,
    },
    (() => {
      const over = Math.max(0, g - PRICING.team.includedGb);
      const total = e * PRICING.team.seat + over * PRICING.overagePerGb;
      return {
        id: "team" as const,
        name: "Team",
        total,
        parts: `${e} × ${f.currency(PRICING.team.seat, "USD", { maximumFractionDigits: 0 })}${over ? ` + ${f.number(over)} GB × ${f.currency(PRICING.overagePerGb, "USD")}` : ""}`,
        fits: e <= 25,
      };
    })(),
    (() => {
      const over = Math.max(0, g - PRICING.business.includedGb);
      const total = e * PRICING.business.seat + over * PRICING.overagePerGb;
      return {
        id: "business" as const,
        name: "Business",
        total,
        parts: `${e} × ${f.currency(PRICING.business.seat, "USD", { maximumFractionDigits: 0 })}${over ? ` + ${f.number(over)} GB × ${f.currency(PRICING.overagePerGb, "USD")}` : ""}`,
        fits: true,
      };
    })(),
  ];
  const best = rows.filter((r) => r.fits && r.total !== null).sort((a, b) => a.total! - b.total!)[0]?.id;

  return (
    <div className="surface grid overflow-hidden rounded-ui-lg border border-line lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="grid content-start gap-8 border-b border-line p-6 lg:border-e lg:border-b-0">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-subtle">{t({ en: "Estimator", tr: "Hesaplayıcı" })}</p>
          <h2 id="pl-estimator-title" className="mt-2 font-display text-2xl">
            {t({ en: "What would we pay?", tr: "Ne kadar öderiz?" })}
          </h2>
          <p className="mt-2 text-sm text-fg-muted">{t({ en: "Viewers are free on every plan. Count only the people who write queries or edit dashboards.", tr: "İzleyiciler her pakette ücretsiz. Yalnızca sorgu yazan ya da pano düzenleyen kişileri sayın." })}</p>
        </div>
        <Field label={t({ en: "Editors", tr: "Editör" })} hint={t({ en: "1–40 people", tr: "1–40 kişi" })}>
          <Slider value={editors} onValueChange={setEditors} min={1} max={40} step={1} showValue="always" marks={[1, 10, 20, 30, 40]} />
        </Field>
        <Field label={t({ en: "Data scanned per month", tr: "Aylık taranan veri" })} hint={t({ en: "Cached results don’t count. Most teams of ten scan 300–900 GB.", tr: "Önbellekten gelen sonuçlar sayılmaz. On kişilik ekiplerin çoğu 300–900 GB tarar." })}>
          <Slider value={gb} onValueChange={setGb} min={10} max={4000} step={10} showValue="always" formatValue={(v) => `${f.number(v)} GB`} marks={[500, 2000, 4000].map((v) => ({ value: v, label: f.number(v) }))} />
        </Field>
      </div>
      <div className="p-6" aria-live="polite">
        <table className="w-full text-sm">
          <caption className="sr-only">{t({ en: "Monthly cost per plan for your numbers", tr: "Rakamlarınıza göre paket başına aylık maliyet" })}</caption>
          <thead>
            <tr className="border-b border-line text-start font-mono text-[11px] uppercase tracking-[0.12em] text-fg-subtle">
              <th scope="col" className="pb-2 text-start font-normal">
                {t({ en: "Plan", tr: "Paket" })}
              </th>
              <th scope="col" className="pb-2 text-end font-normal">
                {t({ en: "Per month", tr: "Aylık" })}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.id === best ? "border-b border-line bg-accent-soft" : "border-b border-line"}>
                <th scope="row" className="py-3.5 ps-2 text-start font-normal">
                  <span className="flex items-center gap-2 font-semibold">
                    {r.name}
                    {r.id === best ? (
                      <Badge size="sm" tone="accent">
                        {t({ en: "Best fit", tr: "En uygun" })}
                      </Badge>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-fg-muted">{r.parts}</span>
                </th>
                <td className="py-3.5 pe-2 text-end align-top font-mono text-base tabular-nums">
                  {r.total === null || !r.fits ? <span className="text-[12px] text-fg-subtle">{t({ en: "doesn’t fit", tr: "uymuyor" })}</span> : f.currency(r.total, "USD", { maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-[12px] text-fg-subtle">{t({ en: "Monthly billing, excluding 20% VAT. Yearly billing takes two months off the seat price.", tr: "Aylık faturalama, %20 KDV hariç. Yıllık faturada kullanıcı fiyatından iki ay düşülür." })}</p>
      </div>
    </div>
  );
}
