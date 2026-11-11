"use client";

import * as React from "react";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import { Avatar, Badge, Card, CardHeader, cn } from "@vamos-ui/react";
import type { LineTotals } from "@vamos-ui/react/business";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import type { Person } from "../../_shared/people";
import { MIN_MARGIN, discountBands } from "./data";

export interface DeskFigures {
  totals: LineTotals;
  /** All discounts ÷ list subtotal, 0–100. */
  discountPct: number;
  /** Gross margin on the net, 0–100. */
  marginPct: number;
  /** Net of recurring lines (per year) and one-off lines. */
  recurring: number;
  oneOff: number;
  approver: Person | null;
  approved: boolean;
}

const SCALE = 30; // the meter shows 0–30 %

/** Deal desk: what the customer pays, what we keep, and who has to say yes before it goes out. */
export function DealDesk({ figures, currency }: { figures: DeskFigures; currency: string }) {
  const { f, t, c } = useBlockFormat();
  const { totals, discountPct, marginPct, recurring, oneOff, approver, approved } = figures;
  const money = (v: string | number) => f.currency(v, currency, { maximumFractionDigits: 0, minimumFractionDigits: 0 });
  const pos = Math.min(100, (discountPct / SCALE) * 100);
  const lowMargin = marginPct < MIN_MARGIN;

  return (
    <Card as="section" aria-labelledby="desk-title" className="overflow-hidden">
      <CardHeader titleId="desk-title" titleAs="h2" eyebrow={c("Deal desk", "Fiyat masası")} title={c("Customer pays", "Müşteri öder")} />
      <div className="px-(--card-p) pb-(--card-p)">
        <p className="font-mono text-[2rem] leading-none tracking-tight text-fg tabular">
          <CountUp value={Number(totals.total)} format={{ style: "currency", currency, maximumFractionDigits: 0 }} duration={700} />
        </p>
        <p className="mt-1.5 text-xs text-fg-subtle">{c("incl. 20% KDV · first-year value", "%20 KDV dahil · ilk yıl tutarı")}</p>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 text-sm">
          <Figure label={c("Recurring / year", "Yıllık tekrarlayan")} value={money(recurring)} />
          <Figure label={c("One-off services", "Tek seferlik hizmet")} value={money(oneOff)} />
          <Figure label={c("Net before tax", "Vergi öncesi net")} value={money(totals.net)} />
          <Figure label="KDV" value={money(totals.tax)} />
        </dl>

        <div className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <p id="disc-label" className="text-sm font-medium text-fg">{c("Effective discount", "Toplam indirim")}</p>
            <p className="font-mono text-sm text-fg tabular">{f.percent(discountPct / 100, { maximumFractionDigits: 1 })} · {money(totals.discount)}</p>
          </div>
          {/* Three bands: rep, sales manager, finance. The notch is the quote's discount. */}
          <div
            role="meter"
            aria-labelledby="disc-label"
            aria-valuemin={0}
            aria-valuemax={SCALE}
            aria-valuenow={Math.round(discountPct * 10) / 10}
            aria-valuetext={`${f.percent(discountPct / 100, { maximumFractionDigits: 1 })} · ${t(bandFor(discountPct).label)}`}
            className="relative mt-3 h-2"
          >
            <div className="absolute inset-0 flex gap-0.5 overflow-hidden rounded-full">
              <span className="h-full bg-success/45" style={{ width: `${(10 / SCALE) * 100}%` }} />
              <span className="h-full bg-warning/45" style={{ width: `${(10 / SCALE) * 100}%` }} />
              <span className="h-full flex-1 bg-danger/40" />
            </div>
            <span
              aria-hidden
              className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg shadow-[0_0_0_2px_var(--surface)] transition-[left] duration-300 rtl:translate-x-1/2"
              style={{ insetInlineStart: `${pos}%` }}
            />
          </div>
          <div aria-hidden className="mt-1.5 grid grid-cols-3 text-[11px] text-fg-subtle">
            <span>0–10%</span>
            <span>10–20%</span>
            <span>20%+</span>
          </div>
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium text-fg">{c("Gross margin", "Brüt marj")}</p>
          <p className={cn("font-mono text-sm tabular", lowMargin ? "text-danger" : "text-fg")}>{f.percent(marginPct / 100, { maximumFractionDigits: 1 })}</p>
        </div>
        <p className="mt-0.5 text-xs text-fg-subtle">{c(`Floor ${MIN_MARGIN}% · cost of delivery is internal`, `Alt sınır %${MIN_MARGIN} · teslim maliyeti şirket içi`)}</p>

        <div className={cn("mt-5 flex items-start gap-3 rounded-ui p-3", approver && !approved ? "tone-warning tone-soft" : "surface-2")} aria-live="polite">
          {approver ? (
            <>
              <Avatar name={approver.name} size="sm" />
              <div className="min-w-0 text-sm">
                <p className="font-medium text-fg">
                  {approved ? c(`Approved by ${approver.name}`, `${approver.name} onayladı`) : c(`Needs ${approver.name}`, `${approver.name} onayı gerekli`)}
                </p>
                <p className="text-xs text-fg-muted">
                  {lowMargin
                    ? c("Margin is under the floor", "Marj alt sınırın altında")
                    : t(bandFor(discountPct).label)}
                  {" · "}
                  {t(approver.title)}
                </p>
              </div>
              {approved ? <Badge tone="success" className="ms-auto shrink-0" dot>{c("Approved", "Onaylı")}</Badge> : <TriangleAlert className="ms-auto size-4 shrink-0" aria-hidden />}
            </>
          ) : (
            <>
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              <p className="text-sm text-fg-muted">{c("Within your limits. You can send this quote without approval.", "Yetki sınırınız içinde. Bu teklifi onaysız gönderebilirsiniz.")}</p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

export function bandFor(pct: number) {
  return discountBands.find((b) => pct <= b.upTo) ?? discountBands[discountBands.length - 1]!;
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-fg-subtle">{label}</dt>
      <dd className="mt-0.5 truncate font-mono text-fg tabular">{value}</dd>
    </div>
  );
}
