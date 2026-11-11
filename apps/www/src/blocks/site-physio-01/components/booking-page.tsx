"use client";

import * as React from "react";
import { addIsoDays, Alert, Button, Checkbox, cn, Field, Input, PhoneInput, Select, Textarea, todayIso } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { Check, ShieldCheck } from "lucide-react";
import { useArea } from "./area-provider";
import { AreaChips } from "./body-map";
import { areas, copyFor, fill, team, TIMES, tl, treatments, type TreatmentId } from "./content";

const c = {
  crumb: { en: "Booking", tr: "Randevu" },
  title: { en: "Pick a *slot*", tr: "Bir *saat* seçin" },
  lead: { en: "Live times for the next six working days. New to Motion Lab? Book an initial assessment — your physio plans the rest with you.", tr: "Önümüzdeki altı iş gününün boş saatleri. Motion Lab’de yeni misiniz? İlk değerlendirmeyi ayırtın — gerisini fizyoterapistiniz sizinle planlar." },
  area: { en: "Area", tr: "Bölge" },
  treatment: { en: "Treatment", tr: "Tedavi" },
  physio: { en: "Physiotherapist", tr: "Fizyoterapist" },
  anyone: { en: "First available", tr: "İlk müsait olan" },
  grid: { en: "Free times", tr: "Boş saatler" },
  taken: { en: "{day} {time}, taken", tr: "{day} {time}, dolu" },
  free: { en: "{day} {time}", tr: "{day} {time}" },
  pickSlot: { en: "Choose a free time.", tr: "Boş bir saat seçin." },
  name: { en: "Full name", tr: "Ad soyad" },
  phone: { en: "Mobile", tr: "Cep telefonu" },
  email: { en: "Email", tr: "E-posta" },
  notes: { en: "How did it start?", tr: "Nasıl başladı?" },
  notesHint: { en: "Optional — e.g. “after a 10 km race”, “since moving house”, “surgery on 3 October”.", tr: "İsteğe bağlı — örn. “10 km yarıştan sonra”, “taşındığımızdan beri”, “3 Ekim’de ameliyat”." },
  consent: { en: "I agree that Motion Lab keeps my treatment records as described in the KVKK notice.", tr: "Motion Lab’in tedavi kayıtlarımı KVKK aydınlatma metninde anlatıldığı şekilde saklamasını kabul ediyorum." },
  send: { en: "Book this slot", tr: "Bu saati ayırt" },
  required: { en: "Please fill this in.", tr: "Lütfen doldurun." },
  needConsent: { en: "Please tick to continue.", tr: "Devam etmek için işaretleyin." },
  fix: { en: "A few fields need a look.", tr: "Birkaç alana bakmak gerekiyor." },
  summary: { en: "Summary", tr: "Özet" },
  noSlot: { en: "No time chosen yet", tr: "Henüz saat seçilmedi" },
  min: { en: "{n} min", tr: "{n} dk" },
  privacy: { en: "Records stay in our clinic system. We send reports to your doctor or insurer only when you ask us to.", tr: "Kayıtlar klinik sistemimizde kalır. Raporları hekiminize ya da sigortanıza yalnızca siz istediğinizde göndeririz." },
  doneTitle: { en: "Booked", tr: "Randevunuz alındı" },
  doneText: { en: "{treatment} for your {area}, {when}, with {who}. A confirmation is on its way by SMS. Reference {ref}.", tr: "{area} için {treatment}, {when}, {who} ile. Onay SMS ile geliyor. Referans {ref}." },
  firstFree: { en: "the first available physio", tr: "ilk müsait fizyoterapist" },
  another: { en: "Book another slot", tr: "Başka bir saat ayırt" },
};

/** Next six working days from tomorrow (Mon–Sat). */
function workingDays(from: string) {
  const out: string[] = [];
  let d = from;
  while (out.length < 6) {
    d = addIsoDays(d, 1);
    if (new Date(`${d}T12:00:00Z`).getUTCDay() !== 0) out.push(d);
  }
  return out;
}
const isSaturday = (d: string) => new Date(`${d}T12:00:00Z`).getUTCDay() === 6;
const isTaken = (d: string, time: string, physio: string) => {
  if (isSaturday(d) && time >= "16:00") return true; // closed
  const n = Number(d.slice(-2)) + Number(time.slice(0, 2)) + physio.length;
  return n % 3 === 0;
};

