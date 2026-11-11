"use client";

import * as React from "react";
import { cn } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { daysBetween, TODAY } from "../../_shared/time";
import { contract, noticeDeadline } from "./contract-data";

/**
 * The contract term as one ruler: start, today, the notice deadline and the end date,
 * with the notice window shaded. Reads left to right in LTR and mirrors in RTL.
 */
export function TermRibbon({ autoRenew }: { autoRenew: boolean }) {
  const { c, f } = useBlockFormat();
  const total = daysBetween(contract.start, contract.end);
  const pos = (d: string) => `${Math.min(100, Math.max(0, (daysBetween(contract.start, d) / total) * 100))}%`;
  const toNotice = daysBetween(TODAY, noticeDeadline);
  const toEnd = daysBetween(TODAY, contract.end);
  const elapsed = Math.round((daysBetween(contract.start, TODAY) / total) * 100);

  const counters = [
    { value: toNotice, label: c("days to the notice deadline", "gün bildirim son gününe"), strong: true },
    { value: toEnd, label: autoRenew ? c("days until it renews", "gün yenilemeye") : c("days until it ends", "gün bitişe") },
    { value: elapsed, label: c("% of the term used", "% dönem kullanıldı") },
  ];

  return (
    <section aria-labelledby="term-heading" className="surface rounded-ui-lg px-4 pb-4 pt-3.5 md:px-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="term-heading" className="text-[13px] font-medium text-fg">
          {c("Current term", "Yürürlükteki dönem")}
          <span className="ms-2 font-normal text-fg-muted">{f.dateRange(contract.start, contract.end, "medium")}</span>
        </h2>
        <dl className="flex flex-wrap gap-x-6 gap-y-1.5">
          {counters.map((k) => (
            <div key={k.label} className="flex items-baseline gap-1.5">
              <dd className={cn("order-first font-display text-xl leading-none tabular", k.strong ? "text-fg" : "text-fg-muted")}>
                <CountUp value={k.value} />
              </dd>
              <dt className="text-[12px] text-fg-muted">{k.label}</dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative mt-8 mb-11 sm:mb-12" aria-hidden="true">
        <div className="relative h-2 overflow-hidden rounded-full bg-track">
          <div className="absolute inset-y-0 start-0 rounded-full bg-fg-subtle/60" style={{ width: pos(TODAY) }} />
          <div
            className="tone-warning absolute inset-y-0 end-0 bg-[repeating-linear-gradient(135deg,var(--tone)_0_3px,transparent_3px_7px)] opacity-60"
            style={{ insetInlineStart: pos(noticeDeadline) }}
          />
        </div>
        <Marker at={pos(TODAY)} label={c("Today", "Bugün")} date={f.date(TODAY, { day: "numeric", month: "short" })} tone="today" />
        <Marker at={pos(noticeDeadline)} label={c("Notice deadline", "Bildirim son günü")} date={f.date(noticeDeadline, { day: "numeric", month: "short" })} tone="warning" />
        <span className="absolute start-0 -top-5 text-[11px] text-fg-subtle tabular">{f.date(contract.start, { day: "numeric", month: "short", year: "numeric" })}</span>
        <span className="absolute end-0 -top-5 text-[11px] text-fg-subtle tabular">{f.date(contract.end, { day: "numeric", month: "short", year: "numeric" })}</span>
      </div>

      <p className="text-[12.5px] text-fg-muted">
        {autoRenew
          ? c(
              `Renews automatically for ${contract.renewalMonths} months unless either side gives notice by ${f.date(noticeDeadline, "long")}.`,
              `Taraflardan biri ${f.date(noticeDeadline, "long")} tarihine kadar bildirimde bulunmazsa ${contract.renewalMonths} ay otomatik yenilenir.`,
            )
          : c(
              `Auto-renewal is off. The agreement ends on ${f.date(contract.end, "long")}.`,
              `Otomatik yenileme kapalı. Sözleşme ${f.date(contract.end, "long")} tarihinde sona erer.`,
            )}
      </p>
    </section>
  );
}

function Marker({ at, label, date, tone }: { at: string; label: string; date: string; tone: "today" | "warning" }) {
  return (
    <span className="absolute -top-1.5 flex -translate-x-1/2 flex-col items-center rtl:translate-x-1/2" style={{ insetInlineStart: at }}>
      <span className={cn("h-5 w-0.5 rounded-full", tone === "today" ? "bg-fg" : "tone-warning bg-[var(--tone)]")} />
      <span className="mt-1 whitespace-nowrap text-[11px] font-medium text-fg max-sm:hidden">{label}</span>
      <span className="whitespace-nowrap text-[11px] text-fg-muted tabular">{date}</span>
    </span>
  );
}
