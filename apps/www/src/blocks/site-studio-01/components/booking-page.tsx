"use client";

import * as React from "react";
import { addIsoDays, Alert, Button, Calendar, CalendarSlots, Checkbox, Field, Input, PhoneInput, Textarea, todayIso } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowLeft, Check } from "lucide-react";
import { addons, copyFor, fill, num, priceBuild, sessionById, startsFor, tl } from "./content";
import { useBuild } from "./build-provider";

const c = {
  crumb: { en: "Booking", tr: "Rezervasyon" },
  title: { en: "Hold a *date*", tr: "Bir *tarih* ayırtın" },
  lead: { en: "Pick a day and a start time, leave your details, and we hold the studio for 48 hours while you pay the deposit by link.", tr: "Bir gün ve başlangıç saati seçin, bilgilerinizi bırakın; kaporayı bağlantıyla ödemeniz için stüdyoyu 48 saat tutalım." },
  pkg: { en: "Your package", tr: "Paketiniz" },
  change: { en: "Change package", tr: "Paketi değiştir" },
  none: { en: "You have not built a package yet — this is our one-hour portrait. Change it any time.", tr: "Henüz bir paket oluşturmadınız — bu bir saatlik portre paketimiz. İstediğiniz zaman değiştirebilirsiniz." },
  day: { en: "Day", tr: "Gün" },
  time: { en: "Start time", tr: "Başlangıç saati" },
  closed: { en: "Closed on Sundays. Saturdays until 17:00.", tr: "Pazar kapalı. Cumartesi 17:00’ye kadar." },
  pickDay: { en: "Choose a day first.", tr: "Önce bir gün seçin." },
  full: { en: "Fully booked — try another day.", tr: "Dolu — başka bir gün deneyin." },
  you: { en: "Your details", tr: "Bilgileriniz" },
  name: { en: "Name", tr: "Ad soyad" },
  company: { en: "Company", tr: "Şirket" },
  email: { en: "Email", tr: "E-posta" },
  phone: { en: "Mobile", tr: "Cep telefonu" },
  brief: { en: "The brief", tr: "Brif" },
  briefHint: { en: "Optional. Where will the images be used? Any references? A link to a moodboard is perfect.", tr: "İsteğe bağlı. Kareler nerede kullanılacak? Referans var mı? Bir moodboard bağlantısı harika olur." },
  terms: { en: "I accept the booking terms: the deposit is refundable up to 7 days before the shoot, and one free reschedule.", tr: "Rezervasyon koşullarını kabul ediyorum: kapora çekimden 7 gün öncesine kadar iade edilir, bir kez ücretsiz tarih değişikliği." },
  hold: { en: "Hold this date", tr: "Bu tarihi ayırt" },
  required: { en: "Please fill this in.", tr: "Lütfen doldurun." },
  badEmail: { en: "Enter an email like name@example.com.", tr: "ad@example.com gibi bir e-posta girin." },
  needTerms: { en: "Please accept to continue.", tr: "Devam etmek için kabul edin." },
  needSlot: { en: "Choose a day and a start time.", tr: "Bir gün ve başlangıç saati seçin." },
  fix: { en: "A few things need a look.", tr: "Birkaç şeye bakmak gerekiyor." },
  hoursLong: { en: "{n} h in the studio", tr: "Stüdyoda {n} saat" },
  images: { en: "{n} retouched images", tr: "{n} rötuşlu kare" },
  people: { en: "{n} people", tr: "{n} kişi" },
  total: { en: "Total incl. VAT", tr: "KDV dahil toplam" },
  deposit: { en: "Deposit now", tr: "Şimdi kapora" },
  when: { en: "When", tr: "Ne zaman" },
  doneTitle: { en: "Date held", tr: "Tarih ayrıldı" },
  doneText: { en: "{when} is yours for 48 hours. We have emailed a payment link for the {deposit} deposit, reference {ref}. Nil will call you the week before to talk through the brief.", tr: "{when} 48 saat boyunca sizin. {deposit} tutarındaki kapora için ödeme bağlantısını e-postayla gönderdik, referans {ref}. Nil çekimden bir hafta önce brifi konuşmak için sizi arayacak." },
  again: { en: "Back to the home page", tr: "Ana sayfaya dön" },
};

