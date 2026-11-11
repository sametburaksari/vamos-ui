"use client";

import * as React from "react";
import { addIsoDays, Alert, Button, Calendar, CalendarSlots, Field, Input, PhoneInput, RadioGroup, Stepper, Textarea, todayIso } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowLeft, ArrowRight, Check, Pencil } from "lucide-react";
import { useJob } from "./job-provider";
import { JobCard } from "./service-picker";
import { closingOn, copyFor, dropOffSlots, duration, fill, tl, toClock, toMinutes, vehicles } from "./content";

const c = {
  crumb: { en: "Book a bay", tr: "Bölme ayırt" },
  title: { en: "Book a *bay*", tr: "*Bölme* ayırtın" },
  lead: { en: "Three steps. Nothing is charged now — you pay when you collect, and only for the work you agreed to.", tr: "Üç adım. Şimdi hiçbir ücret alınmaz — aracı alırken, yalnızca onayladığınız iş için ödersiniz." },
  steps: { en: "Booking steps", tr: "Randevu adımları" },
  sJob: { en: "Job", tr: "İş" },
  sDrop: { en: "Drop-off", tr: "Bırakış" },
  sYou: { en: "You & your car", tr: "Siz ve aracınız" },
  qJob: { en: "Check the job", tr: "İşi kontrol edin" },
  qDrop: { en: "When can you bring it in?", tr: "Aracı ne zaman getirebilirsiniz?" },
  qYou: { en: "Who and which car?", tr: "Kim ve hangi araç?" },
  edit: { en: "Change the work", tr: "İşleri değiştir" },
  emptyJob: { en: "No work picked yet.", tr: "Henüz iş seçilmedi." },
  pickWork: { en: "Pick the work", tr: "İşleri seçin" },
  closedSun: { en: "Closed on Sundays. Saturdays 09:00–17:00.", tr: "Pazar kapalıyız. Cumartesi 09:00–17:00." },
  full: { en: "That day is full — try the next one.", tr: "O gün dolu — bir sonraki günü deneyin." },
  pickDay: { en: "Choose a day first.", tr: "Önce bir gün seçin." },
  readyAt: { en: "Ready at about {time}", tr: "Yaklaşık {time}’da hazır" },
  readyNext: { en: "Ready the next working day", tr: "Sonraki iş günü hazır" },
  name: { en: "Full name", tr: "Ad soyad" },
  phone: { en: "Mobile", tr: "Cep telefonu" },
  phoneHint: { en: "Selin texts the ready time and calls before any extra work.", tr: "Selin hazır olma saatini SMS’le bildirir, ek iş öncesi arar." },
  plate: { en: "Number plate", tr: "Plaka" },
  model: { en: "Make, model and year", tr: "Marka, model ve yıl" },
  modelPh: { en: "e.g. 2019 hatchback, 1.4 petrol", tr: "ör. 2019 hatchback, 1.4 benzinli" },
  wait: { en: "While we work", tr: "İş sürerken" },
  waitLounge: { en: "I’ll wait in the lounge", tr: "Salonda bekleyeceğim" },
  waitShuttle: { en: "Shuttle me to the metro", tr: "Beni metroya bırakın" },
  waitLeave: { en: "I’ll leave and come back", tr: "Bırakıp geri geleceğim" },
  notes: { en: "Anything we should know?", tr: "Bilmemiz gereken bir şey var mı?" },
  notesPh: { en: "Noises, warning lights, locking wheel nut in the glovebox…", tr: "Sesler, uyarı lambaları, torpidodaki bijon anahtarı…" },
  back: { en: "Back", tr: "Geri" },
  next: { en: "Continue", tr: "Devam" },
  confirm: { en: "Confirm booking", tr: "Randevuyu onayla" },
  required: { en: "Required", tr: "Zorunlu" },
  badPlate: { en: "Use the format 34 ABC 123", tr: "34 ABC 123 biçimini kullanın" },
  fix: { en: "Check the highlighted fields.", tr: "İşaretli alanları kontrol edin." },
  doneTitle: { en: "Bay booked", tr: "Bölme ayrıldı" },
  doneText: { en: "Reference {ref}. Bring the car on {day} at {time}; we text you when it is ready.", tr: "Referans {ref}. Aracı {day} saat {time}’da getirin; hazır olunca SMS atarız." },
  another: { en: "Book another car", tr: "Başka araç için ayırt" },
};

