"use client";

import * as React from "react";
import { Button, Checkbox, cn, RadioGroup, Slider } from "@vamos-ui/react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { addons, defaultBuild, fill, num, priceBuild, sessionById, sessions, tl, type SessionId } from "./content";
import { useBuild } from "./build-provider";

const c = {
  s1: { en: "Session", tr: "Çekim" },
  s2: { en: "Studio time", tr: "Stüdyo süresi" },
  s3: { en: "Retouched images", tr: "Rötuşlu kareler" },
  s3b: { en: "People", tr: "Kişi sayısı" },
  s4: { en: "Extras", tr: "Ekstralar" },
  from: { en: "from {price}", tr: "{price}’den başlar" },
  incl: { en: "{hours} h and {images} images included", tr: "{hours} saat ve {images} kare dahil" },
  hours: { en: "{n} h", tr: "{n} sa" },
  hoursLong: { en: "{n} h in the studio", tr: "Stüdyoda {n} saat" },
  images: { en: "{n} images", tr: "{n} kare" },
  people: { en: "{n} people", tr: "{n} kişi" },
  extraHour: { en: "+{price} per extra hour", tr: "Ek saat başına +{price}" },
  extraImage: { en: "+{price} per extra image", tr: "Ek kare başına +{price}" },
  extraPerson: { en: "{n} included · +{price} per extra person", tr: "{n} kişi dahil · ek kişi başına +{price}" },
  sheet: { en: "Contact sheet", tr: "Kontak baskı" },
  quote: { en: "Quote", tr: "Teklif" },
  subtotal: { en: "Subtotal", tr: "Ara toplam" },
  vat: { en: "VAT 20%", tr: "KDV %20" },
  total: { en: "Total", tr: "Toplam" },
  deposit: { en: "Deposit to hold the date (30%)", tr: "Tarihi tutmak için kapora (%30)" },
  delivery: { en: "Delivery in {n} working days", tr: "{n} iş gününde teslim" },
  book: { en: "Book this package", tr: "Bu paketi ayırt" },
  reset: { en: "Start over", tr: "Baştan başla" },
  live: { en: "Total {total}, including VAT.", tr: "KDV dahil toplam {total}." },
  percent: { en: "+{n}% of the subtotal", tr: "ara toplamın +%{n}’i" },
};

/** Numbered step heading in the contact-sheet style ("02 — Studio time"). */
function StepHead({ n, children, aside }: { n: number; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4 border-t border-fg pt-3">
      <h2 className="flex items-baseline gap-3 font-mono text-small tracking-tight text-fg uppercase">
        <span className="text-fg-muted">{String(n).padStart(2, "0")}</span>
        {children}
      </h2>
      {aside ? <span className="tabular font-mono text-small text-fg">{aside}</span> : null}
    </div>
  );
}

/**
 * Signature element: build a shoot from a session type, studio time, retouched images (and
 * people for headshots) and extras. The receipt on the side is a live contact sheet: line
 * items, VAT, total, deposit and delivery time. "Book this package" carries it to booking.
 */
