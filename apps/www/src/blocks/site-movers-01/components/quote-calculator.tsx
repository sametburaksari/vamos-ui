"use client";

import * as React from "react";
import { addIsoDays, Alert, Button, Calendar, Checkbox, Field, Input, NativeSelect, PhoneInput, RadioGroup, Slider, Stepper, Switch, Textarea, todayIso } from "@vamos-ui/react";
import { ArrowLeft, ArrowRight, Check, Sparkles, Truck, Package } from "lucide-react";
import { useQuote } from "./quote-provider";
import { dayRate, extras, fill, intlOf, num, sizeName, sizes, tl, type ExtraId, type HomeSize, type ServiceKind } from "./content";

const c = {
  steps: { en: "Quote steps", tr: "Teklif adımları" },
  sService: { en: "Service", tr: "Hizmet" },
  sHome: { en: "Home", tr: "Ev" },
  sExtras: { en: "Extras", tr: "Ekstralar" },
  sDate: { en: "Date", tr: "Tarih" },
  sYou: { en: "Contact", tr: "İletişim" },
  qService: { en: "What do you need?", tr: "Neye ihtiyacınız var?" },
  qHome: { en: "Tell us about the home", tr: "Evden bahsedin" },
  qExtras: { en: "Anything extra?", tr: "Ek bir şey var mı?" },
  qDate: { en: "When?", tr: "Ne zaman?" },
  qYou: { en: "Where do we send the fixed price?", tr: "Sabit fiyatı nereye gönderelim?" },
  move: { en: "Move", tr: "Taşınma" },
  moveHint: { en: "Crew, truck, blankets and floor protection", tr: "Ekip, kamyon, battaniye ve zemin koruması" },
  clean: { en: "Clean", tr: "Temizlik" },
  cleanHint: { en: "End-of-tenancy clean of an empty home", tr: "Boş evde taşınma temizliği" },
  both: { en: "Move + clean", tr: "Taşınma + temizlik" },
  bothHint: { en: "Cleaners start as the truck leaves", tr: "Kamyon çıkınca temizlik başlar" },
  size: { en: "Home size", tr: "Ev büyüklüğü" },
  from: { en: "Moving from", tr: "Çıkış adresi" },
  to: { en: "Moving to", tr: "Varış adresi" },
  where: { en: "The home", tr: "Ev" },
  floor: { en: "Floor", tr: "Kat" },
  ground: { en: "Ground", tr: "Zemin" },
  lift: { en: "Lift we can use", tr: "Kullanılabilir asansör" },
  km: { en: "Distance by road", tr: "Yol mesafesi" },
  kmHint: { en: "Within İstanbul. Between cities? Call us.", tr: "İstanbul içi. Şehirler arası mı? Bizi arayın." },
  weeks: { en: "Storage weeks", tr: "Depolama haftası" },
  flex: { en: "I’m flexible by ±3 days", tr: "±3 gün esneğim" },
  flexHint: { en: "We pick the quietest day near your date — 8% off.", tr: "Tarihinize yakın en sakin günü seçeriz — %8 indirim." },
  dateHint: { en: "Weekends +15% · last three days of a month +10% · Sundays: moves only.", tr: "Hafta sonu +%15 · ayın son üç günü +%10 · Pazar: yalnızca taşınma." },
  name: { en: "Full name", tr: "Ad soyad" },
  phone: { en: "Mobile", tr: "Cep telefonu" },
  email: { en: "Email", tr: "E-posta" },
  fromAddr: { en: "From (district)", tr: "Nereden (ilçe)" },
  toAddr: { en: "To (district)", tr: "Nereye (ilçe)" },
  notes: { en: "Anything we should know?", tr: "Bilmemiz gereken bir şey?" },
  notesPh: { en: "Narrow street, parking permit, a cat that hides…", tr: "Dar sokak, park izni, saklanan bir kedi…" },
  video: { en: "Call me for a 15-minute video survey", tr: "15 dakikalık görüntülü keşif için arayın" },
  back: { en: "Back", tr: "Geri" },
  next: { en: "Next", tr: "İleri" },
  send: { en: "Send me the fixed price", tr: "Sabit fiyatı gönderin" },
  required: { en: "Required", tr: "Zorunlu" },
  badEmail: { en: "Check the email address", tr: "E-posta adresini kontrol edin" },
  fix: { en: "Two fields need a look.", tr: "İki alanı kontrol edin." },
  estimate: { en: "Estimate", tr: "Tahmin" },
  range: { en: "Most moves like this land in this range.", tr: "Bu tür taşınmaların çoğu bu aralıkta kalır." },
  crew: { en: "Crew", tr: "Ekip" },
  truck: { en: "Vehicle", tr: "Araç" },
  time: { en: "On site", tr: "Sahada" },
  volume: { en: "Load", tr: "Yük" },
  people: { en: "{n} people", tr: "{n} kişi" },
  hours: { en: "about {n} h", tr: "yaklaşık {n} sa" },
  m3: { en: "{n} m³", tr: "{n} m³" },
  pickDate: { en: "Pick a date to see day pricing.", tr: "Gün fiyatını görmek için tarih seçin." },
  doneTitle: { en: "Quote request sent", tr: "Teklif talebi gönderildi" },
  doneText: { en: "Reference {ref}. Gökhan will call you before 18:00 on the next working day with a fixed price — usually inside the range you saw.", tr: "Referans {ref}. Gökhan bir sonraki iş günü 18:00’e kadar sizi arayıp sabit fiyatı iletecek — genellikle gördüğünüz aralığın içinde." },
  again: { en: "Start a new quote", tr: "Yeni teklif başlat" },
};

