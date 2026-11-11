"use client";

import { Card, Tooltip, cn } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { burnOf, clientOf, healthDot, tryCompact, type Health, type Project } from "./data";

const Y_MAX = 1.2; // budget used axis tops out at 120%

/**
 * Budget used against work done, one dot per project. Above the diagonal a project spends faster
 * than it delivers. Dots are buttons that open the project; size follows the budget.
 */
export function BurnMap({ projects, health, onOpen }: { projects: Project[]; health: Record<string, Health>; onOpen: (id: string) => void }) {
  const { f, t, c } = useBlockFormat();
  const rows = projects.map((p) => ({ p, b: burnOf(p) }));
  const budget = rows.reduce((s, r) => s + r.b.budget, 0);
  const spent = rows.reduce((s, r) => s + r.b.spent, 0);
  const eac = rows.reduce((s, r) => s + r.b.eac, 0);
  const over = rows.filter((r) => r.b.used > r.b.progress + 0.05);
  const maxBudget = Math.max(...rows.map((r) => r.b.budget), 1);
  const pct = (v: number) => f.percent(v, { maximumFractionDigits: 0 });

  return (
    <Card className="ui-rise min-w-0 overflow-hidden">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)]">
        <section aria-labelledby="burn-title" className="min-w-0 p-(--card-p)">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="burn-title" className="text-[15px] font-medium text-fg">{c("Burn against delivery", "Harcama ve teslim dengesi")}</h2>
            <p className="text-xs text-fg-subtle">{c("Above the line: money runs ahead of the work", "Çizginin üstü: para işten hızlı gidiyor")}</p>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2">
            <div aria-hidden className="relative w-8 text-[11px] text-fg-subtle tabular">
              {[0, 0.5, 1].map((v) => (
                <span key={v} className="absolute end-0 translate-y-1/2" style={{ bottom: `${(v / Y_MAX) * 100}%` }}>
                  {pct(v)}
                </span>
              ))}
            </div>
            <div className="relative aspect-[4/3] rounded-ui-sm border border-line bg-surface-2 sm:aspect-[16/8]">
              <svg aria-hidden className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points={`0,100 100,${100 - 100 / Y_MAX} 100,0 0,0`} className="fill-danger/[0.07]" />
                {[0.25, 0.5, 0.75].map((x) => (
                  <line key={`x${x}`} x1={x * 100} x2={x * 100} y1={0} y2={100} className="stroke-line" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                ))}
                <line x1={0} x2={100} y1={100 - 100 / Y_MAX} y2={100 - 100 / Y_MAX} className="stroke-fg-subtle" strokeDasharray="3 3" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                <line x1={0} y1={100} x2={100} y2={100 - 100 / Y_MAX} className="stroke-fg-muted" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
              </svg>
              <span aria-hidden className="absolute end-2 text-[10px] text-fg-subtle" style={{ bottom: `calc(${(1 / Y_MAX) * 100}% + 3px)` }}>
                {c("Budget", "Bütçe")}
              </span>

              <ul aria-label={c("Projects by progress and budget used", "İlerleme ve kullanılan bütçeye göre projeler")} className="absolute inset-0">
                {rows.map(({ p, b }) => {
                  const size = 14 + Math.sqrt(b.budget / maxBudget) * 22;
                  const x = Math.min(98, Math.max(2, b.progress * 100));
                  const y = Math.min(98, (b.used / Y_MAX) * 100);
                  const label = `${p.code} ${t(p.name)} · ${c(`${pct(b.progress)} done, ${pct(b.used)} of budget used`, `%${Math.round(b.progress * 100)} tamamlandı, bütçenin %${Math.round(b.used * 100)} kullanıldı`)}`;
                  return (
                    <li key={p.id} className="absolute" style={{ insetInlineStart: `${x}%`, bottom: `${y}%` }}>
                      <Tooltip content={label}>
                        <button
                          type="button"
                          aria-label={label}
                          onClick={() => onOpen(p.id)}
                          className={cn("focus-ring absolute -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-surface-2 opacity-90 transition-transform hover:scale-110 rtl:translate-x-1/2", healthDot[health[p.id] ?? p.health])}
                          style={{ width: size, height: size }}
                        />
                      </Tooltip>
                      <span aria-hidden className="pointer-events-none absolute -translate-y-1/2 font-mono text-[10px] whitespace-nowrap text-fg-muted max-sm:hidden" style={x > 85 ? { insetInlineEnd: size / 2 + 6 } : { insetInlineStart: size / 2 + 6 }}>
                        {p.code}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <span />
            <div aria-hidden className="mt-1.5 flex justify-between text-[11px] text-fg-subtle tabular">
              <span>0%</span>
              <span>{c("Work done", "Tamamlanan iş")}</span>
              <span>100%</span>
            </div>
          </div>
        </section>

        <dl className="grid grid-cols-2 content-start gap-x-4 gap-y-5 border-line p-(--card-p) max-lg:border-t lg:grid-cols-1 lg:border-s">
          <div>
            <dt className="text-[13px] text-fg-muted">{c("Portfolio budget", "Portföy bütçesi")}</dt>
            <dd className="mt-1 font-display text-[clamp(1.6rem,2.4vw,2.2rem)] leading-none text-fg">
              <CountUp value={Math.round(budget)} format={{ style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", notation: "compact", maximumFractionDigits: 1 }} />
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-fg-muted">{c("Spent so far", "Şu ana kadar harcanan")}</dt>
            <dd className="mt-1 font-mono text-lg font-medium text-fg tabular">
              {tryCompact(f, spent)} <span className="text-xs font-normal text-fg-subtle">· {pct(spent / budget)}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-fg-muted">{c("Forecast at completion", "Bitişte tahmini maliyet")}</dt>
            <dd className={cn("mt-1 font-mono text-lg font-medium tabular", eac > budget ? "text-danger" : "text-fg")}>
              {tryCompact(f, eac)}
              <span className="block text-xs font-normal">{eac > budget ? c(`${tryCompact(f, eac - budget)} over`, `${tryCompact(f, eac - budget)} aşım`) : c(`${tryCompact(f, budget - eac)} under`, `${tryCompact(f, budget - eac)} altında`)}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-fg-muted">{c("Burning ahead of delivery", "Teslimden hızlı harcayan")}</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {over.length ? (
                over.map((r) => (
                  <button key={r.p.id} type="button" onClick={() => onOpen(r.p.id)} className="focus-ring rounded-ui-sm bg-danger/10 px-1.5 py-0.5 font-mono text-xs text-danger hover:bg-danger/15">
                    {r.p.code}
                    <span className="sr-only"> · {clientOf(r.p)?.name}</span>
                  </button>
                ))
              ) : (
                <span className="text-[13px] text-fg-muted">{c("None", "Yok")}</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
