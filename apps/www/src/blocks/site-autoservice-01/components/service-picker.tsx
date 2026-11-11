"use client";

import * as React from "react";
import { Badge, Button, Checkbox, cn, Field, NativeSelect, RadioGroup } from "@vamos-ui/react";
import { ArrowRight, Clock3, Wrench, Droplets } from "lucide-react";
import { Stagger } from "@vamos-ui/react/motion";
import { useJob } from "./job-provider";
import { categories, closingOn, duration, fill, HANDOVER, OPEN_WEEKDAY, services, tl, toClock, toMinutes, vehicles, type Service, type VehicleId } from "./content";

const c = {
  vehicle: { en: "Your car", tr: "Aracınız" },
  pick: { en: "Pick the work", tr: "İşleri seçin" },
  popular: { en: "Most booked", tr: "En çok seçilen" },
  card: { en: "Job card", tr: "İş kartı" },
  empty: { en: "Tick at least one job to see how long it takes.", tr: "Süreyi görmek için en az bir iş seçin." },
  bay: { en: "Workshop", tr: "Atölye" },
  wash: { en: "Wash lane", tr: "Yıkama" },
  handover: { en: "Check-in & walk-round", tr: "Kabul ve teslim turu" },
  parallel: { en: "Workshop and wash lane run side by side, so the longer lane sets the time.", tr: "Atölye ve yıkama hattı paralel çalışır; süreyi uzun olan hat belirler." },
  drop: { en: "Drop-off", tr: "Bırakış" },
  ready: { en: "Ready by", tr: "Hazır olma" },
  nextDay: { en: "Next working day, {time}", tr: "Sonraki iş günü, {time}" },
  nextDayHint: { en: "Longer than today’s opening hours — we keep the car overnight, indoors.", tr: "Bugünkü çalışma saatini aşıyor — araç gece kapalı alanda kalır." },
  total: { en: "Estimate, parts and labour", tr: "Tahmini tutar, parça ve işçilik" },
  inTotal: { en: "with us for {d}", tr: "toplam {d} bizde" },
  book: { en: "Book this job", tr: "Bu işi ayarla" },
  noTime: { en: "no bay time", tr: "bölme süresi yok" },
  includes: { en: "includes exterior wash", tr: "dış yıkama dahil" },
  items: { en: "{n} jobs", tr: "{n} iş" },
  minutes: { en: "Minutes", tr: "Dakika" },
};

/** Drop-off times on the picker: every half hour of a weekday until two hours before closing. */
const dropTimes = (() => {
  const out: string[] = [];
  for (let m = toMinutes(OPEN_WEEKDAY.open); m <= toMinutes(OPEN_WEEKDAY.close) - 120; m += 30) out.push(toClock(m));
  return out;
})();

/**
 * Signature: pick the car and the jobs, see a two-lane bay timeline (workshop and wash run in
 * parallel), the time the car is ready and the price — live. `compact` shows the most-booked
 * jobs only (home page); `full` shows every category (services page).
 */
export function ServicePicker({ mode = "full", headingId }: { mode?: "full" | "compact"; headingId?: string }) {
  const { t, vehicle, setVehicle, selected, toggle } = useJob();
  const groups = mode === "compact" ? [{ id: "popular", name: c.popular, lead: undefined, items: services.filter((s) => s.popular) }] : categories.map((cat) => ({ ...cat, items: services.filter((s) => s.category === cat.id) }));
  const uid = React.useId();

  return (
    <div className="grid items-start gap-10 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] @5xl:gap-14">
      <div className="flex min-w-0 flex-col gap-10">
        <Field label={<span className="font-mono text-eyebrow uppercase tracking-[0.14em] text-fg-muted">01 · {t(c.vehicle)}</span>}>
          <RadioGroup
            variant="card"
            orientation="horizontal"
            value={vehicle}
            onValueChange={(v) => setVehicle(v as VehicleId)}
            items={vehicles.map((v) => ({ value: v.id, label: t(v.name), description: t(v.hint) }))}
            className="grid gap-2 @xl:grid-cols-3"
          />
        </Field>

        <div className="flex flex-col gap-8">
          <p className="font-mono text-eyebrow uppercase tracking-[0.14em] text-fg-muted" id={`${uid}-pick`}>
            02 · {t(c.pick)}
          </p>
          {groups.map((g) => (
            <fieldset key={g.id} className="flex min-w-0 flex-col" aria-describedby={`${uid}-pick`}>
              <legend className="mb-3 flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="font-display text-h3 uppercase tracking-tight text-fg">{t(g.name)}</span>
                {g.lead ? <span className="text-xs text-fg-muted">{t(g.lead)}</span> : null}
              </legend>
              <Stagger asChild step={50}>
                <ul className="flex flex-col border-t border-line">
                  {g.items.map((s) => (
                    <ServiceRow key={s.id} uid={uid} s={s} vehicle={vehicle} checked={selected.includes(s.id)} onToggle={(on) => toggle(s.id, on)} />
                  ))}
                </ul>
              </Stagger>
            </fieldset>
          ))}
        </div>
      </div>
      <JobCard headingId={headingId} />
    </div>
  );
}

