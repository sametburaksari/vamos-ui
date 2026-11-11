"use client";

import * as React from "react";
import { Badge, cn, Slider, ThemeScope } from "@vamos-ui/react";
import { copyFor, INSTALL_LINE, LANG_LABEL, planCost, plans, trace, VOLUMES, type SiteLocale } from "./content";
import { CopyButton } from "./code-panel";
import { useLang } from "./lang-provider";

/** The one-line install command in the hero; follows the language chosen anywhere on the page. */
export function InstallLine({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const { lang } = useLang();
  const line = INSTALL_LINE[lang];
  return (
    <div className="flex w-full max-w-[30rem] min-w-0 items-center gap-2 rounded-ui border border-line bg-surface-2 py-1 ps-3 pe-1 font-mono text-[13px]">
      <span aria-hidden className="select-none text-accent-ink">$</span>
      <span className="min-w-0 flex-1 truncate text-fg" title={line}>
        {line}
      </span>
      <span className="hidden shrink-0 text-[11px] text-fg-subtle sm:inline">{LANG_LABEL[lang]}</span>
      <CopyButton text={line} label={t({ en: "Copy install command", tr: "Kurulum komutunu kopyala" })} doneLabel={t({ en: "Copied", tr: "Kopyalandı" })} size="icon-xs" />
    </div>
  );
}

/** What happened to the event in the hero code: two 503s, then a 200 — told as a delivery log. */
export function DeliveryTrace({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  return (
    <ThemeScope theme="dark" portal={false} className="overflow-hidden rounded-ui-lg border border-line bg-surface-2 font-mono text-[12px] text-fg">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="tracking-[0.06em] text-fg-subtle uppercase">{t({ en: "Delivery log · evt_2Kx9qL", tr: "Teslim kaydı · evt_2Kx9qL" })}</span>
        <Badge tone="success" size="sm" dot>
          {t({ en: "Delivered", tr: "Teslim edildi" })}
        </Badge>
      </div>
      <ol className="m-0 list-none p-0">
        {trace.map((row, i) => (
          <li
            key={row.attempt}
            style={{ animationDelay: `${300 + i * 260}ms` }}
            className="grid grid-cols-[auto_auto_1fr] items-baseline gap-x-3 gap-y-0.5 border-b border-line px-4 py-2 last:border-b-0 motion-safe:animate-[ui-fade_420ms_ease_both] sm:grid-cols-[6.5rem_auto_auto_1fr]"
          >
            <span className="hidden text-fg-subtle tabular sm:inline">{row.time}</span>
            <span className="text-fg-muted">#{row.attempt}</span>
            <span className={cn("font-semibold tabular", row.status < 300 ? "text-success" : "text-warning")}>{row.status}</span>
            <span className="min-w-0 truncate text-fg-muted">
              <span className="text-fg tabular">{f.number(row.ms)} ms</span> · {t(row.note)}
            </span>
          </li>
        ))}
      </ol>
    </ThemeScope>
  );
}

/** Drag the monthly volume; each plan shows its price at that volume and the cheapest one lights up. */
export function CostEstimator({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const [index, setIndex] = React.useState(4);
  const events = VOLUMES[index]!;
  const costs = plans.map((p) => ({ plan: p, cost: planCost(p, events) }));
  const best = costs.filter((c) => c.cost !== null).sort((a, b) => a.cost! - b.cost!)[0]?.plan.id;
  const id = "relay-estimator";

  return (
    <div className="rounded-ui-lg border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p id={`${id}-label`} className="m-0 text-sm font-medium text-fg">
          {t({ en: "Events per month", tr: "Aylık olay sayısı" })}
        </p>
        <p className="m-0 font-mono text-2xl font-semibold tracking-[-0.03em] text-fg tabular" aria-live="polite">
          {f.number(events)}
        </p>
      </div>
      <Slider
        className="mt-4"
        min={0}
        max={VOLUMES.length - 1}
        step={1}
        value={[index]}
        onValueChange={(v) => setIndex(v[0] ?? 0)}
        aria-labelledby={`${id}-label`}
        thumbLabels={[t({ en: "Events per month", tr: "Aylık olay sayısı" })]}
        formatValue={(v) => f.compact(VOLUMES[v] ?? 0)}
        marks={VOLUMES.map((v, i) => ({ value: i, label: i % 2 === 0 ? f.compact(v) : undefined }))}
      />
      <dl className="mt-8 grid gap-px overflow-hidden rounded-ui border border-line bg-line sm:grid-cols-3">
        {costs.map(({ plan, cost }) => (
          <div key={plan.id} className={cn("bg-surface px-4 py-3", plan.id === best && "bg-accent-soft")}>
            <dt className="flex items-center justify-between gap-2 font-mono text-[11px] tracking-[0.08em] text-fg-muted uppercase">
              {plan.name}
              {plan.id === best ? (
                <Badge tone="outline" size="sm">
                  {t({ en: "Cheapest", tr: "En uygun" })}
                </Badge>
              ) : null}
            </dt>
            <dd className="m-0 mt-1 font-mono text-xl font-semibold text-fg tabular">
              {cost === null ? <span className="text-sm font-normal text-fg-subtle">{t({ en: "Over the cap", tr: "Sınırın üstünde" })}</span> : f.currency(String(cost.toFixed(2)))}
              {cost !== null ? <span className="ms-1 text-xs font-normal text-fg-muted">{t({ en: "/ month", tr: "/ ay" })}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
      <p className="m-0 mt-3 text-xs text-fg-muted">{t({ en: "Retries and fan-out are free. Prices exclude VAT.", tr: "Yeniden denemeler ve dağıtım ücretsizdir. Fiyatlara KDV dahil değildir." })}</p>
    </div>
  );
}
