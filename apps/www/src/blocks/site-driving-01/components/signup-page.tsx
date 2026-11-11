"use client";

import * as React from "react";
import { addIsoDays, Alert, Button, Checkbox, CheckboxGroup, Field, Input, NativeSelect, PhoneInput, RadioGroup, todayIso } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { Check } from "lucide-react";
import { useCourse } from "./course-provider";
import { copyFor, courseById, courses, fill, intlOf, licences, tl, weeksFor, type CourseId, type LicenceId } from "./content";

const c = {
  crumb: { en: "Sign up", tr: "Kayıt" },
  title: { en: "Sign up in *four minutes*", tr: "*Dört dakikada* kayıt" },
  lead: { en: "Reserve your place and your instructor. You pay at your first lesson — in full with 5% off, or in three monthly instalments.", tr: "Yerinizi ve eğitmeninizi ayırtın. Ödemeyi ilk derste yaparsınız — tamamı %5 indirimle ya da üç aylık taksitle." },
  form: { en: "Sign-up form", tr: "Kayıt formu" },
  course: { en: "Course", tr: "Kurs" },
  licence: { en: "Licence", tr: "Ehliyet sınıfı" },
  name: { en: "Full name", tr: "Ad soyad" },
  phone: { en: "Mobile", tr: "Cep telefonu" },
  email: { en: "Email", tr: "E-posta" },
  dob: { en: "Date of birth", tr: "Doğum tarihi" },
  dobHint: { en: "Theory from 17½; the test from your 18th birthday.", tr: "Teori 17,5 yaşından; sınav 18 yaşından itibaren." },
  tooYoung: { en: "You need to be 17½ on the start date.", tr: "Başlangıç tarihinde 17,5 yaşında olmalısınız." },
  start: { en: "Start week", tr: "Başlangıç haftası" },
  weekOf: { en: "Week of {date}", tr: "{date} haftası" },
  times: { en: "When can you drive?", tr: "Ne zaman sürebilirsiniz?" },
  timesHint: { en: "Pick at least one; we match you with an instructor free at those times.", tr: "En az birini seçin; bu saatlerde müsait bir eğitmenle eşleştiririz." },
  mornings: { en: "Weekday mornings", tr: "Hafta içi sabah" },
  evenings: { en: "Weekday evenings", tr: "Hafta içi akşam" },
  saturdays: { en: "Saturdays", tr: "Cumartesi" },
  pay: { en: "Payment", tr: "Ödeme" },
  full: { en: "In full, 5% off", tr: "Peşin, %5 indirim" },
  instal: { en: "3 monthly instalments", tr: "3 aylık taksit" },
  consent: { en: "I have read the KVKK notice and agree to be contacted about my course.", tr: "KVKK aydınlatma metnini okudum, kursumla ilgili benimle iletişime geçilmesini kabul ediyorum." },
  submit: { en: "Reserve my place", tr: "Yerimi ayırt" },
  required: { en: "Required", tr: "Zorunlu" },
  needOne: { en: "Pick at least one", tr: "En az birini seçin" },
  needConsent: { en: "Please confirm to continue", tr: "Devam etmek için onaylayın" },
  badEmail: { en: "Check the email address", tr: "E-posta adresini kontrol edin" },
  fix: { en: "A few fields need a look.", tr: "Birkaç alanı kontrol edin." },
  summary: { en: "Your course", tr: "Kursunuz" },
  lessons: { en: "{n} lessons · test-ready in about {w} weeks", tr: "{n} ders · yaklaşık {w} haftada sınava hazır" },
  discount: { en: "Paid in full −5%", tr: "Peşin ödeme −%5" },
  total: { en: "Total", tr: "Toplam" },
  monthly: { en: "3 × {amount}", tr: "3 × {amount}" },
  doneTitle: { en: "Your place is reserved", tr: "Yeriniz ayrıldı" },
  doneText: { en: "Reference {ref}. Elif will call you within one working day to fix your first lesson and introduce your instructor.", tr: "Referans {ref}. Elif bir iş günü içinde sizi arayıp ilk dersinizi ayarlayacak ve eğitmeninizi tanıtacak." },
  back: { en: "Back to the comparison", tr: "Karşılaştırmaya dön" },
};

