"use client";

import * as React from "react";
import { addIsoDays, Alert, Button, Calendar, CalendarSlots, Checkbox, DatePicker, Field, Input, PhoneInput, RadioGroup, Textarea, todayIso } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { fill, ink, longDate, PHONE, serviceById, services, slotsFor, stops, tl, type ReasonId } from "./content";
import { KiteMark } from "./illustrations";
import { useVisit } from "./visit-provider";

const c = {
  crumbHome: { en: "Paperkite", tr: "Paperkite" },
  crumb: { en: "Book a visit", tr: "Randevu al" },
  title: { en: "Book a *visit*", tr: "*Randevu* alın" },
  lead: { en: "Four short parts, about two minutes. We text a confirmation straight away; change or cancel up to two hours before at no cost.", tr: "Dört kısa bölüm, yaklaşık iki dakika. Onayı hemen SMS ile göndeririz; iki saat öncesine kadar ücretsiz değiştirip iptal edebilirsiniz." },
  s1: { en: "Who is coming?", tr: "Kim geliyor?" },
  s2: { en: "What is the visit for?", tr: "Ziyaret ne için?" },
  s3: { en: "When suits you?", tr: "Ne zaman uygun?" },
  s4: { en: "And you are…", tr: "Peki siz…" },
  childName: { en: "Child’s first name", tr: "Çocuğun adı" },
  dob: { en: "Date of birth", tr: "Doğum tarihi" },
  forStop: { en: "For the {label} check-up from the path.", tr: "Yoldaki {label} kontrolü için." },
  day: { en: "Day", tr: "Gün" },
  time: { en: "Time", tr: "Saat" },
  pickDay: { en: "Choose a day to see the times.", tr: "Saatleri görmek için bir gün seçin." },
  none: { en: "Nothing left that day — try the next one, or call for an unwell slot.", tr: "O gün boş saat kalmadı — sonraki günü deneyin ya da hasta randevusu için arayın." },
  sunday: { en: "Sunday mornings are for unwell children only.", tr: "Pazar sabahları yalnızca hasta çocuklar içindir." },
  parent: { en: "Your name", tr: "Adınız soyadınız" },
  phone: { en: "Mobile", tr: "Cep telefonu" },
  phoneHint: { en: "For the confirmation and a reminder the day before.", tr: "Onay ve bir gün önceki hatırlatma için." },
  note: { en: "Anything we should know?", tr: "Bilmemiz gereken bir şey var mı?" },
  noteHint: { en: "Allergies, a fear of needles, the toy’s name…", tr: "Alerjiler, iğne korkusu, oyuncağın adı…" },
  consent: { en: "I agree that Paperkite may store these details to arrange the visit (KVKK notice).", tr: "Paperkite’ın bu bilgileri randevu için saklamasını kabul ediyorum (KVKK aydınlatma metni)." },
  submit: { en: "Request the visit", tr: "Randevuyu iste" },
  required: { en: "Please fill this in.", tr: "Lütfen doldurun." },
  needSlot: { en: "Pick a day and a time.", tr: "Bir gün ve saat seçin." },
  needConsent: { en: "We need your agreement to book.", tr: "Randevu için onayınız gerekiyor." },
  summary: { en: "Your visit", tr: "Ziyaretiniz" },
  who: { en: "Who", tr: "Kim" },
  what: { en: "What", tr: "Ne" },
  when: { en: "When", tr: "Ne zaman" },
  fee: { en: "Fee", tr: "Ücret" },
  tbc: { en: "Not chosen yet", tr: "Henüz seçilmedi" },
  yourChild: { en: "Your child", tr: "Çocuğunuz" },
  min: { en: "{n} min", tr: "{n} dk" },
  doneTitle: { en: "See you soon, {name}!", tr: "Yakında görüşürüz, {name}!" },
  doneBody: { en: "We have texted the confirmation. Bring the vaccination card — and Teddy, if Teddy wants to come.", tr: "Onayı SMS ile gönderdik. Aşı kartını getirin — Ayıcık gelmek isterse onu da." },
  ref: { en: "Booking reference", tr: "Randevu numarası" },
  another: { en: "Book for a brother or sister", tr: "Kardeşi için randevu al" },
  home: { en: "Back to the home page", tr: "Ana sayfaya dön" },
  emergency: { en: "For breathing problems, a seizure or a serious injury call 112 — do not book online.", tr: "Nefes sorunu, nöbet ya da ciddi yaralanmada 112’yi arayın — çevrimiçi randevu almayın." },
};

