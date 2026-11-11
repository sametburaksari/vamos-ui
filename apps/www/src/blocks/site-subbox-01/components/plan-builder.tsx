"use client";

import * as React from "react";
import { Button, RadioGroup } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { CircleCheck } from "lucide-react";
import { BagStack } from "./bag-stack";
import { useBox } from "./box-provider";
import { addDays, copyFor, frequencies, GRAMS_PER_CUP, grinds, nextShipDate, priceFor, roasts, sizes, TODAY, type GrindId, type RoastId, type SiteLocale } from "./content";
import { PlanMatrix } from "./plan-matrix";

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-fg/70 pt-5">
      <h2 className="flex items-baseline gap-3 font-display text-[1.6rem] leading-tight text-fg">
        <span className="font-mono text-xs text-fg-muted">{n}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * The whole builder on the plans page: the size × frequency grid, roast and grind, and a sticky
 * receipt with the bags as they will arrive, the price per delivery and per cup, what it comes to
 * over four weeks, the next four shipping Wednesdays and the order button.
 */
export function PlanBuilder({ locale }: { locale: SiteLocale }) {
  const { t, f, tl, tl2 } = copyFor(locale);
  const { plan, setPlan, order, placeOrder, resetOrder } = useBox();
  const [sending, setSending] = React.useState(false);
  const statusRef = React.useRef<HTMLDivElement>(null);
  const size = sizes.find((s) => s.id === plan.size)!;
  const freq = frequencies.find((x) => x.id === plan.freq)!;
  const price = priceFor(plan.size, plan.freq);
  const cups = Math.floor(size.grams / GRAMS_PER_CUP);
  const per4Weeks = price * (28 / freq.days);
  const saving = size.price - price;
  const first = nextShipDate(TODAY);
  const dates = Array.from({ length: 4 }, (_, i) => addDays(first, i * freq.days));
  const roastDate = addDays(first, -1);

  const start = () => {
    setSending(true);
    window.setTimeout(() => {
      placeOrder();
      setSending(false);
      requestAnimationFrame(() => statusRef.current?.focus());
    }, 700);
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-14">
      <div className="flex min-w-0 flex-col gap-12">
        <Step n="01" title={t({ en: "Size and rhythm", tr: "Boyut ve sıklık" })}>
          <PlanMatrix locale={locale} idPrefix="bx-plans" />
          <p className="mt-3 text-small text-fg-muted">{t({ en: "Prices include VAT and delivery anywhere in Türkiye. Skip, pause or cancel before Monday 23:59.", tr: "Fiyatlara KDV ve Türkiye’nin her yerine teslimat dahildir. Pazartesi 23.59’a kadar atlayın, duraklatın ya da iptal edin." })}</p>
        </Step>
        <Step n="02" title={t({ en: "Roast", tr: "Kavrum" })}>
          <RadioGroup<RoastId>
            variant="card"
            aria-label={t({ en: "Roast", tr: "Kavrum" })}
            value={plan.roast}
            onValueChange={(v) => setPlan({ roast: v })}
            items={roasts.map((r) => ({ value: r.id, label: t(r.name), description: t(r.note) }))}
            className="grid-cols-2 xl:grid-cols-4"
          />
        </Step>
        <Step n="03" title={t({ en: "Grind", tr: "Öğütüm" })}>
          <RadioGroup<GrindId>
            variant="segmented"
            aria-label={t({ en: "Grind", tr: "Öğütüm" })}
            value={plan.grind}
            onValueChange={(v) => setPlan({ grind: v })}
            items={grinds.map((g) => ({ value: g.id, label: t(g.name) }))}
            className="flex-wrap"
          />
          <p className="mt-3 text-small text-fg-muted">{t({ en: "Whole bean keeps longest. We grind on the morning we pack, never before.", tr: "Çekirdek en uzun dayanır. Paketlediğimiz sabah öğütürüz, asla önceden değil." })}</p>
        </Step>
      </div>

      <aside aria-labelledby="bx-receipt-title" className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-ui-lg border border-fg/70 bg-surface">
          <div className="border-b border-dashed border-fg/40 bg-[radial-gradient(circle_at_50%_120%,var(--accent-soft),transparent_70%)]">
            <BagStack locale={locale} roastDate={roastDate} />
          </div>
          <div className="p-5 sm:p-6">
            <h2 id="bx-receipt-title" className="font-mono text-[11px] tracking-[0.1em] text-fg-muted uppercase">
              {t({ en: "Your box", tr: "Kutunuz" })}
            </h2>
            <dl className="mt-3 flex flex-col text-small" aria-live="polite">
              {[
                [t({ en: "Size", tr: "Boyut" }), `${t(size.name)} · ${size.grams} g`],
                [t({ en: "Arrives", tr: "Sıklık" }), t(freq.name)],
                [t({ en: "Roast", tr: "Kavrum" }), t(roasts.find((r) => r.id === plan.roast)!.name)],
                [t({ en: "Grind", tr: "Öğütüm" }), t(grinds.find((g) => g.id === plan.grind)!.name)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-dotted border-line py-1.5">
                  <dt className="text-fg-muted">{k}</dt>
                  <dd className="text-end font-medium text-fg">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 flex items-end justify-between gap-4">
              <span className="text-small text-fg-muted">{t({ en: "Per delivery", tr: "Teslimat başına" })}</span>
              <span className="font-display text-[2.4rem] leading-none text-fg tabular" data-testid="box-price">
                {tl(price)}
              </span>
            </p>
            <p className="mt-2 flex justify-between font-mono text-xs text-fg-muted">
              <span>
                {tl2(price / cups)} {t({ en: "per cup", tr: "fincan başına" })}
              </span>
              <span>
                ≈ {tl(per4Weeks)} / {t({ en: "4 weeks", tr: "4 hafta" })}
              </span>
            </p>
            {saving > 0 ? <p className="mt-2 text-xs font-medium text-accent-ink">{t({ en: `You save ${tl(saving)} on every box`, tr: `Her kutuda ${tl(saving)} tasarruf` })}</p> : null}

            <h3 className="mt-6 font-mono text-[11px] tracking-[0.1em] text-fg-muted uppercase">{t({ en: "Ships on", tr: "Kargo günleri" })}</h3>
            <ol className="mt-2 grid grid-cols-4 gap-1.5 text-center">
              {dates.map((d, i) => (
                <li key={d} className={i === 0 ? "rounded-ui-sm bg-fg px-1 py-2 text-scene" : "rounded-ui-sm border border-line px-1 py-2 text-fg"}>
                  <span className="block font-mono text-[10px] uppercase opacity-75">{f.date(d, { month: "short" })}</span>
                  <span className="block font-display text-lg leading-none tabular">{f.date(d, { day: "numeric" })}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6">
              {order ? (
                <div ref={statusRef} tabIndex={-1} role="status" className="rounded-ui border border-line bg-surface-2 p-4 focus-ring" data-testid="box-order">
                  <p className="flex items-center gap-2 font-medium text-fg">
                    <CircleCheck aria-hidden className="size-5 text-success" />
                    {t({ en: "Subscription started", tr: "Abonelik başladı" })}
                  </p>
                  <p className="mt-1 text-small text-fg-muted">
                    {t({ en: `Order ${order}. Your first box is roasted on ${f.date(roastDate, { weekday: "long", day: "numeric", month: "long" })} and ships the next day.`, tr: `Sipariş ${order}. İlk kutunuz ${f.date(roastDate, { weekday: "long", day: "numeric", month: "long" })} kavrulur ve ertesi gün kargoya verilir.` })}
                  </p>
                  <Button type="button" variant="link" className="mt-2" onClick={resetOrder}>
                    {t({ en: "Change the plan", tr: "Planı değiştir" })}
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="primary" size="lg" className="w-full" loading={sending} loadingText={t({ en: "Starting…", tr: "Başlatılıyor…" })} onClick={start}>
                  {t({ en: `Start for ${tl(price)}`, tr: `${tl(price)} ile başla` })}
                </Button>
              )}
              <p className="mt-3 text-center text-xs text-fg-muted">
                {t({ en: "Buying for someone else?", tr: "Başkası için mi alıyorsunuz?" })}{" "}
                <a href={sitePageHref("gift")} className="rounded-[2px] text-fg underline underline-offset-4 focus-ring">
                  {t({ en: "Send it as a gift", tr: "Hediye olarak gönderin" })}
                </a>
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
