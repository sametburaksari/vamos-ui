"use client";

import * as React from "react";
import { addIsoDays, Alert, Button, Calendar, CalendarSlots, Checkbox, Field, Image, Input, PhoneInput, RadioGroup, Select, Stepper, Textarea, todayIso } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { CalendarPlus, Check, Clock, UserRound } from "lucide-react";
import { assignedClinician, staffFor, useBooking } from "./booking-provider";
import { clinicianById, copyFor, displayName, fill, serviceById, services, slotsFor, tl, type Clinician, type ServiceId } from "./content";

const c = {
  crumbHome: { en: "Northline", tr: "Northline" },
  crumb: { en: "Book an appointment", tr: "Randevu al" },
  title: { en: "Book an *appointment*", tr: "*Randevu* alın" },
  lead: { en: "Five short steps, about two minutes. You get a confirmation by text and email, and you can change or cancel up to two hours before.", tr: "Beş kısa adım, yaklaşık iki dakika. Onay SMS ve e-postayla gelir; randevuyu iki saat öncesine kadar değiştirip iptal edebilirsiniz." },
  steps: { en: "Booking steps", tr: "Randevu adımları" },
  sService: { en: "Service", tr: "Hizmet" },
  sDoctor: { en: "Clinician", tr: "Hekim" },
  sDay: { en: "Day", tr: "Gün" },
  sTime: { en: "Time", tr: "Saat" },
  sDetails: { en: "Your details", tr: "Bilgileriniz" },
  qService: { en: "What is the appointment for?", tr: "Randevu ne için?" },
  qDoctor: { en: "Who would you like to see?", tr: "Kiminle görüşmek istersiniz?" },
  qDay: { en: "Which day suits you?", tr: "Hangi gün uygun?" },
  qTime: { en: "Pick a time", tr: "Bir saat seçin" },
  qDetails: { en: "Who is the appointment for?", tr: "Randevu kimin için?" },
  any: { en: "First available", tr: "İlk uygun hekim" },
  anyHint: { en: "Whoever is on duty that day — usually the soonest slot.", tr: "O gün nöbetçi olan hekim — genelde en erken saat." },
  works: { en: "Clinics on {days}", tr: "{days} günleri" },
  minutes: { en: "{n} min", tr: "{n} dk" },
  back: { en: "Back", tr: "Geri" },
  next: { en: "Continue", tr: "Devam" },
  confirm: { en: "Confirm appointment", tr: "Randevuyu onayla" },
  pickFirst: { en: "Choose a day first.", tr: "Önce bir gün seçin." },
  none: { en: "Nothing left that day — try the next one.", tr: "O gün boş saat kalmadı — sonraki günü deneyin." },
  sunday: { en: "Closed on Sundays. Days the clinician does not work are greyed out.", tr: "Pazar günleri kapalıyız. Hekimin çalışmadığı günler soluk görünür." },
  name: { en: "Full name", tr: "Ad soyad" },
  dob: { en: "Date of birth", tr: "Doğum tarihi" },
  phone: { en: "Mobile", tr: "Cep telefonu" },
  phoneHint: { en: "We text the confirmation and a reminder the day before.", tr: "Onayı ve bir gün önceki hatırlatmayı SMS ile göndeririz." },
  email: { en: "Email", tr: "E-posta" },
  insurance: { en: "How will you pay?", tr: "Nasıl ödeyeceksiniz?" },
  self: { en: "Self-pay", tr: "Kendim ödeyeceğim" },
  reason: { en: "Anything we should know?", tr: "Bilmemiz gereken bir şey var mı?" },
  reasonHint: { en: "Optional. A few words is enough; please don’t share sensitive details here.", tr: "İsteğe bağlı. Birkaç kelime yeterli; lütfen hassas bilgileri burada paylaşmayın." },
  newPatient: { en: "Is this your first visit to Northline?", tr: "Northline’a ilk gelişiniz mi?" },
  yes: { en: "Yes, first visit", tr: "Evet, ilk kez" },
  no: { en: "No, I have been before", tr: "Hayır, daha önce geldim" },
  consent: { en: "I have read the KVKK notice and agree that my details are used to manage this appointment.", tr: "KVKK aydınlatma metnini okudum; bilgilerimin bu randevunun yönetimi için kullanılmasını kabul ediyorum." },
  required: { en: "Please fill this in.", tr: "Lütfen doldurun." },
  badEmail: { en: "Enter an email like name@example.com.", tr: "ad@example.com gibi bir e-posta girin." },
  needConsent: { en: "Please tick to continue.", tr: "Devam etmek için işaretleyin." },
  fix: { en: "A few fields need a look.", tr: "Birkaç alana bakmak gerekiyor." },
  summary: { en: "Your appointment", tr: "Randevunuz" },
  notChosen: { en: "Not chosen yet", tr: "Henüz seçilmedi" },
  fee: { en: "Fee", tr: "Ücret" },
  feeNote: { en: "Paid at the desk after the visit. Most private insurers are billed directly.", tr: "Muayene sonrası danışmada ödenir. Çoğu özel sigortaya doğrudan fatura edilir." },
  doneTitle: { en: "You’re booked", tr: "Randevunuz alındı" },
  doneText: { en: "Reference {ref}. A text and an email are on their way to you. Please arrive ten minutes early with your ID card.", tr: "Referans {ref}. SMS ve e-posta yolda. Lütfen kimliğinizle on dakika erken gelin." },
  addCal: { en: "Add to calendar", tr: "Takvime ekle" },
  another: { en: "Book another appointment", tr: "Başka bir randevu al" },
  home: { en: "Back to the home page", tr: "Ana sayfaya dön" },
};