export function BookingPage() {
  const { t, locale, est, vehicle, day, time, setDropOff, clear } = useJob();
  const { intl, labels } = copyFor(locale);
  const [step, setStep] = React.useState(0);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState<string | null>(null);
  const [today, setToday] = React.useState<string | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => setToday(todayIso("Europe/Istanbul")), []);

  const slots = day ? dropOffSlots(day) : [];
  const longDate = (iso: string) => new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
  const canNext = [est.items.length > 0, !!day && !!time, true][step];
  const focusPanel = () => requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("h2")?.focus());
  const go = (n: number) => {
    setStep(n);
    focusPanel();
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const next: Record<string, string> = {};
    if (!v("name")) next.name = t(c.required);
    if (v("phone").replace(/\D/g, "").length < 10) next.phone = t(c.required);
    if (!/^\d{2}\s?[A-ZÇĞİÖŞÜ]{1,3}\s?\d{2,4}$/i.test(v("plate"))) next.plate = t(c.badPlate);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setDone(`GL-${(day ?? "").slice(5).replace("-", "")}-${(time ?? "").replace(":", "")}`);
    focusPanel();
  };

  const ready = time ? toMinutes(time) + est.total : 0;
  const readyText = !time || !est.total ? null : ready > closingOn(day) ? t(c.readyNext) : fill(t(c.readyAt), { time: toClock(ready) });

  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="simple" breadcrumb={[{ label: "Gearline", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.crumb)} className="pt-4! pb-24">
        <Container>
          {!done ? (
            <Stepper aria-label={t(c.steps)} value={step} onValueChange={go} navigable="completed" responsive size="sm" className="mb-10" steps={[{ id: "job", title: t(c.sJob) }, { id: "drop", title: t(c.sDrop) }, { id: "you", title: t(c.sYou) }]} />
          ) : null}
          <div className="grid items-start gap-10 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] @5xl:gap-14">
            <div ref={panelRef} className="min-w-0">
              {done ? (
                <div className="flex flex-col items-start gap-6" role="status">
                  <span className="grid size-12 place-items-center rounded-ui bg-accent text-accent-fg">
                    <Check aria-hidden className="size-6" />
                  </span>
                  <h2 tabIndex={-1} className="font-display text-display-m font-extrabold uppercase tracking-tight text-fg outline-none">
                    {t(c.doneTitle)}
                  </h2>
                  <p className="max-w-[52ch] text-lead text-fg-muted">{fill(t(c.doneText), { ref: done, day: day ? longDate(day) : "", time: time ?? "" })}</p>
                  <p className="font-mono text-display-m font-semibold tabular text-accent-ink">{done}</p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDone(null);
                      setStep(0);
                      clear();
                      setDropOff({ day: null, time: null });
                    }}
                  >
                    {t(c.another)}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  <h2 tabIndex={-1} className="font-display text-display-m font-extrabold uppercase tracking-tight text-fg outline-none">
                    {t([c.qJob, c.qDrop, c.qYou][step]!)}
                  </h2>

                  {step === 0 ? (
                    est.items.length ? (
                      <div className="flex flex-col gap-4">
                        <ul className="flex flex-col border-t border-line">
                          {est.items.map((s) => (
                            <li key={s.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                              <span className="text-fg">{t(s.name)}</span>
                              <span className="shrink-0 font-mono text-small tabular text-fg-muted">
                                {s.minutes[vehicle] ? duration(s.minutes[vehicle], locale) : "—"} · {tl(s.price[vehicle], locale)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-small text-fg-muted">{t(vehicles.find((v) => v.id === vehicle)!.name)}</p>
                        <a href={sitePageHref("services")} className="inline-flex items-center gap-1.5 self-start text-small font-medium text-accent-ink underline-offset-4 hover:underline focus-ring rounded-[2px]">
                          <Pencil aria-hidden className="size-3.5" />
                          {t(c.edit)}
                        </a>
                      </div>
                    ) : (
                      <Alert tone="warning" title={t(c.emptyJob)}>
                        <a href={sitePageHref("services")} className="font-medium underline underline-offset-4">
                          {t(c.pickWork)}
                        </a>
                      </Alert>
                    )
                  ) : null}

                  {step === 1 ? (
                    <div className="grid gap-8 @3xl:grid-cols-[auto_minmax(0,1fr)]">
                      <div className="flex flex-col gap-3">
                        {today ? (
                          <Calendar value={day} onValueChange={(d) => setDropOff({ day: d, time: null })} min={addIsoDays(today, 1)} max={addIsoDays(today, 35)} disabledDays={[{ dayOfWeek: [0] }]} required className="self-start" />
                        ) : null}
                        <p className="text-small text-fg-muted">{t(c.closedSun)}</p>
                      </div>
                      <div className="flex min-w-0 flex-col gap-3">
                        {day ? (
                          <CalendarSlots day={day} slots={slots} value={time} onValueChange={(v) => setDropOff({ time: v })} columns={3} hourCycle={24} error={slots.every((s) => !s.available) ? t(c.full) : undefined} />
                        ) : (
                          <p className="text-fg-muted">{t(c.pickDay)}</p>
                        )}
                        {readyText ? <p className="font-mono text-small font-semibold text-accent-ink" aria-live="polite">{readyText}</p> : null}
                      </div>
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <form ref={formRef} id="gl-form" noValidate onSubmit={submit} className="grid gap-5 @2xl:grid-cols-2">
                      {Object.keys(errors).length ? (
                        <Alert tone="danger" className="@2xl:col-span-2">
                          {t(c.fix)}
                        </Alert>
                      ) : null}
                      <Field label={t(c.name)} required error={errors.name}>
                        <Input name="name" autoComplete="name" />
                      </Field>
                      <Field label={t(c.phone)} required hint={t(c.phoneHint)} error={errors.phone}>
                        <PhoneInput name="phone" defaultCountry="TR" />
                      </Field>
                      <Field label={t(c.plate)} required error={errors.plate}>
                        <Input name="plate" autoCapitalize="characters" placeholder="34 ABC 123" className="font-mono uppercase" />
                      </Field>
                      <Field label={t(c.model)} optional>
                        <Input name="model" placeholder={t(c.modelPh)} />
                      </Field>
                      <Field label={t(c.wait)} className="@2xl:col-span-2">
                        <RadioGroup
                          name="wait"
                          defaultValue={est.total > 90 ? "shuttle" : "lounge"}
                          orientation="horizontal"
                          items={[
                            { value: "lounge", label: t(c.waitLounge) },
                            { value: "shuttle", label: t(c.waitShuttle) },
                            { value: "leave", label: t(c.waitLeave) },
                          ]}
                        />
                      </Field>
                      <Field label={t(c.notes)} optional className="@2xl:col-span-2">
                        <Textarea name="notes" rows={3} placeholder={t(c.notesPh)} />
                      </Field>
                    </form>
                  ) : null}

                  <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
                    <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>
                      <ArrowLeft aria-hidden className="rtl:rotate-180" />
                      {t(c.back)}
                    </Button>
                    {step < 2 ? (
                      <Button variant="primary" size="lg" disabled={!canNext} onClick={() => go(step + 1)}>
                        {t(c.next)}
                        <ArrowRight aria-hidden className="rtl:rotate-180" />
                      </Button>
                    ) : (
                      <Button variant="primary" size="lg" type="submit" form="gl-form">
                        {t(c.confirm)}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <JobCard headingId="gl-jobcard-booking" hideAction />
          </div>
        </Container>
      </Section>
    </>
  );
}