function ServiceRow({ uid, s, vehicle, checked, onToggle }: { uid: string; s: Service; vehicle: VehicleId; checked: boolean; onToggle: (on: boolean) => void }) {
  const { t, locale } = useJob();
  const id = `${uid}-${s.id}`;
  const min = s.minutes[vehicle];
  return (
    <li className={cn("relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 border-b border-line py-4 transition-colors @2xl:grid-cols-[auto_minmax(0,1fr)_auto]", checked && "bg-accent-soft/40")}>
      {checked ? <span aria-hidden className="absolute inset-y-0 -start-3 w-1 bg-accent" /> : null}
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onToggle(v === true)} className="mt-1" aria-describedby={`${id}-meta`} />
      <label htmlFor={id} className="flex min-w-0 cursor-pointer flex-col gap-1">
        <span className="font-medium text-fg">{t(s.name)}</span>
        <span className="text-small text-fg-muted">{t(s.text)}</span>
      </label>
      <p id={`${id}-meta`} className="col-start-2 flex items-center gap-3 font-mono text-small tabular @2xl:col-start-3 @2xl:row-start-1 @2xl:flex-col @2xl:items-end @2xl:gap-1">
        <span className="font-semibold text-fg">{tl(s.price[vehicle], locale)}</span>
        <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
          <Clock3 aria-hidden className="size-3" />
          {min ? duration(min, locale) : t(c.noTime)}
        </span>
      </p>
    </li>
  );
}

