"use client";

import * as React from "react";
import { ArrowLeft, Globe, Phone, Plus, PhoneCall } from "lucide-react";
import { Avatar, Badge, Button, SlaTimer, Sparkline, useLocale } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { industryLabels, lifecycleLabels, planLabels } from "../../_shared/companies";
import { person } from "../../_shared/people";
import { NOW_MS } from "../../_shared/time";
import { company, healthSignals, healthTrend } from "./data";

export interface AccountKpis {
  pipelineWeighted: number;
  pipelineOpen: number;
  openDeals: number;
  openTickets: number;
  nextDue?: { due: string; start: string };
  outstanding: number;
  overdueCount: number;
}

const lifecycleTone = { lead: "info", trial: "info", customer: "success", "at-risk": "danger", churned: "neutral" } as const;

/** Identity line, actions and the account's five numbers. */
export function AccountHeader({ kpis, onLogCall, onNewDeal }: { kpis: AccountKpis; onLogCall: () => void; onNewDeal: () => void }) {
  const { c, t, f, money } = useBlockFormat();
  const { locale } = useLocale();
  const owner = person(company.ownerId);
  const tryFmt = { style: "currency", currency: "TRY", maximumFractionDigits: 0 } as const;
  const health = healthTrend[healthTrend.length - 1]!;
  const lastQuarter = healthTrend[healthTrend.length - 13] ?? healthTrend[0]!;

  return (
    <header className="grid gap-6">
      <a href="#companies" className="focus-ring inline-flex w-fit items-center gap-1.5 rounded-ui text-small text-fg-muted hover:text-fg">
        <ArrowLeft className="size-3.5" aria-hidden /> {c("Companies", "Şirketler")}
      </a>

      <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
        <Avatar name={company.name} shape="square" size="xl" />
        <div className="grid min-w-0 flex-1 basis-72 gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-[length:calc(30px*var(--display-scale,1))] leading-tight text-fg">{company.name}</h1>
            <Badge tone={lifecycleTone[company.lifecycle]} dot>{t(lifecycleLabels[company.lifecycle])}</Badge>
            <Badge tone="outline">{t(planLabels[company.plan])}</Badge>
          </div>
          <p className="text-fg-muted">
            {t(industryLabels[company.industry])} · {c(`${company.size} employees`, `${company.size} çalışan`)} · {company.city}, Türkiye ·{" "}
            {c("customer since", "müşteri:")} {f.date(company.customerSince, { month: "short", year: "numeric" })}
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-fg-muted">
            <a className="focus-ring inline-flex items-center gap-1.5 rounded-ui hover:text-fg" href={`https://${company.domain}`}>
              <Globe className="size-3.5" aria-hidden /> {company.domain}
            </a>
            <a className="focus-ring inline-flex items-center gap-1.5 rounded-ui hover:text-fg" href={`tel:${company.phone.replace(/\s/g, "")}`}>
              <Phone className="size-3.5" aria-hidden /> {company.phone}
            </a>
            <span className="inline-flex items-center gap-1.5">
              <Avatar name={owner.name} size="xs" /> {c("Owner", "Sorumlu")}: <span className="text-fg">{owner.name}</span>
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onLogCall}>
            <PhoneCall /> {c("Log call", "Görüşme kaydet")}
          </Button>
          <Button variant="primary" onClick={onNewDeal}>
            <Plus /> {c("New deal", "Yeni fırsat")}
          </Button>
        </div>
      </div>

      <section aria-label={c("Account at a glance", "Hesap özeti")} className="surface overflow-hidden rounded-ui-lg">
        <dl className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-[1.35fr_repeat(4,1fr)] [&>div]:border-line [&>div]:p-4 [&>div]:sm:p-5">
          <div className="col-span-2 grid gap-3 border-b md:col-span-3 xl:col-span-1 xl:border-e xl:border-b-0">
            <dt className="text-small text-fg-muted">{c("Health score", "Sağlık puanı")}</dt>
            <dd className="flex items-end justify-between gap-4">
              <span className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap">
                <CountUp value={health} locale={locale} className="font-heading text-[length:calc(40px*var(--display-scale,1))] leading-none text-danger tabular" />
                <span className="text-fg-subtle">/ 100</span>
              </span>
              <Sparkline values={healthTrend} variant="area" color="danger" width={120} height={36} className="min-w-0" label={c(`Health fell from ${lastQuarter} to ${health} over 12 weeks`, `Sağlık puanı 12 haftada ${lastQuarter}'den ${health}'e düştü`)} />
            </dd>
            <dd>
              <ul className="flex flex-wrap gap-1.5">
                {healthSignals.map((s) => (
                  <li key={s.id}>
                    <Badge tone={s.tone} title={t(s.detail)}>{t(s.label)}</Badge>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
          <Kpi label={c("Monthly recurring", "Aylık tekrarlayan")} hint={c("Scale plan · 70 seats", "Scale paket · 70 lisans")} className="border-e border-b md:border-b-0">
            <CountUp value={Number(company.mrr.amount)} locale={locale} format={tryFmt} className="tabular" />
          </Kpi>
          <Kpi label={c("Weighted pipeline", "Ağırlıklı fırsat")} hint={c(`${kpis.openDeals} open · ${money({ amount: String(kpis.pipelineOpen), currency: "TRY" }, { compact: true })} total`, `${kpis.openDeals} açık · toplam ${money({ amount: String(kpis.pipelineOpen), currency: "TRY" }, { compact: true })}`)} className="border-b md:border-e md:border-b-0">
            <CountUp value={kpis.pipelineWeighted} locale={locale} format={tryFmt} className="tabular" />
          </Kpi>
          <Kpi
            label={c("Open tickets", "Açık talepler")}
            hint={kpis.nextDue ? <span className="inline-flex flex-wrap items-center gap-1.5">{c("Next due", "Sıradaki")} <SlaTimer variant="inline" due={kpis.nextDue.due} start={kpis.nextDue.start} now={NOW_MS} label={c("Next resolve target", "Sıradaki çözüm hedefi")} /></span> : c("Nothing waiting", "Bekleyen yok")}
            className="border-e max-md:border-t md:border-t xl:border-t-0"
          >
            <CountUp value={kpis.openTickets} locale={locale} className="tabular" />
          </Kpi>
          <Kpi
            label={c("Outstanding", "Açık bakiye")}
            hint={kpis.overdueCount ? <span className="text-danger">{c(`${kpis.overdueCount} overdue`, `${kpis.overdueCount} vadesi geçmiş`)}</span> : c("Nothing overdue", "Vadesi geçen yok")}
            className="max-md:border-t md:col-span-2 md:border-t xl:col-span-1 xl:border-t-0"
          >
            <CountUp value={kpis.outstanding} locale={locale} format={tryFmt} className="tabular" />
          </Kpi>
        </dl>
      </section>
    </header>
  );
}

function Kpi({ label, hint, className, children }: { label: string; hint?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={`grid content-start gap-1.5 ${className ?? ""}`}>
      <dt className="text-small text-fg-muted">{label}</dt>
      <dd className="font-heading text-[length:calc(19px*var(--display-scale,1))] leading-tight whitespace-nowrap text-fg sm:text-[length:calc(24px*var(--display-scale,1))]">{children}</dd>
      {hint ? <dd className="text-small text-fg-subtle">{hint}</dd> : null}
    </div>
  );
}