export function BookingPage() {
  const { t, locale, area, treatment, setTreatment } = useArea();
  const { intl, labels } = copyFor(locale);
  const [physio, setPhysio] = React.useState("any");
  const [slot, setSlot] = React.useState<{ day: string; time: string } | null>(null);
  const [consent, setConsent] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState<Record<string, string> | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const doneRef = React.useRef<HTMLHeadingElement>(null);
  const days = React.useMemo(() => workingDays(todayIso("Europe/Istanbul")), []);
  const a = areas[area];
  const chosen = treatments[treatment ?? "assessment"];
  const physios = team.filter((p) => p.areas.includes(area));
  const fmtDay = (d: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(intl, { ...opts, timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

  React.useEffect(() => {
    if (physio !== "any" && !physios.some((p) => p.id === physio)) setPhysio("any");
  }, [area, physio, physios]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const next: Record<string, string> = {};
    if (!slot) next.slot = t(c.pickSlot);
    if (!v("name")) next.name = t(c.required);
    if (v("phone").replace(/\D/g, "").length < 10) next.phone = t(c.required);
    if (!consent) next.consent = t(c.needConsent);
    setErrors(next);
    const bad = Object.keys(next)[0];
    if (bad) {
      formRef.current?.querySelector<HTMLElement>(bad === "slot" ? "[data-slot-free]" : `#ml-${bad}, [name="${bad}"]`)?.focus();
      return;
    }
    const who = physio === "any" ? t(c.firstFree) : team.find((p) => p.id === physio)!.name;
    setDone({
      treatment: t(chosen.name),
      area: t(a.label).toLocaleLowerCase(intl),
      when: `${fmtDay(slot!.day, { weekday: "long", day: "numeric", month: "long" })}, ${slot!.time}`,
      who,
      ref: `ML-${slot!.day.slice(5).replace("-", "")}${slot!.time.slice(0, 2)}`,
    });
    requestAnimationFrame(() => doneRef.current?.focus());
  };

  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="simple" breadcrumb={[{ label: "Motion Lab", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.crumb)} className="pt-0!">
        <Container>
          <div className="grid gap-8 @4xl:grid-cols-12">
            <div className="min-w-0 @4xl:col-span-8">
              {done ? (
                <div role="status" className="flex flex-col items-start gap-5 rounded-[var(--radius)] border border-line bg-surface p-6 @md:p-8">
                  <span className="grid size-12 place-items-center rounded-[var(--radius)] bg-accent text-accent-fg">
                    <Check aria-hidden className="size-6" />
                  </span>
                  <h2 ref={doneRef} tabIndex={-1} className="font-display text-display-m text-fg uppercase outline-none">
                    {t(c.doneTitle)}
                  </h2>
                  <p className="max-w-[56ch] text-lead text-fg-muted">{fill(t(c.doneText), done)}</p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDone(null);
                      setSlot(null);
                      setConsent(false);
                    }}
                  >
                    {t(c.another)}
                  </Button>
                </div>
              ) : (
                <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-6 rounded-[var(--radius)] border border-line bg-surface p-5 @md:p-7">
                  {Object.keys(errors).length ? <Alert tone="danger">{t(c.fix)}</Alert> : null}
                  <div className="flex flex-col gap-2">
                    <p className="text-small font-medium text-fg">{t(c.area)}</p>
                    <AreaChips size="sm" />
                  </div>
                  <div className="grid gap-5 @2xl:grid-cols-2">
                    <Field label={t(c.treatment)}>
                      <Select
                        name="treatment"
                        value={chosen.id}
                        onValueChange={(v) => setTreatment((v || "assessment") as TreatmentId)}
                        items={a.treatments.map((id) => ({ value: id, label: `${t(treatments[id].name)} · ${fill(t(c.min), { n: treatments[id].minutes })} · ${tl(treatments[id].fee, locale)}` }))}
                      />
                    </Field>
                    <Field label={t(c.physio)}>
                      <Select name="physio" value={physio} onValueChange={(v) => setPhysio(v || "any")} items={[{ value: "any", label: t(c.anyone) }, ...physios.map((p) => ({ value: p.id, label: `${p.name} — ${t(p.focus)}` }))]} />
                    </Field>
                  </div>

                  <fieldset className="flex min-w-0 flex-col gap-2">
                    <legend className="mb-2 text-small font-medium text-fg">
                      {t(c.grid)} <span aria-hidden className="text-danger">*</span>
                    </legend>
                    <div className="-mx-1 overflow-x-auto px-1 pb-1">
                      <table className="w-full min-w-[30rem] border-separate border-spacing-1 text-small">
                        <thead>
                          <tr>
                            <td aria-hidden />
                            {days.map((d) => (
                              <th key={d} scope="col" className="pb-1 text-center font-mono text-xs font-normal text-fg-muted uppercase">
                                <span className="block">{fmtDay(d, { weekday: "short" })}</span>
                                <span className="block text-fg">{fmtDay(d, { day: "numeric", month: "short" })}</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {TIMES.map((time) => (
                            <tr key={time}>
                              <th scope="row" className="pe-1 text-start font-mono text-xs font-normal text-fg-muted tabular">
                                {time}
                              </th>
                              {days.map((d) => {
                                const taken = isTaken(d, time, physio);
                                const on = slot?.day === d && slot.time === time;
                                const dayLabel = fmtDay(d, { weekday: "long", day: "numeric", month: "long" });
                                return (
                                  <td key={d} className="p-0">
                                    <button
                                      type="button"
                                      disabled={taken}
                                      aria-pressed={on}
                                      data-slot-free={taken ? undefined : ""}
                                      aria-label={fill(t(taken ? c.taken : c.free), { day: dayLabel, time })}
                                      onClick={() => setSlot({ day: d, time })}
                                      className={cn(
                                        "focus-ring h-9 w-full rounded-[calc(var(--radius)-2px)] font-mono text-xs tabular transition-colors motion-reduce:transition-none",
                                        taken ? "cursor-not-allowed bg-transparent text-fg-subtle line-through" : on ? "bg-accent text-accent-fg" : "border border-line bg-surface-2 text-fg hover:border-accent-ink",
                                      )}
                                    >
                                      {taken ? "—" : time}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {errors.slot ? <p className="text-small text-danger">{errors.slot}</p> : null}
                  </fieldset>

                  <div className="grid gap-5 @2xl:grid-cols-2">
                    <Field label={t(c.name)} required error={errors.name}>
                      <Input id="ml-name" name="name" autoComplete="name" />
                    </Field>
                    <Field label={t(c.phone)} required error={errors.phone}>
                      <PhoneInput id="ml-phone" name="phone" defaultCountry="TR" />
                    </Field>
                    <Field label={t(c.email)} optional>
                      <Input name="email" type="email" autoComplete="email" />
                    </Field>
                    <Field label={t(c.notes)} hint={t(c.notesHint)} optional className="@2xl:col-span-2">
                      <Textarea name="notes" rows={2} maxLength={300} />
                    </Field>
                  </div>
                  <div>
                    <Checkbox id="ml-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} label={t(c.consent)} aria-invalid={errors.consent ? true : undefined} />
                    {errors.consent ? <p className="mt-1.5 ms-7 text-small text-danger">{errors.consent}</p> : null}
                  </div>
                  <Button type="submit" variant="primary" size="lg" className="self-start">
                    {t(c.send)}
                  </Button>
                </form>
              )}
            </div>

            <aside aria-labelledby="ml-summary-h" className="min-w-0 @4xl:col-span-4">
              <div className="flex flex-col gap-4 @4xl:sticky @4xl:top-[calc(var(--topbar-h,4rem)+1.5rem)]">
                <div className="flex flex-col rounded-[var(--radius)] border border-line">
                  <h2 id="ml-summary-h" className="border-b border-line px-4 py-3 font-mono text-xs tracking-wider text-fg-muted uppercase">
                    {t(c.summary)}
                  </h2>
                  <dl className="divide-y divide-line text-small">
                    {[
                      [t(c.area), t(a.label)],
                      [t(c.treatment), t(chosen.name)],
                      [fill(t(c.min), { n: chosen.minutes }), tl(chosen.fee, locale)],
                      [t(c.grid), slot ? `${fmtDay(slot.day, { weekday: "short", day: "numeric", month: "short" })} · ${slot.time}` : t(c.noSlot)],
                    ].map(([k, val], i) => (
                      <div key={i} className="flex items-baseline justify-between gap-3 px-4 py-3">
                        <dt className="text-fg-muted">{k}</dt>
                        <dd className="text-end font-medium text-fg tabular">{val}</dd>
                      </div>
                    ))}
                  </dl>
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