/** The next four Mondays from today (computed after mount; it depends on today). */
function useStartWeeks() {
  const [weeks, setWeeks] = React.useState<string[]>([]);
  React.useEffect(() => {
    const today = todayIso("Europe/Istanbul");
    const dow = new Date(`${today}T12:00:00Z`).getUTCDay();
    const first = addIsoDays(today, ((8 - dow) % 7) || 7);
    setWeeks([0, 7, 14, 21].map((d) => addIsoDays(first, d)));
  }, []);
  return weeks;
}

export function SignupPage() {
  const { t, locale, licence, setLicence, course, setCourse, perWeek } = useCourse();
  const { intl, labels } = copyFor(locale);
  const weeks = useStartWeeks();
  const [start, setStart] = React.useState("");
  const [pay, setPay] = React.useState<"full" | "instal">("full");
  const [times, setTimes] = React.useState<string[]>(["evenings"]);
  const [consent, setConsent] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const doneRef = React.useRef<HTMLHeadingElement>(null);

  const chosen = courseById(course);
  const price = chosen.price[licence];
  const total = pay === "full" ? Math.round(price * 0.95) : price;
  const fmtDate = (iso: string) => new Intl.DateTimeFormat(intlOf(locale), { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
  const startWeek = start || weeks[0] || "";

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const next: Record<string, string> = {};
    if (!v("name")) next.name = t(c.required);
    if (v("phone").replace(/\D/g, "").length < 10) next.phone = t(c.required);
    if (v("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) next.email = t(c.badEmail);
    const dob = v("dob");
    if (!dob) next.dob = t(c.required);
    else if (startWeek) {
      const [y, m, d] = dob.split("-").map(Number) as [number, number, number];
      const eligible = new Date(Date.UTC(y + 17, m - 1 + 6, d));
      if (eligible > new Date(`${startWeek}T12:00:00Z`)) next.dob = t(c.tooYoung);
    }
    if (!times.length) next.times = t(c.needOne);
    if (!consent) next.consent = t(c.needConsent);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(first === "consent" ? "#cr-consent" : first === "times" ? "[role=checkbox]" : `[name="${first}"]`)?.focus();
      return;
    }
    setDone(`CR-${startWeek.slice(5).replace("-", "")}-${chosen.id.slice(0, 3).toUpperCase()}${licence === "moto" ? "A2" : "B"}`);
    requestAnimationFrame(() => doneRef.current?.focus());
  };

  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="simple" breadcrumb={[{ label: "Clearroad", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.form)} className="pt-4! pb-24">
        <Container>
          {done ? (
            <div className="flex max-w-[60ch] flex-col items-start gap-6" role="status">
              <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-fg">
                <Check aria-hidden className="size-6" />
              </span>
              <h2 ref={doneRef} tabIndex={-1} className="font-display text-display-m font-black tracking-tight text-fg outline-none">
                {t(c.doneTitle)}
              </h2>
              <p className="text-lead text-fg-muted">{fill(t(c.doneText), { ref: done })}</p>
              <p className="font-display text-display-m font-black tabular text-accent-ink">{done}</p>
              <a href={sitePageHref("courses")} className="text-small font-medium text-accent-ink underline underline-offset-4 focus-ring rounded-[2px]">
                {t(c.back)}
              </a>
            </div>
          ) : (
            <div className="grid items-start gap-10 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] @5xl:gap-14">
              <form ref={formRef} noValidate onSubmit={submit} className="grid gap-6 @2xl:grid-cols-2" aria-label={t(c.form)}>
                {Object.keys(errors).length ? (
                  <Alert tone="danger" className="@2xl:col-span-2">
                    {t(c.fix)}
                  </Alert>
                ) : null}
                <Field label={t(c.course)} className="@2xl:col-span-2">
                  <RadioGroup
                    name="course"
                    variant="card"
                    value={course}
                    onValueChange={(v) => setCourse(v as CourseId)}
                    className="grid gap-2 @xl:grid-cols-3"
                    items={courses.map((x) => ({ value: x.id, label: t(x.name), description: `${fill(t({ en: "{n} lessons", tr: "{n} ders" }), { n: x.lessons[licence] })} · ${tl(x.price[licence], locale)}` }))}
                  />
                </Field>
                <Field label={t(c.licence)} className="@2xl:col-span-2">
                  <RadioGroup name="licence" variant="segmented" value={licence} onValueChange={(v) => setLicence(v as LicenceId)} items={licences.map((l) => ({ value: l.id, label: t(l.name) }))} />
                </Field>
                <Field label={t(c.name)} required error={errors.name}>
                  <Input name="name" autoComplete="name" />
                </Field>
                <Field label={t(c.dob)} required hint={t(c.dobHint)} error={errors.dob}>
                  <Input name="dob" type="date" autoComplete="bday" />
                </Field>
                <Field label={t(c.phone)} required error={errors.phone}>
                  <PhoneInput name="phone" defaultCountry="TR" />
                </Field>
                <Field label={t(c.email)} optional error={errors.email}>
                  <Input name="email" type="email" autoComplete="email" placeholder="name@example.com" />
                </Field>
                <Field label={t(c.start)}>
                  <NativeSelect name="start" value={startWeek} onChange={(e) => setStart(e.target.value)} items={weeks.map((w) => ({ value: w, label: fill(t(c.weekOf), { date: fmtDate(w) }) }))} />
                </Field>
                <Field label={t(c.pay)}>
                  <RadioGroup name="pay" variant="segmented" value={pay} onValueChange={(v) => setPay(v as "full" | "instal")} items={[{ value: "full", label: t(c.full) }, { value: "instal", label: t(c.instal) }]} />
                </Field>
                <Field label={t(c.times)} hint={t(c.timesHint)} error={errors.times} className="@2xl:col-span-2">
                  <CheckboxGroup name="times" orientation="horizontal" value={times} onValueChange={setTimes} items={[{ value: "mornings", label: t(c.mornings) }, { value: "evenings", label: t(c.evenings) }, { value: "saturdays", label: t(c.saturdays) }]} />
                </Field>
                <div className="flex flex-col gap-1 @2xl:col-span-2">
                  <Checkbox id="cr-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} label={t(c.consent)} aria-invalid={errors.consent ? true : undefined} />
                  {errors.consent ? <p className="ps-7 text-small text-danger">{errors.consent}</p> : null}
                </div>
                <div className="@2xl:col-span-2">
                  <Button type="submit" variant="primary" size="lg">
                    {t(c.submit)}
                  </Button>
                </div>
              </form>

              <aside aria-label={t(c.summary)} className="surface flex flex-col gap-5 rounded-ui-lg p-6 @5xl:sticky @5xl:top-24">
                <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-fg-muted">{t(c.summary)}</p>
                <div className="flex flex-col gap-1">
                  <p className="font-display text-display-m font-black tracking-tight text-fg">{t(chosen.name)}</p>
                  <p className="text-small text-fg-muted">{t(licences.find((l) => l.id === licence)!.name)}</p>
                  <p className="text-small text-fg-muted">{fill(t(c.lessons), { n: chosen.lessons[licence], w: weeksFor(chosen, licence, perWeek) })}</p>
                  {startWeek ? <p className="text-small text-fg-muted">{fill(t(c.weekOf), { date: fmtDate(startWeek) })}</p> : null}
                </div>
                <dl className="flex flex-col gap-2 border-t border-line pt-4 text-small tabular">
                  <div className="flex justify-between gap-4">
                    <dt className="text-fg-muted">{t(chosen.name)}</dt>
                    <dd className="text-fg">{tl(price, locale)}</dd>
                  </div>
                  {pay === "full" ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-fg-muted">{t(c.discount)}</dt>
                      <dd className="text-accent-ink">−{tl(price - total, locale)}</dd>
                    </div>
                  ) : null}
                  <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
                    <dt className="font-medium text-fg">{t(c.total)}</dt>
                    <dd className="font-display text-[1.75rem] font-black text-fg" data-testid="cr-total">
                      {pay === "full" ? tl(total, locale) : fill(t(c.monthly), { amount: tl(Math.ceil(total / 3), locale) })}
                    </dd>
                  </div>
                </dl>
              </aside>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
