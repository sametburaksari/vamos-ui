"use client";

import * as React from "react";
import { Alert, Button, Checkbox, Field, Input, PhoneInput, RadioGroup, Select, Stepper, Textarea } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { Check } from "lucide-react";
import { copyFor, fill, groupFor, groups, longDate, openMornings, plans, REGISTRATION, SIBLING_DISCOUNT, tl, type PlanId } from "./content";
import { useSchool } from "./school-provider";

const c = {
  crumb: { en: "Enrol", tr: "Kayıt" },
  title: { en: "Apply for *September 2027*", tr: "*Eylül 2027* için başvurun" },
  lead: { en: "Four short steps. Applying is free and does not commit you to anything; we offer places in order of application after you have visited.", tr: "Dört kısa adım. Başvuru ücretsizdir ve sizi bağlamaz; ziyaretinizden sonra yerleri başvuru sırasına göre veririz." },
  steps: { en: "Application steps", tr: "Başvuru adımları" },
  sChild: { en: "Your child", tr: "Çocuğunuz" },
  sDays: { en: "Days", tr: "Günler" },
  sVisit: { en: "Visit", tr: "Ziyaret" },
  sYou: { en: "You", tr: "Siz" },
  childName: { en: "Child’s first name", tr: "Çocuğun adı" },
  dob: { en: "Date of birth", tr: "Doğum tarihi" },
  dobHint: { en: "We use it to suggest a group for September 2027.", tr: "Eylül 2027 için grup önermek için kullanıyoruz." },
  start: { en: "Start", tr: "Başlangıç" },
  languages: { en: "Languages at home", tr: "Evde konuşulan diller" },
  langPh: { en: "e.g. Turkish and German", tr: "örn. Türkçe ve Almanca" },
  joins: { en: "{name} would join {group} ({ages}).", tr: "{name}, {group} grubuna ({ages}) katılır." },
  tooYoung: { en: "Our youngest group starts at 24 months on 1 September 2027. We will keep your details for the following year.", tr: "En küçük grubumuz 1 Eylül 2027’de 24 aylıktan başlıyor. Bilgilerinizi bir sonraki yıl için saklarız." },
  plan: { en: "Which days?", tr: "Hangi günler?" },
  sibling: { en: "A brother or sister is already at Little Orchard", tr: "Kardeşi zaten Little Orchard’da" },
  siblingHint: { en: "10% off the monthly fee.", tr: "Aylık ücrette %10 indirim." },
  monthly: { en: "Monthly fee", tr: "Aylık ücret" },
  reg: { en: "Registration (once)", tr: "Kayıt (bir kez)" },
  included: { en: "Meals, nappies, materials and trips included.", tr: "Yemekler, bez, malzemeler ve geziler dahil." },
  visitQ: { en: "Choose an open morning", tr: "Bir tanışma sabahı seçin" },
  visitWhen: { en: "{date} · 10:00–11:30", tr: "{date} · 10:00–11:30" },
  visitNote: { en: "Up to six families each time; children welcome.", tr: "Her seferinde en fazla altı aile; çocuklar da gelebilir." },
  private: { en: "None of these dates work", tr: "Bu tarihlerin hiçbiri uygun değil" },
  privateNote: { en: "We will call to arrange a weekday visit at 16:00.", tr: "Hafta içi 16:00’da bir ziyaret ayarlamak için ararız." },
  parent: { en: "Your name", tr: "Adınız" },
  email: { en: "Email", tr: "E-posta" },
  phone: { en: "Mobile", tr: "Cep telefonu" },
  notes: { en: "Anything we should know?", tr: "Bilmemiz gereken bir şey var mı?" },
  notesHint: { en: "Optional. Allergies, routines, or anything that helps your child settle.", tr: "İsteğe bağlı. Alerjiler, alışkanlıklar ya da çocuğunuzun uyum sağlamasına yardım edecek her şey." },
  consent: { en: "I agree that Little Orchard keeps these details to handle this application, as set out in the KVKK notice. Children’s details are never shared outside the school.", tr: "Little Orchard’ın bu bilgileri KVKK aydınlatma metninde belirtildiği şekilde bu başvuru için saklamasını kabul ediyorum. Çocukların bilgileri okul dışında asla paylaşılmaz." },
  back: { en: "Back", tr: "Geri" },
  next: { en: "Continue", tr: "Devam" },
  send: { en: "Send application", tr: "Başvuruyu gönder" },
  required: { en: "Please fill this in.", tr: "Lütfen doldurun." },
  badEmail: { en: "Enter an email like name@example.com.", tr: "ad@example.com gibi bir e-posta girin." },
  needConsent: { en: "Please tick to continue.", tr: "Devam etmek için işaretleyin." },
  fix: { en: "A few fields need a look.", tr: "Birkaç alana bakmak gerekiyor." },
  summary: { en: "Your application", tr: "Başvurunuz" },
  doneTitle: { en: "Application received", tr: "Başvurunuz alındı" },
  doneText: { en: "Thank you. We have saved a place for you at the open morning on {date}. Reference {ref}. Our office will email you within two working days.", tr: "Teşekkürler. {date} tarihli tanışma sabahında size yer ayırdık. Referans {ref}. Ofisimiz iki iş günü içinde e-posta gönderecek." },
  doneTextCall: { en: "Thank you. We will call you within two working days to arrange a visit. Reference {ref}.", tr: "Teşekkürler. Bir ziyaret ayarlamak için iki iş günü içinde arayacağız. Referans {ref}." },
  home: { en: "Back to the home page", tr: "Ana sayfaya dön" },
};