const floors = Array.from({ length: 11 }, (_, i) => i);

export function QuoteCalculator() {
  const { t, locale, input, update, result, step, setStep, reset } = useQuote();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState<string | null>(null);
  const [today, setToday] = React.useState<string | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => setToday(todayIso("Europe/Istanbul")), []);

  const moving = input.kind !== "clean";
  const available = extras.filter((e) => e.for.includes(input.kind));
  const focusPanel = () => requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("h2")?.focus());
  const go = (n: number) => {
    setStep(n);
    focusPanel();
  };
  const canNext = [true, true, true, !!input.day, true][step];
  const floorItems = floors.map((f) => ({ value: String(f), label: f === 0 ? t(c.ground) : String(f) }));
  const longDate = (iso: string) => new Intl.DateTimeFormat(intlOf(locale), { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const next: Record<string, string> = {};
    if (!v("name")) next.name = t(c.required);
    if (v("phone").replace(/\D/g, "").length < 10) next.phone = t(c.required);
    if (v("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) next.email = t(c.badEmail);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setDone(`TF-${(input.day ?? "").slice(2).replace(/-/g, "")}-${input.size.replace("+", "")}${input.kind[0]!.toUpperCase()}`);
    focusPanel();
  };

  const floorBlock = (which: "from" | "to") => (
    <fieldset className="flex flex-col gap-4 rounded-ui-lg border border-line p-4">
      <legend className="px-1 font-mono text-eyebrow uppercase tracking-[0.14em] text-fg-muted">{t(which === "from" ? (moving ? c.from : c.where) : c.to)}</legend>
      <div className="flex flex-wrap items-end gap-6">
        <Field label={t(c.floor)}>
          <NativeSelect name={`${which}Floor`} value={String(which === "from" ? input.fromFloor : input.toFloor)} onChange={(e) => update(which === "from" ? { fromFloor: Number(e.target.value) } : { toFloor: Number(e.target.value) })} items={floorItems} className="w-28" />
        </Field>
        <Switch checked={which === "from" ? input.fromLift : input.toLift} onCheckedChange={(on) => update(which === "from" ? { fromLift: on } : { toLift: on })} label={t(c.lift)} className="pb-2" />
      </div>
    </fieldset>
  );

  return (
    <div className="grid items-start gap-10 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] @5xl:gap-14">
      <div ref={panelRef} className="min-w-0">
        {done ? (
          <div className="flex flex-col items-start gap-6" role="status">
            <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-fg">
              <Check aria-hidden className="size-6" />
            </span>
            <h2 tabIndex={-1} className="font-display text-display-m text-fg outline-none">
              {t(c.doneTitle)}
            </h2>
            <p className="max-w-[56ch] text-lead text-fg-muted">{fill(t(c.doneText), { ref: done })}</p>
            <p className="font-mono text-h3 tabular text-accent-ink">{done}</p>
            <Button
              variant="secondary"
              onClick={() => {
                setDone(null);
                reset();
              }}
            >
              {t(c.again)}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <Stepper aria-label={t(c.steps)} value={step} onValueChange={go} navigable="completed" responsive size="sm" steps={[c.sService, c.sHome, c.sExtras, c.sDate, c.sYou].map((s, i) => ({ id: String(i), title: t(s) }))} />
            <h2 tabIndex={-1} className="font-display text-display-m text-fg outline-none">
              {t([c.qService, c.qHome, c.qExtras, c.qDate, c.qYou][step]!)}
            </h2>

            {step === 0 ? (
              <RadioGroup
                variant="card"
                aria-label={t(c.sService)}
                value={input.kind}
                onValueChange={(v) => update({ kind: v as ServiceKind })}
                className="grid gap-3 @2xl:grid-cols-3"
                items={[
                  { value: "move", label: t(c.move), description: t(c.moveHint), icon: <Truck aria-hidden /> },
                  { value: "clean", label: t(c.clean), description: t(c.cleanHint), icon: <Sparkles aria-hidden /> },
                  { value: "both", label: t(c.both), description: t(c.bothHint), icon: <Package aria-hidden /> },
                ]}
              />
            ) : null}

            {step === 1 ? (
              <div className="flex flex-col gap-6">
                <Field label={t(c.size)}>
                  <RadioGroup variant="segmented" value={input.size} onValueChange={(v) => update({ size: v as HomeSize })} items={sizes.map((s) => ({ value: s.id, label: t(sizeName(s.id)) }))} />
                </Field>
                <div className="grid gap-4 @3xl:grid-cols-2">
                  {floorBlock("from")}
                  {moving ? floorBlock("to") : null}
                </div>
                {moving ? (
                  <Field label={`${t(c.km)} · ${num(input.km, locale)} km`} hint={t(c.kmHint)}>
                    <Slider value={[input.km]} onValueChange={(v) => update({ km: v[0] ?? 10 })} min={1} max={80} step={1} marks={[{ value: 1, label: "1" }, { value: 20, label: "20" }, { value: 40, label: "40" }, { value: 60, label: "60" }, { value: 80, label: "80 km" }]} formatValue={(n) => `${n} km`} />
                  </Field>
                ) : null}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="flex flex-col gap-6">
                <ul className="grid gap-3 @2xl:grid-cols-2">
                  {available.map((e) => (
                    <li key={e.id}>
                      <Checkbox
                        variant="card"
                        checked={input.extras.includes(e.id)}
                        onCheckedChange={(on) => update({ extras: on === true ? [...input.extras, e.id] : input.extras.filter((x) => x !== e.id) })}
                        label={t(e.name)}
                        description={t(e.hint)}
                      />
                    </li>
                  ))}
                </ul>
                {input.extras.includes("storage" as ExtraId) && moving ? (
                  <Field label={`${t(c.weeks)} · ${input.storageWeeks}`}>
                    <Slider value={[input.storageWeeks]} onValueChange={(v) => update({ storageWeeks: v[0] ?? 1 })} min={1} max={12} step={1} marks={[1, 4, 8, 12]} />
                  </Field>
                ) : null}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-8 @3xl:grid-cols-[auto_minmax(0,1fr)]">
                {today ? (
                  <Calendar
                    value={input.day}
                    onValueChange={(d) => update({ day: d })}
                    min={addIsoDays(today, 3)}
                    max={addIsoDays(today, 90)}
                    disabledDays={input.kind === "move" ? [] : [{ dayOfWeek: [0] }]}
                    required
                    className="self-start"
                  />
                ) : null}
                <div className="flex flex-col gap-5">
                  <p className="text-small text-fg-muted">{t(c.dateHint)}</p>
                  {input.day ? (
                    <p className="font-display text-h3 text-fg" aria-live="polite">
                      {longDate(input.day)}
                      {dayRate(input.day).weekend || dayRate(input.day).monthEnd ? <span className="ms-2 align-middle text-small text-warning">●</span> : null}
                    </p>
                  ) : null}
                  <Switch checked={input.flexible} onCheckedChange={(on) => update({ flexible: on })} label={t(c.flex)} description={t(c.flexHint)} />
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <form ref={formRef} id="tf-form" noValidate onSubmit={submit} className="grid gap-5 @2xl:grid-cols-2">
                {Object.keys(errors).length ? (
                  <Alert tone="danger" className="@2xl:col-span-2">
                    {t(c.fix)}
                  </Alert>
                ) : null}
                <Field label={t(c.name)} required error={errors.name}>
                  <Input name="name" autoComplete="name" />
                </Field>
                <Field label={t(c.phone)} required error={errors.phone}>
                  <PhoneInput name="phone" defaultCountry="TR" />
                </Field>
                <Field label={t(c.email)} optional error={errors.email}>
                  <Input name="email" type="email" autoComplete="email" placeholder="name@example.com" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t(c.fromAddr)} optional>
                    <Input name="fromDistrict" placeholder="Kadıköy" />
                  </Field>
                  {moving ? (
                    <Field label={t(c.toAddr)} optional>
                      <Input name="toDistrict" placeholder="Ümraniye" />
                    </Field>
                  ) : null}
                </div>
                <Field label={t(c.notes)} optional className="@2xl:col-span-2">
                  <Textarea name="notes" rows={3} placeholder={t(c.notesPh)} />
                </Field>
                <Checkbox name="video" defaultChecked label={t(c.video)} className="@2xl:col-span-2" />
              </form>
            ) : null}

            <MobileEstimate />

            <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
              <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>
                <ArrowLeft aria-hidden className="rtl:rotate-180" />
                {t(c.back)}
              </Button>
              {step < 4 ? (
                <Button variant="primary" size="lg" disabled={!canNext} onClick={() => go(step + 1)}>
                  {t(c.next)}
                  <ArrowRight aria-hidden className="rtl:rotate-180" />
                </Button>
              ) : (
                <Button variant="primary" size="lg" type="submit" form="tf-form">
                  {t(c.send)}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      <EstimatePanel />
    </div>
  );

  function MobileEstimate() {
    return (
      <p className="flex items-baseline justify-between gap-3 rounded-ui bg-accent-soft px-4 py-3 text-small text-accent-ink @5xl:hidden" aria-hidden>
        <span>{t(c.estimate)}</span>
        <span className="font-mono font-semibold tabular">
          {tl(result.low, locale)} – {tl(result.high, locale)}
        </span>
      </p>
    );
  }
}

/** Live estimate: a range, a spec sheet (crew, vehicle, time, load) and the line items. */
export function EstimatePanel() {
  const { t, locale, input, result } = useQuote();
  const moving = input.kind !== "clean";
  const spec: [string, string][] = [
    [t(c.crew), fill(t(c.people), { n: result.crew })],
    [t(c.time), fill(t(c.hours), { n: num(Math.ceil(result.hours * 2) / 2, locale, 1) })],
    ...(moving && result.truck ? ([[t(c.truck), t(result.truck)], [t(c.volume), fill(t(c.m3), { n: result.volume })]] as [string, string][]) : []),
  ];
  return (
    <aside aria-labelledby="tf-estimate" className="surface relative flex flex-col gap-6 overflow-hidden rounded-ui-lg p-6 @5xl:sticky @5xl:top-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_45%)]" />
      <div className="relative flex flex-col gap-2">
        <h2 id="tf-estimate" className="font-mono text-eyebrow uppercase tracking-[0.16em] text-accent-ink">
          {t(c.estimate)} · {t(sizeName(input.size))}
        </h2>
        <p className="font-display text-[2rem] leading-tight tabular text-fg" aria-live="polite" data-testid="tf-range">
          {tl(result.low, locale)}
          <span className="text-fg-subtle"> – </span>
          {tl(result.high, locale)}
        </p>
        <p className="text-xs text-fg-muted">{t(c.range)}</p>
      </div>
      <dl className="relative grid grid-cols-2 gap-px overflow-hidden rounded-ui border border-line bg-line">
        {spec.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 bg-surface p-3">
            <dt className="text-xs text-fg-muted">{k}</dt>
            <dd className="font-mono text-small tabular text-fg">{v}</dd>
          </div>
        ))}
      </dl>
      <ul className="relative flex flex-col text-small">
        {[...result.lines, ...result.modifiers].map((l) => (
          <li key={l.id} className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-b-0">
            <span className="text-fg-muted">{t(l.label)}</span>
            <span className={l.amount < 0 ? "font-mono tabular text-success" : "font-mono tabular text-fg"}>{l.amount < 0 ? `−${tl(-l.amount, locale)}` : tl(l.amount, locale)}</span>
          </li>
        ))}
      </ul>
      {!input.day ? <p className="relative text-xs text-fg-muted">{t(c.pickDate)}</p> : null}
    </aside>
  );
}