export function PackageBuilder() {
  const { t, locale, build, update, load } = useBuild();
  const s = sessionById(build.session);
  const price = priceBuild(build);
  const money = (n: number) => tl(n, locale);

  return (
    <div className="grid gap-12 @5xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] @5xl:gap-16">
      <div className="flex min-w-0 flex-col gap-12">
        <section aria-labelledby="lr-b1">
          <StepHead n={1}>
            <span id="lr-b1">{t(c.s1)}</span>
          </StepHead>
          <RadioGroup
            aria-labelledby="lr-b1"
            variant="card"
            value={build.session}
            onValueChange={(v) => update({ session: v as SessionId })}
            className="grid gap-2 @2xl:grid-cols-2"
            items={sessions.map((x) => ({
              value: x.id,
              label: (
                <span className="flex items-baseline justify-between gap-3">
                  <span>{t(x.name)}</span>
                  <span className="tabular shrink-0 font-mono text-[12px] font-normal text-fg-muted">{fill(t(c.from), { price: money(x.base) })}</span>
                </span>
              ),
              description: `${t(x.text)} ${fill(t(c.incl), { hours: x.hours, images: x.images })}.`,
            }))}
          />
        </section>

        <section aria-labelledby="lr-b2">
          <StepHead n={2} aside={fill(t(c.hours), { n: num(build.hours, locale, 1) })}>
            <span id="lr-b2">{t(c.s2)}</span>
          </StepHead>
          <Slider
            aria-labelledby="lr-b2"
            min={s.hours}
            max={s.maxHours}
            step={0.5}
            value={[build.hours]}
            onValueChange={([v]) => update({ hours: v ?? s.hours })}
            formatValue={(v) => fill(t(c.hours), { n: num(v, locale, 1) })}
            showValue="hover"
            marks={[{ value: s.hours, label: fill(t(c.hours), { n: s.hours }) }, { value: s.maxHours, label: fill(t(c.hours), { n: s.maxHours }) }]}
          />
          <p className="mt-8 font-mono text-[12px] text-fg-muted">{fill(t(c.extraHour), { price: money(s.extraHour) })}</p>
        </section>

        <section aria-labelledby="lr-b3">
          <StepHead n={3} aside={fill(t(c.images), { n: build.images })}>
            <span id="lr-b3">{t(c.s3)}</span>
          </StepHead>
          <Slider
            aria-labelledby="lr-b3"
            min={s.images}
            max={s.maxImages}
            step={1}
            value={[build.images]}
            onValueChange={([v]) => update({ images: v ?? s.images })}
            formatValue={(v) => fill(t(c.images), { n: v })}
            marks={[{ value: s.images, label: String(s.images) }, { value: s.maxImages, label: String(s.maxImages) }]}
          />
          <p className="mt-8 font-mono text-[12px] text-fg-muted">{fill(t(c.extraImage), { price: money(s.extraImage) })}</p>
        </section>

        {s.people ? (
          <section aria-labelledby="lr-b3b">
            <StepHead n={4} aside={fill(t(c.people), { n: build.people })}>
              <span id="lr-b3b">{t(c.s3b)}</span>
            </StepHead>
            <Slider
              aria-labelledby="lr-b3b"
              min={1}
              max={s.people.max}
              step={1}
              value={[build.people]}
              onValueChange={([v]) => update({ people: v ?? 1 })}
              formatValue={(v) => fill(t(c.people), { n: v })}
              marks={[{ value: 1, label: "1" }, { value: s.people.max, label: String(s.people.max) }]}
            />
            <p className="mt-8 font-mono text-[12px] text-fg-muted">{fill(t(c.extraPerson), { n: s.people.included, price: money(s.people.extra) })}</p>
          </section>
        ) : null}

        <section aria-labelledby="lr-b4">
          <StepHead n={s.people ? 5 : 4}>
            <span id="lr-b4">{t(c.s4)}</span>
          </StepHead>
          <div className="grid gap-2 @2xl:grid-cols-2">
            {addons.map((a) => (
              <Checkbox
                key={a.id}
                variant="card"
                checked={build.addons.includes(a.id)}
                onCheckedChange={(v) => update({ addons: v === true ? [...build.addons, a.id] : build.addons.filter((x) => x !== a.id) })}
                label={
                  <span className="flex items-baseline justify-between gap-3">
                    <span>{t(a.name)}</span>
                    <span className="tabular shrink-0 font-mono text-[12px] font-normal text-fg-muted">{a.percent ? `+${a.percent}%` : money(a.price ?? 0)}</span>
                  </span>
                }
                description={t(a.text)}
              />
            ))}
          </div>
        </section>
      </div>

      <aside aria-labelledby="lr-sheet" className="self-start @5xl:sticky @5xl:top-24">
        <div className="relative border border-fg bg-surface p-5 @md:p-6">
          <span aria-hidden className="absolute -top-px -start-px size-3 border-s-2 border-t-2 border-fg" />
          <span aria-hidden className="absolute -end-px -bottom-px size-3 border-e-2 border-b-2 border-fg" />
          <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-line pb-3 font-mono text-[12px] text-fg-muted uppercase">
            <h2 id="lr-sheet" className="text-fg">
              {t(c.sheet)}
            </h2>
            <span>
              {t(c.quote)} LR-{build.session.slice(0, 2).toUpperCase()}
              {String(build.hours * 10).padStart(3, "0")}
            </span>
          </div>
          <ol className="flex flex-col py-3 font-mono text-[13px]">
            {price.lines.map((l, i) => (
              <li key={l.key} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-x-2 py-1.5 animate-[ui-rise_240ms_ease-out] motion-reduce:animate-none">
                <span aria-hidden className="text-fg-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 text-fg">
                  {t(l.label)}
                  {l.key === "base" ? <span className="block text-[11px] text-fg-muted">{fill(t(c.incl), { hours: s.hours, images: s.images })}</span> : null}
                  {l.key === "rush" ? <span className="block text-[11px] text-fg-muted">{fill(t(c.percent), { n: 30 })}</span> : null}
                  {l.key === "hours" ? <span className="block text-[11px] text-fg-muted">{fill(t(c.hoursLong), { n: num(build.hours - s.hours, locale, 1) })}</span> : null}
                  {l.key === "images" ? <span className="block text-[11px] text-fg-muted">{fill(t(c.images), { n: build.images - s.images })}</span> : null}
                  {l.key === "people" && s.people ? <span className="block text-[11px] text-fg-muted">{fill(t(c.people), { n: build.people - s.people.included })}</span> : null}
                </span>
                <span className="tabular text-end text-fg">{money(l.amount)}</span>
              </li>
            ))}
          </ol>
          <dl className="flex flex-col gap-1 border-t border-dashed border-line pt-3 font-mono text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="text-fg-muted">{t(c.subtotal)}</dt>
              <dd className="tabular text-fg">{money(price.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-fg-muted">{t(c.vat)}</dt>
              <dd className="tabular text-fg">{money(price.vat)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-end justify-between gap-3 border-t border-fg pt-4">
            <span className="font-mono text-small text-fg uppercase">{t(c.total)}</span>
            <span className="tabular font-display text-display-m leading-none text-fg" aria-hidden>
              <span key={price.total} className="lr-tick inline-block">
                {money(price.total)}
              </span>
            </span>
          </div>
          <p className="sr-only" aria-live="polite">
            {fill(t(c.live), { total: money(price.total) })}
          </p>
          <dl className="mt-4 flex justify-between gap-3 font-mono text-[12px] text-fg-muted">
            <dt>{t(c.deposit)}</dt>
            <dd className="tabular text-fg">{money(price.deposit)}</dd>
          </dl>
          <p className="mt-1 font-mono text-[12px] text-fg-muted">{fill(t(c.delivery), { n: price.delivery })}</p>
          <div className="mt-6 flex flex-col gap-2">
            <Button variant="primary" size="lg" onClick={() => load(build, "booking")} className={cn("w-full justify-between")}>
              {t(c.book)}
              <ArrowRight aria-hidden className="rtl:rotate-180" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => load(defaultBuild())} className="self-start">
              <RotateCcw aria-hidden />
              {t(c.reset)}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