const DOW: Record<"en" | "tr", string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  tr: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
};

const insurers = ["self", "Kuzey Sigorta", "Boğaz Sağlık", "Liman Hayat", "SGK + top-up"];

const icsHref = (title: string, day: string, time: string, minutes: number, where: string) => {
  const start = `${day.replace(/-/g, "")}T${time.replace(":", "")}00`;
  const endMin = Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) + minutes;
  const end = `${day.replace(/-/g, "")}T${String(Math.floor(endMin / 60)).padStart(2, "0")}${String(endMin % 60).padStart(2, "0")}00`;
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Northline//Booking//EN", "BEGIN:VEVENT", `DTSTART;TZID=Europe/Istanbul:${start}`, `DTEND;TZID=Europe/Istanbul:${end}`, `SUMMARY:${title}`, `LOCATION:${where}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
};

/** The signature flow: service → clinician → day (Calendar) → time (slots) → details → done. */
export function AppointmentPage() {
  const { locale, t, booking, update, step, setStep, reset } = useBooking();
  const { intl, labels } = copyFor(locale);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState<string | null>(null);
  const [consent, setConsent] = React.useState(false);
  const [payment, setPayment] = React.useState("self");
  const [first, setFirst] = React.useState("yes");
  const formRef = React.useRef<HTMLFormElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const today = React.useMemo(() => todayIso("Europe/Istanbul"), []);

  const service = booking.service ? serviceById(booking.service) : null;
  const staff = staffFor(booking.service);
  const chosen = booking.clinician && booking.clinician !== "any" ? clinicianById(booking.clinician) : undefined;
  const workDays = new Set((chosen ? [chosen] : staff).flatMap((x) => x.days));
  const offDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => !workDays.has(d as Clinician["days"][number]));
  const assigned = assignedClinician(booking);
  const slots = booking.day && service ? slotsFor(booking.day, service.minutes, assigned) : [];
  const longDate = (iso: string) => new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

  const canNext = [!!booking.service, !!booking.clinician, !!booking.day, !!booking.time, true][step];

  const go = (n: number) => {
    setStep(n);
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("h2")?.focus());
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const next: Record<string, string> = {};
    if (!v("name")) next.name = t(c.required);
    if (!v("dob")) next.dob = t(c.required);
    if (v("phone").replace(/\D/g, "").length < 10) next.phone = t(c.required);
    if (v("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) next.email = t(c.badEmail);
    if (!consent) next.consent = t(c.needConsent);
    setErrors(next);
    const firstBad = Object.keys(next)[0];
    if (firstBad) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstBad}"], #consent`)?.focus();
      return;
    }
    const ref = `NL-${(booking.day ?? "").slice(5).replace("-", "")}${(booking.time ?? "").replace(":", "")}`;
    setDone(ref);
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("h2")?.focus());
  };

  const stepTitle = [c.qService, c.qDoctor, c.qDay, c.qTime, c.qDetails][step]!;

  const summaryRows: [React.ReactNode, React.ReactNode, number][] = [
    [t(c.sService), service ? `${t(service.name)} · ${fill(t(c.minutes), { n: service.minutes })}` : null, 0],
    [t(c.sDoctor), booking.clinician === "any" ? (assigned ? `${t(c.any)} · ${displayName(assigned, locale)}` : t(c.any)) : chosen ? displayName(chosen, locale) : null, 1],
    [t(c.sDay), booking.day ? longDate(booking.day) : null, 2],
    [t(c.sTime), booking.time, 3],
  ];

  return (
    <>
      <PageIntro
        locale={intl}
        labels={labels}
        variant="simple"
        breadcrumb={[{ label: t(c.crumbHome), href: sitePageHref("home") }, { label: t(c.crumb) }]}
        title={t(c.title)}
        lead={t(c.lead)}
      />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.crumb)} className="pb-24">
        <Container>
          {!done ? (
            <Stepper
              aria-label={t(c.steps)}
              value={step}
              onValueChange={go}
              navigable="completed"
              responsive
              size="sm"
              className="mb-10"
              steps={[{ id: "service", title: t(c.sService) }, { id: "doctor", title: t(c.sDoctor) }, { id: "day", title: t(c.sDay) }, { id: "time", title: t(c.sTime) }, { id: "details", title: t(c.sDetails) }]}
            />
          ) : null}

          <div className="grid gap-10 @4xl:grid-cols-[minmax(0,1fr)_20rem] @4xl:gap-14">
            <div ref={panelRef} className="min-w-0">
              {done && service && booking.day && booking.time ? (
                <div className="flex flex-col items-start gap-6" role="status">
                  <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-fg">
                    <Check aria-hidden className="size-6" />
                  </span>
                  <h2 tabIndex={-1} className="font-display text-display-m text-fg outline-none">
                    {t(c.doneTitle)}
                  </h2>
                  <p className="max-w-[56ch] text-lead text-fg-muted">{fill(t(c.doneText), { ref: done })}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="primary">
                      <a href={icsHref(`${t(service.name)} — Northline`, booking.day, booking.time, service.minutes, "Ihlamur Sokak 4, Ataşehir, İstanbul")} download={`northline-${done}.ics`}>
                        <CalendarPlus aria-hidden />
                        {t(c.addCal)}
                      </a>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setDone(null);
                        setConsent(false);
                        reset();
                      }}
                    >
                      {t(c.another)}
                    </Button>
                    <Button asChild variant="ghost">
                      <a href={sitePageHref("home")}>{t(c.home)}</a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <h2 tabIndex={-1} className="font-display text-h3 font-semibold text-fg outline-none">
                    <span className="me-3 font-mono text-small font-normal text-fg-muted">{step + 1}/5</span>
                    {t(stepTitle)}
                  </h2>

                  {step === 0 ? (
                    <RadioGroup
                      aria-label={t(c.qService)}
                      variant="card"
                      value={booking.service}
                      onValueChange={(v) => {
                        const keep = booking.clinician && (booking.clinician === "any" || serviceById(v).staff.includes(booking.clinician));
                        update({ service: v as ServiceId, clinician: keep ? booking.clinician : null, day: null, time: null });
                      }}
                      className="grid gap-3 @2xl:grid-cols-2"
                      items={services.map((s) => ({
                        value: s.id,
                        label: (
                          <span className="flex items-baseline justify-between gap-3">
                            <span>{t(s.name)}</span>
                            <span className="tabular shrink-0 font-normal text-fg-muted">{tl(s.fee, locale)}</span>
                          </span>
                        ),
                        description: `${fill(t(c.minutes), { n: s.minutes })} · ${t(s.text)}`,
                      }))}
                    />
                  ) : null}

                  {step === 1 ? (
                    <RadioGroup
                      aria-label={t(c.qDoctor)}
                      variant="card"
                      value={booking.clinician}
                      onValueChange={(v) => update({ clinician: v, day: null, time: null })}
                      className="grid gap-3 @2xl:grid-cols-2"
                      items={[
                        { value: "any", label: t(c.any), description: t(c.anyHint), icon: <UserRound aria-hidden /> },
                        ...staff.map((s) => ({
                          value: s.id,
                          label: displayName(s, locale),
                          description: `${t(s.role)} · ${fill(t(c.works), { days: s.days.map((d) => DOW[locale][d]).join(", ") })}`,
                          icon: <Image src={s.photo.src} width={s.photo.width} height={s.photo.height} focal={s.photo.focal} alt="" aspect="1/1" rounded="full" className="size-9" sizes="36px" />,
                        })),
                      ]}
                    />
                  ) : null}

                  {step === 2 ? (
                    <div className="flex flex-col gap-3">
                      <Calendar
                        value={booking.day}
                        onValueChange={(d) => update({ day: d, time: null })}
                        min={addIsoDays(today, 1)}
                        max={addIsoDays(today, 42)}
                        disabledDays={[{ dayOfWeek: offDays }]}
                        required
                        className="self-start"
                      />
                      <p className="text-small text-fg-muted">{t(c.sunday)}</p>
                    </div>
                  ) : null}

                  {step === 3 ? (
                    booking.day ? (
                      <CalendarSlots day={booking.day} slots={slots} value={booking.time} onValueChange={(time) => update({ time })} columns={4} hourCycle={24} error={slots.every((s) => !s.available) ? t(c.none) : undefined} />
                    ) : (
                      <p className="text-fg-muted">{t(c.pickFirst)}</p>
                    )
                  ) : null}

                  {step === 4 ? (
                    <form ref={formRef} id="booking-details" noValidate onSubmit={submit} className="grid gap-5 @2xl:grid-cols-2">
                      {Object.keys(errors).length ? (
                        <Alert tone="danger" className="@2xl:col-span-2">
                          {t(c.fix)}
                        </Alert>
                      ) : null}
                      <Field label={t(c.name)} required error={errors.name}>
                        <Input name="name" autoComplete="name" />
                      </Field>
                      <Field label={t(c.dob)} required error={errors.dob}>
                        <Input name="dob" type="date" autoComplete="bday" max={today} />
                      </Field>
                      <Field label={t(c.phone)} required hint={t(c.phoneHint)} error={errors.phone}>
                        <PhoneInput name="phone" defaultCountry="TR" />
                      </Field>
                      <Field label={t(c.email)} optional error={errors.email}>
                        <Input name="email" type="email" autoComplete="email" placeholder="name@example.com" />
                      </Field>
                      <Field label={t(c.insurance)}>
                        <Select name="payment" value={payment} onValueChange={(v) => v && setPayment(v)} items={insurers.map((i) => ({ value: i, label: i === "self" ? t(c.self) : i }))} />
                      </Field>
                      <Field label={t(c.newPatient)}>
                        <RadioGroup
                          name="first"
                          variant="segmented"
                          value={first}
                          onValueChange={setFirst}
                          items={[
                            { value: "yes", label: t(c.yes) },
                            { value: "no", label: t(c.no) },
                          ]}
                        />
                      </Field>
                      <Field label={t(c.reason)} hint={t(c.reasonHint)} optional className="@2xl:col-span-2">
                        <Textarea name="reason" rows={3} maxLength={280} />
                      </Field>
                      <div className="@2xl:col-span-2">
                        <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} label={t(c.consent)} aria-invalid={errors.consent ? true : undefined} />
                        {errors.consent ? <p className="mt-1.5 ms-7 text-small text-danger">{errors.consent}</p> : null}
                      </div>
                    </form>
                  ) : null}

                  <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
                    <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>
                      {t(c.back)}
                    </Button>
                    {step < 4 ? (
                      <Button variant="primary" size="lg" disabled={!canNext} onClick={() => go(step + 1)}>
                        {t(c.next)}
                      </Button>
                    ) : (
                      <Button type="submit" form="booking-details" variant="primary" size="lg">
                        {t(c.confirm)}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <aside aria-labelledby="nl-summary" className="surface flex flex-col gap-5 self-start rounded-ui-lg p-6 @4xl:sticky @4xl:top-24">
              <h2 id="nl-summary" className="text-small font-semibold text-fg">
                {t(c.summary)}
              </h2>
              <ol className="flex flex-col gap-4">
                {summaryRows.map(([k, v, i]) => (
                  <li key={i} className="flex gap-3">
                    <span aria-hidden className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[11px] ${v ? "bg-accent text-accent-fg" : "border border-line text-fg-muted"}`}>
                      {v ? <Check className="size-3" /> : i + 1}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-xs text-fg-muted">{k}</span>
                      <span className={v ? "text-fg" : "text-fg-subtle"}>{v ?? t(c.notChosen)}</span>
                    </span>
                  </li>
                ))}
              </ol>
              {service ? (
                <div className="flex flex-col gap-1 border-t border-line pt-4">
                  <p className="flex items-center justify-between text-small">
                    <span className="flex items-center gap-2 text-fg-muted">
                      <Clock aria-hidden className="size-3.5" />
                      {t(c.fee)}
                    </span>
                    <span className="tabular text-fg">{tl(service.fee, locale)}</span>
                  </p>
                  <p className="text-xs text-fg-muted">{t(c.feeNote)}</p>
                </div>
              ) : null}
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
