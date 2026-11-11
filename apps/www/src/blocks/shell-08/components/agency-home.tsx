"use client";

import * as React from "react";
import { ArrowUpRight, Check, X } from "lucide-react";
import { Badge, Button, Progress, cn } from "@vamos-ui/react";
import { CountUp, Stagger } from "@vamos-ui/react/motion";
import { companiesById } from "../../_shared/companies";
import { useBlockFormat } from "../../_shared/format";
import { addDecimal } from "../../_shared/money";
import { partners, registrationStatusLabels, type DealRegistration } from "../../_shared/partners";
import { healthLabels, projects } from "../../_shared/projects";
import { approvals, lastClientVisit, workspaces } from "../data";

const healthTone = { "on-track": "success", "at-risk": "warning", "off-track": "danger" } as const;

export interface AgencyHomeProps {
  registrations: DealRegistration[];
  onDecide: (id: string, decision: "approved" | "rejected") => void;
  onOpenWorkspace: (id: string) => void;
}

/** Agency overview: every client portal in one list, and the partner deals waiting for a decision. */
export function AgencyHome({ registrations, onDecide, onOpenWorkspace }: AgencyHomeProps) {
  const { c, t, f, money, ago } = useBlockFormat();
  const clients = workspaces.filter((w) => w.kind === "client");
  const live = projects.filter((p) => p.status === "active");
  const sourced = addDecimal(partners.map((p) => p.sourcedRevenue.amount));
  const waiting = registrations.filter((r) => r.status === "submitted");

  return (
    <div className="mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(0,1fr)] gap-8">
      <header>
        <p className="text-[12px] text-fg-subtle">{f.date("2026-11-18", "full")}</p>
        <h1 className="mt-1 font-display text-[length:calc(32px*var(--display-scale,1))] leading-tight text-fg">{c("Good morning, Defne", "Günaydın Defne")}</h1>
        <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:flex sm:flex-wrap">
          {[
            [c("Client portals", "Müşteri portalı"), <CountUp key="a" value={clients.length} />],
            [c("Projects in flight", "Süren proje"), <CountUp key="b" value={live.length} />],
            [c("Partner-sourced, YTD", "İş ortağı kaynaklı, yıl başından"), money({ amount: sourced, currency: "USD" }, { compact: true })],
            [c("Deals to review", "İncelenecek fırsat"), <CountUp key="d" value={waiting.length} />],
          ].map(([k, v]) => (
            <div key={String(k)} className="min-w-0">
              <dt className="text-[12px] text-fg-muted">{k}</dt>
              <dd className="tabular font-display text-[length:calc(26px*var(--display-scale,1))] leading-tight text-fg">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section aria-labelledby="ag-portals">
        <div className="flex items-baseline gap-3">
          <h2 id="ag-portals" className="flex-1 text-[15px] font-semibold text-fg">{c("Client portals", "Müşteri portalları")}</h2>
          <span className="text-[12px] text-fg-subtle">{c("What each client sees when they sign in", "Her müşterinin giriş yaptığında gördüğü")}</span>
        </div>
        <Stagger asChild effect="rise">
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {clients.map((w) => {
              const co = companiesById[w.companyId!]!;
              const pj = projects.find((p) => p.clientId === co.id && p.status === "active");
              const pending = approvals.filter((a) => a.companyId === co.id).length;
              return (
                <li key={w.id} className="flex flex-col rounded-ui border border-line bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-fg">{w.name}</span>
                      <span className="block truncate font-mono text-[11px] text-fg-subtle">{co.domain}</span>
                    </span>
                    {pj ? <Badge tone={healthTone[pj.health]} dot>{t(healthLabels[pj.health])}</Badge> : null}
                  </div>
                  {pj ? (
                    <Progress className="mt-4" size="xs" value={pj.progress} label={<span className="truncate text-[12.5px] text-fg-muted">{t(pj.name)}</span>} showValue />
                  ) : null}
                  <p className="mt-3 flex-1 text-[12px] text-fg-subtle">
                    {pending ? c(`${pending} waiting on the client`, `${pending} öğe müşteride bekliyor`) : c("Nothing waiting on the client", "Müşteride bekleyen yok")} · {c("last visit", "son ziyaret")} {ago(lastClientVisit[co.id]!)}
                  </p>
                  <Button size="sm" variant="secondary" className="mt-3 self-start" onClick={() => onOpenWorkspace(w.id)}>
                    {c("Open portal", "Portalı aç")} <ArrowUpRight aria-hidden className="rtl:-scale-x-100" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </Stagger>
      </section>

      <section aria-labelledby="ag-deals">
        <h2 id="ag-deals" className="text-[15px] font-semibold text-fg">{c("Partner deal registrations", "İş ortağı fırsat kayıtları")}</h2>
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-ui border border-line bg-surface">
          {registrations.slice(0, 5).map((r) => {
            const pt = partners.find((p) => p.id === r.partnerId)!;
            const open = r.status === "submitted";
            return (
              <li key={r.id} className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3", open && "bg-accent-soft/40")}>
                <span className="min-w-0 flex-1 basis-48">
                  <span className="block truncate text-[13.5px] text-fg">{r.prospect}</span>
                  <span className="block truncate text-[12px] text-fg-subtle">
                    {pt.name} · {c("submitted", "gönderildi")} {f.date(r.submitted, "medium")}
                  </span>
                </span>
                <span className="tabular w-24 text-end text-[13px] font-medium text-fg">{money(r.value, { whole: true })}</span>
                {open ? (
                  <span className="flex gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => onDecide(r.id, "rejected")} aria-label={c(`Reject ${r.prospect}`, `${r.prospect} reddet`)}>
                      <X aria-hidden /> <span className="max-sm:hidden">{c("Reject", "Reddet")}</span>
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => onDecide(r.id, "approved")} aria-label={c(`Approve ${r.prospect}`, `${r.prospect} onayla`)}>
                      <Check aria-hidden /> <span className="max-sm:hidden">{c("Approve", "Onayla")}</span>
                    </Button>
                  </span>
                ) : (
                  <Badge tone={r.status === "won" || r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "neutral"} className="w-fit">
                    {t(registrationStatusLabels[r.status])}
                  </Badge>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