/** The live job card: two-lane timeline, ready-by time and price. */
export function JobCard({ headingId, hideAction }: { headingId?: string; hideAction?: boolean }) {
  const { t, locale, est, vehicle, time, day, setDropOff, book } = useJob();
  const drop = time ?? "08:30";
  const span = Math.max(est.total, 120);
  const ready = toMinutes(drop) + est.total;
  const closing = closingOn(day);
  const overnight = ready > closing;
  const readyLabel = overnight ? fill(t(c.nextDay), { time: toClock(toMinutes(OPEN_WEEKDAY.open) + 30 + (ready - closing)) }) : toClock(ready);
  const pct = (m: number) => `${(m / span) * 100}%`;
  const ticks = Array.from({ length: Math.floor(span / 30) + 1 }, (_, i) => i * 30);
  const v = vehicles.find((x) => x.id === vehicle)!;

  const lane = (which: "bay" | "wash") => {
    let at = HANDOVER / 2;
    return est.items
      .filter((s) => s.lane === which && s.minutes[vehicle] > 0)
      .map((s, i) => {
        const start = at;
        at += s.minutes[vehicle];
        return (
          <span
            key={s.id}
            title={`${t(s.name)} · ${duration(s.minutes[vehicle], locale)}`}
            className={cn("absolute inset-y-0 flex items-center overflow-hidden rounded-[3px] px-1.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-accent-fg transition-[left,width] duration-300 motion-reduce:transition-none", i % 2 ? "bg-accent/75" : "bg-accent")}
            style={{ insetInlineStart: pct(start), width: `calc(${pct(s.minutes[vehicle])} - 2px)` }}
          >
            <span className="truncate">{t(s.name)}</span>
          </span>
        );
      });
  };

  return (
    <aside aria-labelledby={headingId ?? "gl-jobcard"} className="surface relative flex flex-col overflow-hidden rounded-ui-lg @5xl:sticky @5xl:top-24">
      <div aria-hidden className="h-2 bg-[repeating-linear-gradient(135deg,var(--accent)_0_10px,transparent_10px_20px)]" />
      <div className="flex flex-col gap-6 p-5 @md:p-6">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={headingId ?? "gl-jobcard"} className="font-mono text-eyebrow uppercase tracking-[0.18em] text-fg-muted">
              {t(c.card)}
            </h2>
            <p className="font-display text-h3 uppercase tracking-tight text-fg">{t(v.name)}</p>
          </div>
          <Badge tone="outline" className="font-mono tabular">
            {fill(t(c.items), { n: est.items.length })}
          </Badge>
        </header>

        {est.items.length === 0 ? (
          <p className="rounded-ui border border-dashed border-line p-4 text-small text-fg-muted">{t(c.empty)}</p>
        ) : (
          <div className="flex flex-col gap-3" role="group" aria-label={`${t(c.bay)} / ${t(c.wash)}`}>
            {(["bay", "wash"] as const).map((which) => (
              <div key={which} className="grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
                  {which === "bay" ? <Wrench aria-hidden className="size-3.5" /> : <Droplets aria-hidden className="size-3.5" />}
                  {t(c[which])}
                </span>
                <div className="relative h-7 rounded-ui-sm bg-surface-2">
                  {lane(which)}
                  {(which === "bay" ? est.bay : est.wash) === 0 ? <span className="absolute inset-0 flex items-center px-2 text-[11px] text-fg-subtle">—</span> : null}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-2" aria-hidden>
              <span />
              <div className="relative h-4 border-t border-line">
                {ticks.map((m) => (
                  <span key={m} className="absolute top-0 flex -translate-x-1/2 flex-col items-center rtl:translate-x-1/2" style={{ insetInlineStart: pct(m) }}>
                    <span className={cn("w-px bg-fg-subtle", m % 60 ? "h-1" : "h-1.5")} />
                    {m % 60 === 0 ? <span className="font-mono text-[10px] tabular text-fg-subtle">{m / 60}h</span> : null}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-fg-muted">{t(c.parallel)}</p>
          </div>
        )}

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-t border-line pt-5">
          <Field label={t(c.drop)} className="max-w-[9rem]">
            <NativeSelect value={drop} onChange={(e) => setDropOff({ time: e.target.value })} items={dropTimes.map((x) => ({ value: x, label: x }))} size="sm" />
          </Field>
          <div className="flex flex-col items-end gap-0.5 text-end" aria-live="polite">
            <span className="text-xs text-fg-muted">{t(c.ready)}</span>
            <span className={cn("font-display font-extrabold tabular text-fg", overnight ? "text-lead" : "text-[2.75rem] leading-none tracking-[-0.03em]")} data-testid="gl-ready">
              <span key={est.items.length ? readyLabel : "none"} className="gl-tick inline-block">
                {est.items.length ? readyLabel : "—"}
              </span>
            </span>
          </div>
        </div>
        {overnight && est.items.length ? <p className="text-xs text-warning">{t(c.nextDayHint)}</p> : null}

        <div className="flex flex-col gap-1 border-t border-line pt-5" aria-live="polite">
          <span className="text-xs text-fg-muted">{t(c.total)}</span>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <span className="font-display text-[1.75rem] font-extrabold leading-tight tabular tracking-tight text-fg" data-testid="gl-total">
              {tl(est.price, locale)}
            </span>
            <span className="text-small text-fg-muted">{est.items.length ? fill(t(c.inTotal), { d: duration(est.total, locale) }) : ""}</span>
          </div>
        </div>

        {hideAction ? null : (
          <Button variant="primary" size="lg" block disabled={!est.items.length} onClick={book}>
            {t(c.book)}
            <ArrowRight aria-hidden className="rtl:rotate-180" />
          </Button>
        )}
      </div>
    </aside>
  );
}