export function BookingPage() {
  const { t, locale, build, chosen } = useBuild();
  const { intl, labels } = copyFor(locale);
  const s = sessionById(build.session);
  const price = priceBuild(build);
  const today = React.useMemo(() => todayIso("Europe/Istanbul"), []);
  const [day, setDay] = React.useState<string | null>(null);
  const [time, setTime] = React.useState<string | null>(null);
  const [agree, setAgree] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const doneRef = React.useRef<HTMLHeadingElement>(null);
  const slots = day ? startsFor(day, build.hours) : [];
  const longDay = (iso: string) => new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
  const whenText = day && time ? `${longDay(day)}, ${time}` : null;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const next: Record<string, string> = {};
    if (!day || !time) next.slot = t(c.needSlot);
    if (!v("name")) next.name = t(c.required);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) next.email = v("email") ? t(c.badEmail) : t(c.required);
    if (v("phone").replace(/\D/g, "").length < 10) next.phone = t(c.required);
    if (!agree) next.terms = t(c.needTerms);
    setErrors(next);
    const bad = Object.keys(next)[0];
    if (bad) {
      formRef.current?.querySelector<HTMLElement>(bad === "slot" ? "#lr-slot-h" : bad === "terms" ? "#lr-terms" : `[name="${bad}"]`)?.focus();
      return;
    }
    setDone(`LR-${day!.slice(5).replace("-", "")}-${time!.replace(":", "")}`);
    requestAnimationFrame(() => doneRef.current?.focus());
  };

  const extras = addons.filter((a) => build.addons.includes(a.id));

  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="ruled" breadcrumb={[{ label: "Lumen Room", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.crumb)} className="pt-0! pb-24">
        <Container>
          <div className="grid gap-12 @5xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] @5xl:gap-16">
            <div className="min-w-0">
              {done && whenText ? (
                <div role="status" className="flex flex-col items-start gap-5 border border-fg p-8">
                  <span className="grid size-12 place-items-center bg-accent text-accent-fg">
                    <Check aria-hidden className="size-6" />
                  </span>
                  <h2 ref={doneRef} tabIndex={-1} className="font-display text-display-m text-fg uppercase outline-none">
                    {t(c.doneTitle)}
                  </h2>
                  <p className="max-w-[58ch] text-lead text-fg-muted">{fill(t(c.doneText), { when: whenText, deposit: tl(price.deposit, locale), ref: done })}</p>
                  <Button asChild variant="secondary">
                    <a href={sitePageHref("home")}>{t(c.again)}</a>
                  </Button>
                </div>
              ) : (
                <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-12">
                  {Object.keys(errors).length ? <Alert tone="danger">{t(c.fix)}</Alert> : null}
                  <section aria-labelledby="lr-slot-h" className="flex flex-col gap-6">
                    <h2 id="lr-slot-h" tabIndex={-1} className="flex items-baseline gap-3 border-t border-fg pt-3 font-mono text-small text-fg uppercase outline-none">
                      <span className="text-fg-muted">01</span>
                      {t(c.day)} · {t(c.time)}
                    </h2>
                    <div className="grid gap-8 @3xl:grid-cols-[auto_minmax(0,1fr)]">
                      <div className="flex flex-col gap-2">
                        <Calendar
                          value={day}
                          onValueChange={(d) => {
                            setDay(d);
                            setTime(null);
                          }}
                          min={addIsoDays(today, 2)}
                          max={addIsoDays(today, 75)}
                          disabledDays={[{ dayOfWeek: [0] }]}
                          required
                        />
                        <p className="font-mono text-[11px] text-fg-muted">{t(c.closed)}</p>
                      </div>
                      <div className="min-w-0">
                        {day ? (
                          <CalendarSlots day={day} slots={slots} value={time} onValueChange={setTime} columns={3} hourCycle={24} error={slots.every((x) => !x.available) ? t(c.full) : undefined} />
                        ) : (
                          <p className="text-fg-muted">{t(c.pickDay)}</p>
                        )}
                        {errors.slot ? <p className="mt-2 text-small text-danger">{errors.slot}</p> : null}
                      </div>
                    </div>
                  </section>

                  <section aria-labelledby="lr-you-h" className="flex flex-col gap-6">
                    <h2 id="lr-you-h" className="flex items-baseline gap-3 border-t border-fg pt-3 font-mono text-small text-fg uppercase">
                      <span className="text-fg-muted">02</span>
                      {t(c.you)}
                    </h2>
                    <div className="grid gap-5 @2xl:grid-cols-2">
                      <Field label={t(c.name)} required error={errors.name}>
                        <Input name="name" autoComplete="name" />
                      </Field>
                      <Field label={t(c.company)} optional>
                        <Input name="company" autoComplete="organization" />
                      </Field>
                      <Field label={t(c.email)} required error={errors.email}>
                        <Input name="email" type="email" autoComplete="email" placeholder="name@example.com" />
                      </Field>
                      <Field label={t(c.phone)} required error={errors.phone}>
                        <PhoneInput name="phone" defaultCountry="TR" />
                      </Field>
                      <Field label={t(c.brief)} hint={t(c.briefHint)} optional className="@2xl:col-span-2">
                        <Textarea name="brief" rows={4} maxLength={600} />
                      </Field>
                      <div className="@2xl:col-span-2">
                        <Checkbox id="lr-terms" checked={agree} onCheckedChange={(v) => setAgree(v === true)} label={t(c.terms)} aria-invalid={errors.terms ? true : undefined} />
                        {errors.terms ? <p className="mt-1.5 ms-7 text-small text-danger">{errors.terms}</p> : null}
                      </div>
                    </div>
                  </section>
                  <div>
                    <Button type="submit" variant="primary" size="lg">
                      {t(c.hold)}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <aside aria-labelledby="lr-pkg-h" className="self-start border border-fg bg-surface p-5 font-mono text-[13px] @5xl:sticky @5xl:top-24 @md:p-6">
              <h2 id="lr-pkg-h" className="border-b border-dashed border-line pb-3 text-[12px] text-fg uppercase">
                {t(c.pkg)}
              </h2>
              {!chosen ? <p className="mt-3 font-sans text-small text-fg-muted">{t(c.none)}</p> : null}
              <p className="mt-4 font-display text-h3 text-fg uppercase">{t(s.name)}</p>
              <ul className="mt-3 flex flex-col gap-1 text-fg">
                <li>{fill(t(c.hoursLong), { n: num(build.hours, locale, 1) })}</li>
                <li>{fill(t(c.images), { n: build.images })}</li>
                {s.people ? <li>{fill(t(c.people), { n: build.people })}</li> : null}
                {extras.map((a) => (
                  <li key={a.id}>+ {t(a.name)}</li>
                ))}
              </ul>
              <dl className="mt-4 flex flex-col gap-1 border-t border-dashed border-line pt-3">
                <div className="flex justify-between gap-3">
                  <dt className="text-fg-muted">{t(c.when)}</dt>
                  <dd className="text-end text-fg">{whenText ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-fg-muted">{t(c.total)}</dt>
                  <dd className="tabular text-fg">{tl(price.total, locale)}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-fg pt-2">
                  <dt className="text-fg">{t(c.deposit)}</dt>
                  <dd className="tabular text-h3 text-fg">{tl(price.deposit, locale)}</dd>
                </div>
              </dl>
              <a href={sitePageHref("packages", "builder")} className="focus-ring mt-4 inline-flex items-center gap-1.5 text-[12px] text-fg underline underline-offset-4">
                <ArrowLeft aria-hidden className="size-3.5 rtl:rotate-180" />
                {t(c.change)}
              </a>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