const durationOf = (r: ReasonId) => serviceById(r).minutes;

export function BookPage() {
  const { t, locale, draft, update, reset } = useVisit();
  const [today, setToday] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [consent, setConsent] = React.useState(false);
  const [done, setDone] = React.useState<{ ref: string } | null>(null);
  React.useEffect(() => setToday(todayIso("Europe/Istanbul")), []);

  const service = serviceById(draft.reason);
  const slots = draft.day ? slotsFor(draft.day, durationOf(draft.reason)) : [];
  const stop = draft.stop ? stops.find((s) => s.id === draft.stop) : undefined;
  const sundayOnlyUnwell = draft.reason !== "unwell";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const name = draft.childName.trim();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!name) next.childName = t(c.required);
    if (!draft.dob) next.dob = t(c.required);
    if (!draft.day || !draft.time) next.slot = t(c.needSlot);
    if (!String(data.get("parent") ?? "").trim()) next.parent = t(c.required);
    if (String(data.get("phone") ?? "").replace(/\D/g, "").length < 10) next.phone = t(c.required);
    if (!consent) next.consent = t(c.needConsent);
    setErrors(next);
    if (Object.keys(next).length) {
      const first = e.currentTarget.querySelector<HTMLElement>("[aria-invalid=true]");
      first?.focus();
      return;
    }
    setDone({ ref: `PK-${(draft.day ?? "").replace(/-/g, "").slice(2)}-${(draft.time ?? "").replace(":", "")}` });
  };

  const summary = (
    <aside aria-label={t(c.summary)} className="relative flex flex-col gap-4 overflow-hidden rounded-[calc(var(--radius)*1.8)] border-2 border-fg p-6" style={{ background: ink.sky }}>
      <KiteMark className="absolute -end-3 -top-4 h-24 w-16 rotate-12 opacity-90" />
      <h2 className="font-display text-h3 font-bold text-fg">{t(c.summary)}</h2>
      <dl className="grid gap-3 text-small">
        {[
          [t(c.who), name || t(c.yourChild)],
          [t(c.what), `${t(service.name)} · ${fill(t(c.min), { n: service.minutes })}`],
          [t(c.when), draft.day ? `${longDate(draft.day, locale, { weekday: "long", day: "numeric", month: "long" })}${draft.time ? ` · ${draft.time}` : ""}` : t(c.tbc)],
          [t(c.fee), `${tl(service.fee, locale)}${service.note ? ` ${t(service.note)}` : ""}`],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2 border-b-2 border-dashed border-fg/25 pb-3 last:border-0 last:pb-0">
            <dt className="font-semibold text-fg">{k}</dt>
            <dd className="text-fg">{v}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );

  if (done)
    return (
      <>
        <PageIntro locale={intl} variant="simple" breadcrumb={[{ label: t(c.crumbHome), href: sitePageHref("home") }, { label: t(c.crumb) }]} title={fill(t(c.doneTitle), { name: name || t(c.yourChild) })} lead={t(c.doneBody)} />
        <Section className="!pt-0" aria-label={t(c.summary)}>
          <Container>
            <div className="grid gap-8 @4xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] @4xl:items-start">
              {summary}
              <div className="flex flex-col items-start gap-5 rounded-[calc(var(--radius)*1.8)] border-2 border-fg bg-surface p-6">
                <p className="flex items-center gap-3 text-fg">
                  <CalendarCheck aria-hidden className="size-6 text-accent-ink" />
                  <span>
                    {t(c.ref)}: <strong className="font-display tabular-nums">{done.ref}</strong>
                  </span>
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    className="rounded-full"
                    onClick={() => {
                      reset();
                      update({ childName: "", dob: null });
                      setConsent(false);
                      setDone(null);
                    }}
                  >
                    {t(c.another)}
                  </Button>
                  <Button asChild variant="ghost" className="rounded-full">
                    <a href={sitePageHref("home")}>{t(c.home)}</a>
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </>
    );

  const part = (n: number, title: string, children: React.ReactNode) => (
    <fieldset className="flex flex-col gap-5 rounded-[calc(var(--radius)*1.8)] border-2 border-fg bg-surface p-5 @2xl:p-7">
      <legend className="sr-only">{title}</legend>
      <p aria-hidden className="flex items-center gap-3 font-display text-h3 font-bold text-fg">
        <span className="grid size-10 place-items-center rounded-full border-2 border-fg bg-accent text-accent-fg">{n}</span>
        {title}
      </p>
      {children}
    </fieldset>
  );

  return (
    <>
      <PageIntro locale={intl} variant="simple" breadcrumb={[{ label: t(c.crumbHome), href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section className="!pt-0" aria-label={t(c.crumb)}>
        <Container>
          <Alert tone="warning" className="mb-8">
            {t(c.emergency)} <a className="font-semibold underline underline-offset-2" href={`tel:${PHONE}`}>+90 216 000 00 00</a>
          </Alert>
          <div className="grid gap-8 @4xl:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] @4xl:items-start">
            <form id="pk-book" noValidate onSubmit={submit} className="flex min-w-0 flex-col gap-6">
              {part(
                1,
                t(c.s1),
                <div className="grid gap-4 @2xl:grid-cols-2">
                  <Field label={t(c.childName)} required error={errors.childName}>
                    <Input value={draft.childName} onChange={(e) => update({ childName: e.target.value })} autoComplete="off" maxLength={40} />
                  </Field>
                  <Field label={t(c.dob)} required error={errors.dob}>
                    <DatePicker value={draft.dob} onValueChange={(v) => update({ dob: v })} max={today ?? undefined} />
                  </Field>
                </div>,
              )}
              {part(
                2,
                t(c.s2),
                <>
                  <RadioGroup
                    aria-label={t(c.s2)}
                    variant="card"
                    value={draft.reason}
                    onValueChange={(v) => update({ reason: v as ReasonId, time: null })}
                    className="grid gap-3 @2xl:grid-cols-2"
                    items={services.map((s) => ({ value: s.id, label: t(s.name), description: `${fill(t(c.min), { n: s.minutes })} · ${tl(s.fee, locale)}` }))}
                  />
                  {stop && draft.reason === "checkup" ? <p className="text-small font-medium text-accent-ink">{fill(t(c.forStop), { label: t(stop.label) })}</p> : null}
                </>,
              )}
              {part(
                3,
                t(c.s3),
                <div className="grid gap-6 @3xl:grid-cols-[auto_minmax(0,1fr)]">
                  <div className="flex flex-col gap-2">
                    <Calendar
                      aria-label={t(c.day)}
                      value={draft.day}
                      onValueChange={(d) => update({ day: d, time: null })}
                      min={today ? addIsoDays(today, 1) : undefined}
                      max={today ? addIsoDays(today, 60) : undefined}
                      disabledDays={sundayOnlyUnwell ? [{ dayOfWeek: [0] }] : undefined}
                      required
                    />
                    {sundayOnlyUnwell ? <p className="max-w-[34ch] text-small text-fg-muted">{t(c.sunday)}</p> : null}
                  </div>
                  <div className="flex min-w-0 flex-col gap-3">
                    <p className="text-small font-semibold text-fg">{t(c.time)}</p>
                    {draft.day ? (
                      <CalendarSlots day={draft.day} slots={slots} value={draft.time} onValueChange={(time) => update({ time })} columns={3} hourCycle={24} error={slots.every((s) => !s.available) ? t(c.none) : undefined} />
                    ) : (
                      <p className="text-fg-muted">{t(c.pickDay)}</p>
                    )}
                    {errors.slot ? (
                      <p className="text-small font-medium text-danger" role="alert">
                        {errors.slot}
                      </p>
                    ) : null}
                  </div>
                </div>,
              )}
              {part(
                4,
                t(c.s4),
                <div className="grid gap-4 @2xl:grid-cols-2">
                  <Field label={t(c.parent)} required error={errors.parent}>
                    <Input name="parent" autoComplete="name" />
                  </Field>
                  <Field label={t(c.phone)} required hint={t(c.phoneHint)} error={errors.phone}>
                    <PhoneInput name="phone" defaultCountry="TR" />
                  </Field>
                  <Field label={t(c.note)} hint={t(c.noteHint)} optional className="@2xl:col-span-2">
                    <Textarea name="note" rows={3} maxLength={280} />
                  </Field>
                  <div className="flex flex-col gap-1 @2xl:col-span-2">
                    <Checkbox id="pk-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} label={t(c.consent)} aria-invalid={errors.consent ? true : undefined} />
                    {errors.consent ? <p className="text-small font-medium text-danger">{errors.consent}</p> : null}
                  </div>
                </div>,
              )}
              <Button type="submit" variant="primary" size="xl" className="self-start rounded-full">
                {t(c.submit)}
                <ArrowRight aria-hidden />
              </Button>
            </form>
            <div className="@4xl:sticky @4xl:top-24">{summary}</div>
          </div>
        </Container>
      </Section>
    </>
  );
}
