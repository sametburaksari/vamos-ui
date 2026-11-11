"use client";

import * as React from "react";
import { addIsoDays, Alert, Button, Checkbox, DatePicker, Field, Input, PhoneInput, RadioGroup, Select, Textarea, todayIso } from "@vamos-ui/react";
import { Container, PageIntro, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { Check, Clock, ShieldCheck } from "lucide-react";
import { copyFor, fill, firstYear, groupNames, pets, services, type ServiceGroup } from "./content";
import { PET_ICONS, PetSwitch, usePet } from "./pet-provider";
import { lengthOf, priceOf } from "./vet-parts";

const c = {
  crumb: { en: "Services & fees", tr: "Hizmetler ve ücretler" },
  title: { en: "Services and fees, *by pet*", tr: "Hizmetler ve ücretler, *dostunuza göre*" },
  lead: { en: "Pick your pet: the list, the prices and the first-year plan change with it. Every fee includes VAT; surgery is priced by weight and confirmed at the pre-op check.", tr: "Dostunuzu seçin: liste, fiyatlar ve ilk yıl planı ona göre değişir. Tüm ücretlere KDV dahildir; ameliyat ücreti kiloya göre belirlenir ve ameliyat öncesi kontrolde netleşir." },
  who: { en: "Show services for", tr: "Hizmetleri göster" },
  count: { en: "{n} services for {pets}", tr: "{pets} için {n} hizmet" },
  book: { en: "Request", tr: "İste" },
  plan: { en: "The first year", tr: "İlk yıl" },
  planTitle: { en: "A first-year plan for *{pets}*", tr: "*{pets}* için ilk yıl planı" },
  planLead: { en: "What we usually suggest, so nothing comes as a surprise. Your vet adjusts it at the first visit.", tr: "Sürpriz olmasın diye genellikle önerdiğimiz plan. Hekiminiz ilk ziyarette size göre düzenler." },
  formEyebrow: { en: "Appointment request", tr: "Randevu isteği" },
  formTitle: { en: "Ask for a *time*", tr: "Bir *saat* isteyin" },
  formLead: { en: "The desk replies within working hours, usually in under an hour, with two times to choose from. For anything urgent, please call.", tr: "Danışma mesai saatlerinde, genellikle bir saatten kısa sürede iki saat seçeneğiyle yanıt verir. Acil durumlarda lütfen arayın." },
  pet: { en: "Your pet", tr: "Dostunuz" },
  service: { en: "Service", tr: "Hizmet" },
  pick: { en: "Choose a service", tr: "Bir hizmet seçin" },
  petName: { en: "Pet’s name", tr: "Dostunuzun adı" },
  age: { en: "Age", tr: "Yaşı" },
  agePh: { en: "e.g. 4 years, 10 weeks", tr: "örn. 4 yaş, 10 haftalık" },
  day: { en: "Preferred day", tr: "Tercih ettiğiniz gün" },
  time: { en: "Time of day", tr: "Günün saati" },
  morning: { en: "Morning", tr: "Sabah" },
  afternoon: { en: "Afternoon", tr: "Öğleden sonra" },
  evening: { en: "After 17:00", tr: "17:00 sonrası" },
  owner: { en: "Your name", tr: "Adınız" },
  phone: { en: "Mobile", tr: "Cep telefonu" },
  notes: { en: "Anything we should know?", tr: "Bilmemiz gereken bir şey var mı?" },
  notesHint: { en: "Optional — e.g. “nervous with men”, “needs a muzzle”, “last vaccination in March”.", tr: "İsteğe bağlı — örn. “erkeklerden çekinir”, “ağızlık gerekir”, “son aşı martta”." },
  consent: { en: "I agree that Pawbridge uses my and my pet’s details to answer this request, as described in the privacy notice.", tr: "Pawbridge’in bu isteği yanıtlamak için benim ve dostumun bilgilerini gizlilik bildiriminde anlatıldığı şekilde kullanmasını kabul ediyorum." },
  privacy: { en: "Pet records stay in our clinic system and are never shared with insurers or breeders without your written say-so.", tr: "Hayvan kayıtları klinik sistemimizde kalır; yazılı izniniz olmadan sigortacılarla ya da üreticilerle asla paylaşılmaz." },
  send: { en: "Send request", tr: "İsteği gönder" },
  required: { en: "Please fill this in.", tr: "Lütfen doldurun." },
  needConsent: { en: "Please tick to continue.", tr: "Devam etmek için işaretleyin." },
  fix: { en: "A few fields need a look.", tr: "Birkaç alana bakmak gerekiyor." },
  doneTitle: { en: "Request sent", tr: "İstek gönderildi" },
  doneText: { en: "Thanks — we will text you two times for {name}’s {service} on {day}. Reference {ref}.", tr: "Teşekkürler — {name} için {service} randevusunda {day} gününe ait iki saat seçeneğini SMS ile göndereceğiz. Referans {ref}." },
  another: { en: "Request another appointment", tr: "Başka bir randevu iste" },
};

const GROUPS: ServiceGroup[] = ["routine", "care", "surgery"];

export function ServicesPage() {
  const { pet, t, locale, setService } = usePet();
  const { intl, labels } = copyFor(locale);
  const p = pets[pet];
  const Icon = PET_ICONS[pet];
  const list = services[pet];

  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="ruled" breadcrumb={[{ label: "Pawbridge", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />

      <Section theme={{ rhythm: "tight" }} aria-label={t(c.crumb)} className="pt-0!">
        <Container>
          <div className="sticky top-[calc(var(--topbar-h,4rem)+0.5rem)] z-10 -mx-2 mb-10 flex flex-col gap-3 rounded-[1.5rem] bg-scene/90 px-2 py-3 backdrop-blur-sm @3xl:flex-row @3xl:items-center @3xl:justify-between">
            <PetSwitch label={t(c.who)} />
            <p className="flex items-center gap-2 text-small text-fg-muted" aria-live="polite">
              <Icon aria-hidden className="size-4 text-accent-ink" />
              {fill(t(c.count), { n: list.length, pets: t(p.plural) })}
            </p>
          </div>

          <div key={pet} className="grid gap-12 @4xl:grid-cols-3 @4xl:gap-8">
            {GROUPS.map((g) => {
              const rows = list.filter((s) => s.group === g);
              if (!rows.length) return null;
              return (
                <section key={g} aria-labelledby={`pb-g-${g}`} className="flex flex-col">
                  <h2 id={`pb-g-${g}`} className="mb-3 font-display text-h3 text-fg">
                    {t(groupNames[g])}
                  </h2>
                  <ul className="flex flex-col gap-3">
                    {rows.map((s) => (
                      <li key={s.id} className="flex flex-col gap-2 rounded-[1.25rem] border border-line bg-surface p-4 animate-[ui-rise_320ms_cubic-bezier(0.2,0.8,0.2,1)_both] motion-reduce:animate-none">
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="font-semibold text-fg">{t(s.name)}</h3>
                        </div>
                        <p className="text-small text-fg-muted">{t(s.text)}</p>
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-3 text-small">
                            <span className="tabular font-semibold text-fg">{priceOf(s, locale, t)}</span>
                            <span className="flex items-center gap-1 text-fg-muted">
                              <Clock aria-hidden className="size-3.5" />
                              {lengthOf(s, t)}
                            </span>
                          </span>
                          <a href={sitePageHref("services", "book")} onClick={() => setService(s.id)} className="focus-ring rounded-sm text-small font-semibold text-accent-ink underline-offset-4 hover:underline">
                            {t(c.book)}
                            <span className="sr-only"> — {t(s.name)}</span>
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section theme={{ surface: "surface-2" }} headingId="pb-plan-h">
        <Container>
          <SectionHeader eyebrow={t(c.plan)} title={fill(t(c.planTitle), { pets: t(p.plural) })} lead={t(c.planLead)} headingId="pb-plan-h" className="mb-10" />
          <ol key={pet} className="relative grid gap-6 @3xl:grid-flow-col @3xl:auto-cols-fr @3xl:gap-4">
            <span aria-hidden className="absolute start-[0.6875rem] top-3 bottom-3 w-0.5 rounded-full bg-accent-soft @3xl:start-3 @3xl:end-3 @3xl:top-[0.6875rem] @3xl:bottom-auto @3xl:h-0.5 @3xl:w-auto" />
            {firstYear[pet].map((step, i) => (
              <li key={i} className="relative flex gap-4 @3xl:flex-col @3xl:gap-3">
                <span aria-hidden className="relative z-[1] mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-fg">
                  {i + 1}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-display text-h3 text-fg">{t(step.when)}</span>
                  <span className="text-small text-fg-muted">{t(step.what)}</span>
                </span>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <AppointmentRequest />
    </>
  );
}

/** A short request form; the pet comes from the switch, the service from any "Request" link. */
function AppointmentRequest() {
  const { pet, t, locale, service, setService } = usePet();
  const { intl } = copyFor(locale);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [consent, setConsent] = React.useState(false);
  const [day, setDay] = React.useState<string | null>(null);
  const [slot, setSlot] = React.useState("morning");
  const [done, setDone] = React.useState<{ ref: string; name: string; service: string; day: string } | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const doneRef = React.useRef<HTMLHeadingElement>(null);
  const today = React.useMemo(() => todayIso("Europe/Istanbul"), []);
  const list = services[pet];
  const chosen = list.find((s) => s.id === service);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const next: Record<string, string> = {};
    if (!chosen) next.service = t(c.required);
    if (!v("petName")) next.petName = t(c.required);
    if (!day) next.day = t(c.required);
    if (!v("owner")) next.owner = t(c.required);
    if (v("phone").replace(/\D/g, "").length < 10) next.phone = t(c.required);
    if (!consent) next.consent = t(c.needConsent);
    setErrors(next);
    const bad = Object.keys(next)[0];
    if (bad) {
      formRef.current?.querySelector<HTMLElement>(`[name="${bad}"], #pb-${bad}, #pb-consent`)?.focus();
      return;
    }
    const longDay = new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));
    setDone({ ref: `PB-${day!.slice(5).replace("-", "")}-${pet.slice(0, 2).toUpperCase()}`, name: v("petName"), service: t(chosen!.name).toLocaleLowerCase(intl), day: longDay });
    requestAnimationFrame(() => doneRef.current?.focus());
  };

  return (
    <Section anchor="book" headingId="pb-book-h">
      <Container>
        <div className="grid gap-10 @4xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] @4xl:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeader eyebrow={t(c.formEyebrow)} title={t(c.formTitle)} lead={t(c.formLead)} headingId="pb-book-h" />
            <p className="flex gap-3 rounded-[1.25rem] bg-accent-soft p-4 text-small text-fg">
              <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
              {t(c.privacy)}
            </p>
          </div>

          {done ? (
            <div role="status" className="flex flex-col items-start gap-5 rounded-[1.75rem] border border-line bg-surface p-8">
              <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-fg">
                <Check aria-hidden className="size-6" />
              </span>
              <h3 ref={doneRef} tabIndex={-1} className="font-display text-display-m text-fg outline-none">
                {t(c.doneTitle)}
              </h3>
              <p className="max-w-[52ch] text-lead text-fg-muted">{fill(t(c.doneText), done)}</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setDone(null);
                  setConsent(false);
                  setDay(null);
                  setService(null);
                }}
              >
                {t(c.another)}
              </Button>
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={submit} className="grid gap-5 rounded-[1.75rem] border border-line bg-surface p-5 @md:p-8 @2xl:grid-cols-2">
              {Object.keys(errors).length ? (
                <Alert tone="danger" className="@2xl:col-span-2">
                  {t(c.fix)}
                </Alert>
              ) : null}
              <div className="flex flex-col gap-2 @2xl:col-span-2">
                <p className="text-small font-medium text-fg">{t(c.pet)}</p>
                <PetSwitch label={t(c.pet)} size="md" />
              </div>
              <Field label={t(c.service)} required error={errors.service} className="@2xl:col-span-2">
                <Select
                  name="service"
                  id="pb-service"
                  placeholder={t(c.pick)}
                  value={chosen?.id ?? ""}
                  onValueChange={(v) => setService(v || null)}
                  items={list.map((s) => ({ value: s.id, label: `${t(s.name)} · ${priceOf(s, locale, t)}` }))}
                />
              </Field>
              <Field label={t(c.petName)} required error={errors.petName}>
                <Input name="petName" autoComplete="off" />
              </Field>
              <Field label={t(c.age)} optional>
                <Input name="age" placeholder={t(c.agePh)} />
              </Field>
              <Field label={t(c.day)} required error={errors.day}>
                <DatePicker id="pb-day" name="day" value={day} onValueChange={setDay} min={addIsoDays(today, 1)} max={addIsoDays(today, 30)} />
              </Field>
              <Field label={t(c.time)}>
                <RadioGroup
                  name="slot"
                  variant="segmented"
                  value={slot}
                  onValueChange={setSlot}
                  items={[
                    { value: "morning", label: t(c.morning) },
                    { value: "afternoon", label: t(c.afternoon) },
                    { value: "evening", label: t(c.evening) },
                  ]}
                />
              </Field>
              <Field label={t(c.owner)} required error={errors.owner}>
                <Input name="owner" autoComplete="name" />
              </Field>
              <Field label={t(c.phone)} required error={errors.phone}>
                <PhoneInput name="phone" defaultCountry="TR" />
              </Field>
              <Field label={t(c.notes)} hint={t(c.notesHint)} optional className="@2xl:col-span-2">
                <Textarea name="notes" rows={3} maxLength={300} />
              </Field>
              <div className="@2xl:col-span-2">
                <Checkbox id="pb-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} label={t(c.consent)} aria-invalid={errors.consent ? true : undefined} />
                {errors.consent ? <p className="mt-1.5 ms-7 text-small text-danger">{errors.consent}</p> : null}
              </div>
              <div className="@2xl:col-span-2">
                <Button type="submit" variant="primary" size="lg" className="rounded-full">
                  {t(c.send)}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Container>
    </Section>
  );
}