const STARTS = ["2027-09", "2027-10", "2028-01"];

export function EnrolPage() {
  const { t, locale, setGroup } = useSchool();
  const { intl, labels } = copyFor(locale);
  const [step, setStep] = React.useState(0);
  const [child, setChild] = React.useState({ name: "", dob: "", start: "2027-09", languages: "" });
  const [plan, setPlan] = React.useState<PlanId>("full5");
  const [sibling, setSibling] = React.useState(false);
  const [visit, setVisit] = React.useState<string>(openMornings[0]!);
  const [consent, setConsent] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState<string | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  const group = child.dob ? groupFor(child.dob) : null;
  const chosen = plans.find((p) => p.id === plan)!;
  const monthly = Math.round(chosen.monthly * (sibling ? 1 - SIBLING_DISCOUNT : 1));
  const monthName = (ym: string) => new Intl.DateTimeFormat(intl, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${ym}-01T12:00:00Z`));

  const focusTitle = () => requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("h2")?.focus());
  const go = (n: number) => {
    setStep(n);
    focusTitle();
  };

  const nextFromChild = () => {
    const e: Record<string, string> = {};
    if (!child.name.trim()) e.childName = t(c.required);
    if (!child.dob) e.dob = t(c.required);
    setErrors(e);
    if (Object.keys(e).length) {
      panelRef.current?.querySelector<HTMLElement>(e.childName ? "[name=childName]" : "[name=dob]")?.focus();
      return;
    }
    if (group) setGroup(group);
    go(1);
  };

  const submit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const e: Record<string, string> = {};
    if (!v("parent")) e.parent = t(c.required);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) e.email = v("email") ? t(c.badEmail) : t(c.required);
    if (v("phone").replace(/\D/g, "").length < 10) e.phone = t(c.required);
    if (!consent) e.consent = t(c.needConsent);
    setErrors(e);
    const bad = Object.keys(e)[0];
    if (bad) {
      formRef.current?.querySelector<HTMLElement>(bad === "consent" ? "#lo-consent" : `[name="${bad}"]`)?.focus();
      return;
    }
    setDone(`LO-27-${child.name.slice(0, 2).toUpperCase()}${child.dob.slice(2, 4)}${child.dob.slice(5, 7)}`);
    focusTitle();
  };

  const visitLabel = visit === "call" ? t(c.private) : fill(t(c.visitWhen), { date: longDate(visit, locale, { weekday: "long", day: "numeric", month: "long" }) });

  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="simple" breadcrumb={[{ label: "Little Orchard", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.crumb)} className="pt-0! pb-24">
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
              steps={[{ id: "child", title: t(c.sChild) }, { id: "days", title: t(c.sDays) }, { id: "visit", title: t(c.sVisit) }, { id: "you", title: t(c.sYou) }]}
            />
          ) : null}
          <div className="grid gap-10 @4xl:grid-cols-[minmax(0,1fr)_21rem] @4xl:gap-14">
            <div ref={panelRef} className="min-w-0">
              {done ? (
                <div role="status" className="flex flex-col items-start gap-5">
                  <span className="grid size-14 place-items-center rounded-full bg-accent text-accent-fg">
                    <Check aria-hidden className="size-7" />
                  </span>
                  <h2 tabIndex={-1} className="font-display text-display-m text-fg outline-none">
                    {t(c.doneTitle)}
                  </h2>
                  <p className="max-w-[56ch] text-lead text-fg-muted">
                    {visit === "call" ? fill(t(c.doneTextCall), { ref: done }) : fill(t(c.doneText), { ref: done, date: longDate(visit, locale, { weekday: "long", day: "numeric", month: "long" }) })}
                  </p>
                  <Button asChild variant="secondary" className="rounded-full">
                    <a href={sitePageHref("home")}>{t(c.home)}</a>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <h2 tabIndex={-1} className="font-display text-h3 text-fg outline-none">
                    <span className="me-3 font-mono text-small font-normal text-fg-muted">{step + 1}/4</span>
                    {[t(c.sChild), t(c.plan), t(c.visitQ), t(c.sYou)][step]}
                  </h2>

                  {step === 0 ? (
                    <div className="grid gap-5 @2xl:grid-cols-2">
                      {Object.keys(errors).length ? (
                        <Alert tone="danger" className="@2xl:col-span-2">
                          {t(c.fix)}
                        </Alert>
                      ) : null}
                      <Field label={t(c.childName)} required error={errors.childName}>
                        <Input name="childName" value={child.name} onChange={(e) => setChild({ ...child, name: e.target.value })} autoComplete="off" />
                      </Field>
                      <Field label={t(c.dob)} required hint={t(c.dobHint)} error={errors.dob}>
                        <Input name="dob" type="date" min="2021-01-01" max="2026-11-30" value={child.dob} onChange={(e) => setChild({ ...child, dob: e.target.value })} />
                      </Field>
                      <Field label={t(c.start)}>
                        <Select value={child.start} onValueChange={(v) => v && setChild({ ...child, start: v })} items={STARTS.map((s) => ({ value: s, label: monthName(s) }))} />
                      </Field>
                      <Field label={t(c.languages)} optional>
                        <Input name="languages" value={child.languages} placeholder={t(c.langPh)} onChange={(e) => setChild({ ...child, languages: e.target.value })} />
                      </Field>
                      {child.dob ? (
                        <p aria-live="polite" className="rounded-[1.25rem] bg-accent-soft p-4 text-fg @2xl:col-span-2">
                          {group ? fill(t(c.joins), { name: child.name || "—", group: t(groups[group].name), ages: t(groups[group].ages) }) : t(c.tooYoung)}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {step === 1 ? (
                    <div className="flex flex-col gap-5">
                      <RadioGroup
                        aria-label={t(c.plan)}
                        variant="card"
                        value={plan}
                        onValueChange={(v) => setPlan(v as PlanId)}
                        className="grid gap-3"
                        items={plans.map((p) => ({
                          value: p.id,
                          label: (
                            <span className="flex items-baseline justify-between gap-3">
                              <span>{t(p.name)}</span>
                              <span className="tabular shrink-0 font-normal text-fg-muted">{tl(p.monthly, locale)}</span>
                            </span>
                          ),
                          description: t(p.hours),
                        }))}
                      />
                      <Checkbox variant="card" checked={sibling} onCheckedChange={(v) => setSibling(v === true)} label={t(c.sibling)} description={t(c.siblingHint)} />
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <RadioGroup
                      aria-label={t(c.visitQ)}
                      variant="card"
                      value={visit}
                      onValueChange={setVisit}
                      className="grid gap-3 @2xl:grid-cols-2"
                      items={[
                        ...openMornings.map((d) => ({ value: d, label: fill(t(c.visitWhen), { date: longDate(d, locale, { weekday: "long", day: "numeric", month: "long" }) }), description: t(c.visitNote) })),
                        { value: "call", label: t(c.private), description: t(c.privateNote) },
                      ]}
                    />
                  ) : null}

                  {step === 3 ? (
                    <form ref={formRef} id="lo-enrol" noValidate onSubmit={submit} className="grid gap-5 @2xl:grid-cols-2">
                      {Object.keys(errors).length ? (
                        <Alert tone="danger" className="@2xl:col-span-2">
                          {t(c.fix)}
                        </Alert>
                      ) : null}
                      <Field label={t(c.parent)} required error={errors.parent}>
                        <Input name="parent" autoComplete="name" />
                      </Field>
                      <Field label={t(c.email)} required error={errors.email}>
                        <Input name="email" type="email" autoComplete="email" placeholder="name@example.com" />
                      </Field>
                      <Field label={t(c.phone)} required error={errors.phone}>
                        <PhoneInput name="phone" defaultCountry="TR" />
                      </Field>
                      <Field label={t(c.notes)} hint={t(c.notesHint)} optional className="@2xl:col-span-2">
                        <Textarea name="notes" rows={3} maxLength={400} />
                      </Field>
                      <div className="@2xl:col-span-2">
                        <Checkbox id="lo-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} label={t(c.consent)} aria-invalid={errors.consent ? true : undefined} />
                        {errors.consent ? <p className="mt-1.5 ms-7 text-small text-danger">{errors.consent}</p> : null}
                      </div>
                    </form>
                  ) : null}

                  <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
                    <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>
                      {t(c.back)}
                    </Button>
                    {step === 0 ? (
                      <Button variant="primary" size="lg" className="rounded-full" onClick={nextFromChild}>
                        {t(c.next)}
                      </Button>
                    ) : step < 3 ? (
                      <Button variant="primary" size="lg" className="rounded-full" onClick={() => go(step + 1)}>
                        {t(c.next)}
                      </Button>
                    ) : (
                      <Button type="submit" form="lo-enrol" variant="primary" size="lg" className="rounded-full">
                        {t(c.send)}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <aside aria-labelledby="lo-summary" className="flex flex-col gap-4 self-start rounded-[2rem] bg-accent-soft p-6 @4xl:sticky @4xl:top-24">
              <h2 id="lo-summary" className="font-display text-h3 text-fg">
                {t(c.summary)}
              </h2>
              <dl className="flex flex-col gap-3 text-small">
                <div className="flex flex-col">
                  <dt className="text-fg-muted">{t(c.sChild)}</dt>
                  <dd className="font-semibold text-fg">{child.name ? `${child.name}${group ? ` · ${t(groups[group].name)}` : ""}` : "—"}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-fg-muted">{t(c.start)}</dt>
                  <dd className="font-semibold text-fg">{monthName(child.start)}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-fg-muted">{t(c.sDays)}</dt>
                  <dd className="font-semibold text-fg">{t(chosen.name)}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-fg-muted">{t(c.sVisit)}</dt>
                  <dd className="font-semibold text-fg">{visitLabel}</dd>
                </div>
              </dl>
              <div className="flex flex-col gap-1 border-t border-fg/15 pt-4">
                <p className="flex items-baseline justify-between gap-3">
                  <span className="text-small text-fg-muted">{t(c.monthly)}</span>
                  <span className="tabular font-display text-h3 text-fg" aria-live="polite">
                    {tl(monthly, locale)}
                  </span>
                </p>
                <p className="flex items-baseline justify-between gap-3 text-small">
                  <span className="text-fg-muted">{t(c.reg)}</span>
                  <span className="tabular text-fg">{tl(REGISTRATION, locale)}</span>
                </p>
                <p className="mt-2 text-xs text-fg-muted">{t(c.included)}</p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
