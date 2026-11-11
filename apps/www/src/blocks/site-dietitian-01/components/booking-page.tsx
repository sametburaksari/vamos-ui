"use client";

import * as React from "react";
import { addIsoDays, Alert, Button, Checkbox, cn, DatePicker, Field, Input, PhoneInput, RadioGroup, Select, Textarea, todayIso, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { Check, ShieldCheck } from "lucide-react";
import { copyFor, fill, goals, planFor, programmes, SLOTS, supportNames, team, tl, type Mode, type ProgrammeId } from "./content";
import { usePlan } from "./plan-provider";

const c = {
  crumb: { en: "Booking", tr: "Randevu" },
  title: { en: "Book your *first consultation*", tr: "*İlk görüşmenizi* ayırtın" },
  lead: { en: "Sixty minutes with a dietitian. You pay only for this visit today; the rest of the programme is decided together at the end of it.", tr: "Bir diyetisyenle altmış dakika. Bugün yalnızca bu görüşmenin ücretini ödersiniz; programın geri kalanına görüşmenin sonunda birlikte karar verilir." },
  programme: { en: "Programme", tr: "Program" },
  weeksN: { en: "{n} weeks", tr: "{n} hafta" },
  undecided: { en: "Not sure yet — decide at the visit", tr: "Henüz emin değilim — görüşmede karar verelim" },
  mode: { en: "Where", tr: "Nerede" },
  clinic: { en: "Ataşehir clinic", tr: "Ataşehir klinik" },
  online: { en: "Online video", tr: "Çevrim içi görüntülü" },
  dietitian: { en: "Dietitian", tr: "Diyetisyen" },
  anyone: { en: "First available", tr: "İlk müsait olan" },
  day: { en: "Day", tr: "Gün" },
  time: { en: "Time", tr: "Saat" },
  pickDay: { en: "Pick a day to see free times.", tr: "Boş saatleri görmek için bir gün seçin." },
  full: { en: "{time}, taken", tr: "{time}, dolu" },
  name: { en: "Full name", tr: "Ad soyad" },
  email: { en: "Email", tr: "E-posta" },
  phone: { en: "Mobile", tr: "Cep telefonu" },
  notes: { en: "Allergies, medication or anything we should prepare for", tr: "Alerjiler, ilaçlar ya da hazırlanmamız gereken bir şey" },
  notesHint: { en: "Optional. Seen only by your dietitian.", tr: "İsteğe bağlı. Yalnızca diyetisyeniniz görür." },
  consent: { en: "I agree that Greenplate stores my health details for my care, as described in the KVKK notice.", tr: "Greenplate’in sağlık bilgilerimi bakımım için KVKK aydınlatma metninde anlatıldığı şekilde saklamasını kabul ediyorum." },
  send: { en: "Confirm booking", tr: "Randevuyu onayla" },
  required: { en: "Please fill this in.", tr: "Lütfen doldurun." },
  badEmail: { en: "Please enter a valid email.", tr: "Lütfen geçerli bir e-posta girin." },
  needConsent: { en: "Please tick to continue.", tr: "Devam etmek için işaretleyin." },
  fix: { en: "A few fields need a look.", tr: "Birkaç alana bakmak gerekiyor." },
  summary: { en: "Your booking", tr: "Randevunuz" },
  today: { en: "Due at the visit", tr: "Görüşmede ödenecek" },
  later: { en: "If you continue with {name}", tr: "{name} ile devam ederseniz" },
  laterText: { en: "{price} in total for {weeks} weeks, first consultation deducted.", tr: "{weeks} hafta için toplam {price}; ilk görüşme ücreti düşülür." },
  change: { en: "Change programme", tr: "Programı değiştir" },
  fromPicker: { en: "From the picker: {goal}, {support} support", tr: "Seçiciden: {goal}, {support} destek" },
  privacy: { en: "Health details are stored in our clinic system in Türkiye, never shared with gyms, brands or insurers, and deleted on request.", tr: "Sağlık bilgileri Türkiye’deki klinik sistemimizde saklanır; spor salonları, markalar ya da sigortalarla asla paylaşılmaz ve talep üzerine silinir." },
  doneTitle: { en: "You’re booked", tr: "Randevunuz alındı" },
  doneText: { en: "{day} at {time}, {where}. We have emailed a confirmation and a three-day food diary to fill in before you come. Reference {ref}.", tr: "{day}, saat {time}, {where}. Onay e-postası ve gelmeden önce dolduracağınız üç günlük beslenme günlüğünü gönderdik. Referans {ref}." },
  whereClinic: { en: "at the Ataşehir clinic", tr: "Ataşehir klinikte" },
  whereOnline: { en: "online — the link arrives an hour before", tr: "çevrim içi — bağlantı bir saat önce gelir" },
  another: { en: "Make another booking", tr: "Başka bir randevu al" },
};

const FIRST_FEE = 2200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Taken slots differ by day, deterministically (so server and client agree). */
const takenOn = (day: string) => {
  const n = Number(day.slice(-2));
  return new Set(SLOTS.filter((_, i) => (n + i * 3) % 4 === 0));
};

export function BookingPage() {
  const { t, locale, goal, support, mode, setMode, programme, setProgramme } = usePlan();
  const { intl, labels } = copyFor(locale);
  const [choice, setChoice] = React.useState<ProgrammeId | "none">(programme);
  const [day, setDay] = React.useState<string | null>(null);
  const [time, setTime] = React.useState("");
  const [who, setWho] = React.useState("any");
  const [consent, setConsent] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState<{ day: string; time: string; where: string; ref: string } | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const doneRef = React.useRef<HTMLHeadingElement>(null);
  const today = React.useMemo(() => todayIso("Europe/Istanbul"), []);

  // Follow the picker when it changes elsewhere.
  React.useEffect(() => setChoice(programme), [programme]);
  const taken = day ? takenOn(day) : new Set<string>();
  const plan = choice === "none" ? null : planFor(choice, support, mode);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const next: Record<string, string> = {};
    if (!day) next.day = t(c.required);
    if (!time) next.time = t(c.required);
    if (!v("name")) next.name = t(c.required);
    if (!EMAIL_RE.test(v("email"))) next.email = v("email") ? t(c.badEmail) : t(c.required);
    if (v("phone").replace(/\D/g, "").length < 10) next.phone = t(c.required);
    if (!consent) next.consent = t(c.needConsent);
    setErrors(next);
    const bad = Object.keys(next)[0];
    if (bad) {
      formRef.current?.querySelector<HTMLElement>(`#gp-${bad}, [name="${bad}"]`)?.focus();
      return;
    }
    const longDay = new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));
    setDone({ day: longDay, time, where: t(mode === "clinic" ? c.whereClinic : c.whereOnline), ref: `GP-${day!.slice(5).replace("-", "")}-${time.replace(":", "")}` });
    requestAnimationFrame(() => doneRef.current?.focus());
  };

  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="simple" breadcrumb={[{ label: "Greenplate", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.crumb)} className="pt-0!">
        <Container>
          <div className="grid gap-10 @4xl:grid-cols-12 @4xl:gap-10">
            <div className="@4xl:col-span-8">
              {done ? (
                <div role="status" className="surface flex flex-col items-start gap-5 rounded-[calc(var(--radius)*2)] p-6 @md:p-8">
                  <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-fg">
                    <Check aria-hidden className="size-6" />
                  </span>
                  <h2 ref={doneRef} tabIndex={-1} className="font-display text-display-m font-bold text-fg outline-none">
                    {t(c.doneTitle)}
                  </h2>
                  <p className="max-w-[56ch] text-lead text-fg-muted">{fill(t(c.doneText), done)}</p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDone(null);
                      setDay(null);
                      setTime("");
                      setConsent(false);
                    }}
                  >
                    {t(c.another)}
                  </Button>
                </div>
              ) : (
                <form ref={formRef} noValidate onSubmit={submit} className="surface grid gap-5 rounded-[calc(var(--radius)*2)] p-5 @md:p-8 @2xl:grid-cols-2">
                  {Object.keys(errors).length ? (
                    <Alert tone="danger" className="@2xl:col-span-2">
                      {t(c.fix)}
                    </Alert>
                  ) : null}
                  <Field label={t(c.programme)} className="@2xl:col-span-2">
                    <Select
                      name="programme"
                      value={choice}
                      onValueChange={(v) => {
                        const id = (v || "none") as ProgrammeId | "none";
                        setChoice(id);
                        if (id !== "none") setProgramme(id);
                      }}
                      items={[
                        ...(Object.keys(programmes) as ProgrammeId[]).map((id) => ({ value: id, label: `${t(programmes[id].name)} · ${fill(t(c.weeksN), { n: programmes[id].weeks })}` })),
                        { value: "none", label: t(c.undecided) },
                      ]}
                    />
                  </Field>
                  <Field label={t(c.mode)}>
                    <RadioGroup
                      name="mode"
                      variant="segmented"
                      value={mode}
                      onValueChange={(v) => setMode(v as Mode)}
                      items={[
                        { value: "clinic", label: t(c.clinic) },
                        { value: "online", label: t(c.online) },
                      ]}
                    />
                  </Field>
                  <Field label={t(c.dietitian)}>
                    <Select name="dietitian" value={who} onValueChange={(v) => setWho(v || "any")} items={[{ value: "any", label: t(c.anyone) }, ...team.map((d) => ({ value: d.id, label: `${d.name} — ${t(d.focus)}` }))]} />
                  </Field>
                  <Field label={t(c.day)} required error={errors.day}>
                    <DatePicker
                      id="gp-day"
                      name="day"
                      value={day}
                      onValueChange={(v) => {
                        setDay(v);
                        setTime("");
                      }}
                      min={addIsoDays(today, 1)}
                      max={addIsoDays(today, 28)}
                    />
                  </Field>
                  <div className="flex flex-col gap-2 @2xl:col-span-2" role="group" aria-labelledby="gp-time-l">
                    <p id="gp-time-l" className="text-small font-medium text-fg">
                      {t(c.time)} <span aria-hidden className="text-danger">*</span>
                    </p>
                    {day ? (
                      <ToggleGroup id="gp-time" type="single" variant="outline" aria-labelledby="gp-time-l" value={time} onValueChange={(v) => setTime(v)} className="grid grid-cols-3 gap-2 @md:grid-cols-6">
                        {SLOTS.map((s) => {
                          const off = taken.has(s);
                          return (
                            <ToggleGroupItem
                              key={s}
                              value={s}
                              disabled={off}
                              aria-label={off ? fill(t(c.full), { time: s }) : s}
                              className={cn("h-11 font-mono tabular data-[state=on]:border-transparent data-[state=on]:bg-accent data-[state=on]:text-accent-fg", off && "line-through")}
                            >
                              {s}
                            </ToggleGroupItem>
                          );
                        })}
                      </ToggleGroup>
                    ) : (
                      <p className="rounded-[var(--radius)] border border-dashed border-line p-3 text-small text-fg-muted">{t(c.pickDay)}</p>
                    )}
                    {errors.time ? <p className="text-small text-danger">{errors.time}</p> : null}
                  </div>
                  <Field label={t(c.name)} required error={errors.name}>
                    <Input name="name" autoComplete="name" />
                  </Field>
                  <Field label={t(c.email)} required error={errors.email}>
                    <Input name="email" type="email" autoComplete="email" />
                  </Field>
                  <Field label={t(c.phone)} required error={errors.phone}>
                    <PhoneInput name="phone" defaultCountry="TR" />
                  </Field>
                  <Field label={t(c.notes)} hint={t(c.notesHint)} optional className="@2xl:col-span-2">
                    <Textarea name="notes" rows={3} maxLength={500} />
                  </Field>
                  <div className="@2xl:col-span-2">
                    <Checkbox id="gp-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} label={t(c.consent)} aria-invalid={errors.consent ? true : undefined} />
                    {errors.consent ? <p className="mt-1.5 ms-7 text-small text-danger">{errors.consent}</p> : null}
                  </div>
                  <div className="@2xl:col-span-2">
                    <Button type="submit" variant="primary" size="lg">
                      {t(c.send)}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <aside aria-labelledby="gp-summary-h" className="@4xl:col-span-4">
              <div className="flex flex-col gap-5 @4xl:sticky @4xl:top-[calc(var(--topbar-h,4rem)+1.5rem)]">
                <div className="flex flex-col gap-4 rounded-[calc(var(--radius)*2)] border border-line p-5">
                  <h2 id="gp-summary-h" className="font-display text-h3 font-bold text-fg">
                    {t(c.summary)}
                  </h2>
                  <p className="text-xs text-fg-muted">{fill(t(c.fromPicker), { goal: t(goals[goal].label), support: t(supportNames[support].label).toLocaleLowerCase(intl) })}</p>
                  <div className="flex items-baseline justify-between gap-3 border-y border-line py-3">
                    <span className="text-small text-fg">{t(c.today)}</span>
                    <span className="font-display text-h3 font-bold text-fg tabular">{tl(FIRST_FEE, locale)}</span>
                  </div>
                  {plan ? (
                    <div className="flex flex-col gap-1">
                      <p className="text-small font-medium text-fg">{fill(t(c.later), { name: t(plan.programme.name) })}</p>
                      <p className="text-small text-fg-muted">{fill(t(c.laterText), { price: tl(plan.price, locale), weeks: plan.weeks })}</p>
                    </div>
                  ) : null}
                  <a href={sitePageHref("programmes", "find")} className="focus-ring self-start rounded-sm text-small font-medium text-accent-ink underline-offset-4 hover:underline">
                    {t(c.change)}
                  </a>
                </div>
                <p className="flex gap-3 rounded-[var(--radius)] bg-accent-soft p-4 text-small text-fg">
                  <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
                  {t(c.privacy)}
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
