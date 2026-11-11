"use client";

import * as React from "react";
import { Alert, Button, Checkbox, CheckboxGroup, DatePicker, Field, Input, RadioGroup, Select, Textarea, todayIso, addIsoDays } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { Check } from "lucide-react";
import { layouts, liraOf, numberOf, pick, spaces, type L, type LayoutId, type SiteLocale, type SpaceId } from "./content";
import { useVenue } from "./venue-provider";

const c = {
  what: { en: "What are you planning?", tr: "Ne planlıyorsunuz?" },
  types: {
    wedding: { en: "Wedding", tr: "Düğün" },
    company: { en: "Company event", tr: "Şirket etkinliği" },
    launch: { en: "Launch or party", tr: "Lansman ya da parti" },
    conference: { en: "Conference", tr: "Konferans" },
    other: { en: "Something else", tr: "Başka bir şey" },
  },
  date: { en: "Preferred date", tr: "Tercih edilen tarih" },
  flexible: { en: "We’re flexible by a week or two", tr: "Bir iki hafta esneyebiliriz" },
  guests: { en: "Guests", tr: "Misafir" },
  layout: { en: "Layout", tr: "Düzen" },
  spaces: { en: "Spaces", tr: "Alanlar" },
  spacesHint: { en: "Capacity shown for the layout you chose. Not sure? Leave it to us.", tr: "Kapasite seçtiğiniz düzene göre. Emin değil misiniz? Bize bırakın." },
  tooSmall: { en: "{n} guests won’t fit {layout} in what you picked (up to {cap}). Add a space or change the layout.", tr: "Seçtikleriniz {layout} {n} misafir almıyor (en fazla {cap}). Bir alan ekleyin ya da düzeni değiştirin." },
  catering: { en: "Catering", tr: "Yemek" },
  kiln: { en: "Kiln Kitchen, our in-house partner", tr: "Kurum içi ortağımız Kiln Kitchen" },
  kilnHint: { en: "Menus from ₺1,850 a head; tasting included for weddings.", tr: "Kişi başı ₺1.850’den başlayan menüler; düğünlerde tadım dahil." },
  own: { en: "Our own caterer", tr: "Kendi yemek firmamız" },
  ownHint: { en: "₺15,000 kitchen fee.", tr: "₺15.000 mutfak ücreti." },
  budget: { en: "Total budget", tr: "Toplam bütçe" },
  budgets: ["< 250k", "250k–500k", "500k–1M", "1M+"],
  name: { en: "Your name", tr: "Adınız" },
  email: { en: "Email", tr: "E-posta" },
  phone: { en: "Phone", tr: "Telefon" },
  company: { en: "Company", tr: "Şirket" },
  message: { en: "Tell us about it", tr: "Biraz anlatın" },
  messageHint: { en: "The rough shape of the day, anything you’ve already booked, and what worries you.", tr: "Günün kabaca akışı, önceden ayarladıklarınız ve sizi endişelendiren şeyler." },
  send: { en: "Send enquiry", tr: "Talebi gönder" },
  required: { en: "Please fill this in.", tr: "Lütfen doldurun." },
  badEmail: { en: "Enter an email like name@example.com.", tr: "ad@example.com gibi bir e-posta girin." },
  fix: { en: "A few fields need a look.", tr: "Birkaç alana bakmak gerekiyor." },
  estimate: { en: "Hire estimate", tr: "Kira tahmini" },
  weekend: { en: "Fri–Sun rate", tr: "Cuma–Pazar fiyatı" },
  weekday: { en: "Mon–Thu rate", tr: "Pazartesi–Perşembe fiyatı" },
  pickDate: { en: "Pick a date for the right rate", tr: "Doğru fiyat için tarih seçin" },
  noSpaces: { en: "No spaces picked yet", tr: "Henüz alan seçilmedi" },
  kitchen: { en: "Kitchen fee", tr: "Mutfak ücreti" },
  total: { en: "Hire, excl. VAT", tr: "Kira, KDV hariç" },
  hold: { en: "We hold the date for seven days, free. A 30% deposit confirms it.", tr: "Tarihi yedi gün ücretsiz tutuyoruz. %30 kapora ile kesinleşir." },
  doneTitle: { en: "Thank you — {date} is on hold", tr: "Teşekkürler — {date} sizin için ayrıldı" },
  doneTitleNoDate: { en: "Thank you — we’ve got it", tr: "Teşekkürler — talebiniz bize ulaştı" },
  doneText: { en: "Reference {ref}. Selin Aydemir, our venue manager, will call within one working day with availability and a proposal.", tr: "Referans {ref}. Mekân sorumlumuz Selin Aydemir bir iş günü içinde uygunluk ve teklifle arayacak." },
  viewing: { en: "Book a viewing too", tr: "Bir de gezi ayarlayın" },
  again: { en: "Send another enquiry", tr: "Başka bir talep gönder" },
} as const;

const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? "");
const isWeekend = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return d === 0 || d === 5 || d === 6;
};

/** Enquiry: event, date, guests and layout (shared with the finder), spaces, catering, contact; a live hire estimate. */
export function EnquiryForm({ locale }: { locale: SiteLocale }) {
  const t = (v: L) => pick(v, locale);
  const lira = liraOf(locale);
  const num = numberOf(locale);
  const { layout, setLayout, guests, setGuests, picked, setPicked } = useVenue();
  const [type, setType] = React.useState<keyof typeof c.types>("wedding");
  const [date, setDate] = React.useState<string | null>(null);
  const [flexible, setFlexible] = React.useState(false);
  const [catering, setCatering] = React.useState("kiln");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState<string | null>(null);
  const [guestsDraft, setGuestsDraft] = React.useState(String(guests));
  React.useEffect(() => setGuestsDraft(String(guests)), [guests]);
  const today = React.useMemo(() => todayIso("Europe/Istanbul"), []);
  const formRef = React.useRef<HTMLFormElement>(null);
  const topRef = React.useRef<HTMLDivElement>(null);

  const chosen = spaces.filter((s) => picked.includes(s.id));
  const capTotal = chosen.reduce((n, s) => n + (s.caps[layout] ?? 0), 0);
  const weekend = date ? isWeekend(date) : null;
  const hire = chosen.reduce((n, s) => n + (weekend === false ? s.weekday : s.weekend), 0);
  const kitchen = catering === "own" ? 15000 : 0;
  const layoutName = layouts.find((l) => l.id === layout)!;
  const tooSmall = chosen.length > 0 && capTotal < guests;
  const longDate = (iso: string) => new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const next: Record<string, string> = {};
    if (!date) next.date = t(c.required);
    if (!v("name")) next.name = t(c.required);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) next.email = t(c.badEmail);
    if (v("phone").replace(/\D/g, "").length < 10) next.phone = t(c.required);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"] input`)?.focus());
      return;
    }
    setDone(`OMH-${date!.replace(/-/g, "").slice(2)}-${String(guests).padStart(3, "0")}`);
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ block: "start" });
      topRef.current?.querySelector<HTMLElement>("h2")?.focus();
    });
  };

  if (done) {
    return (
      <div ref={topRef} role="status" className="max-w-2xl border-t-2 border-fg py-10">
        <span className="grid size-11 place-items-center bg-accent text-accent-fg">
          <Check aria-hidden className="size-5" />
        </span>
        <h2 tabIndex={-1} className="m-0 mt-6 font-display text-display-m text-fg outline-none">
          {date ? fill(t(c.doneTitle), { date: longDate(date) }) : t(c.doneTitleNoDate)}
        </h2>
        <p className="m-0 mt-4 max-w-[54ch] text-fg-muted">{fill(t(c.doneText), { ref: done })}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="primary" className="rounded-none">
            <a href={sitePageHref("home", "visit")}>{t(c.viewing)}</a>
          </Button>
          <Button variant="ghost" className="rounded-none" onClick={() => setDone(null)}>
            {t(c.again)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-16">
      <form ref={formRef} id="om-enquiry" onSubmit={submit} noValidate className="grid min-w-0 gap-8">
        {Object.keys(errors).length ? <Alert tone="danger" live="polite">{t(c.fix)}</Alert> : null}
        <Field label={t(c.what)}>
          <RadioGroup
            variant="card"
            orientation="horizontal"
            value={type}
            onValueChange={(v) => setType(v as keyof typeof c.types)}
            items={(Object.keys(c.types) as (keyof typeof c.types)[]).map((k) => ({ value: k, label: t(c.types[k]) }))}
            className="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-start">
          <div data-field="date">
            <Field label={t(c.date)} error={errors.date} required>
              <DatePicker value={date} onValueChange={setDate} min={addIsoDays(today, 14)} />
            </Field>
            <Checkbox className="mt-3" size="sm" label={t(c.flexible)} checked={flexible} onCheckedChange={(v) => setFlexible(v === true)} />
          </div>
          <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4">
            <Field label={t(c.guests)}>
              <Input
                inputMode="numeric"
                value={guestsDraft}
                onChange={(e) => setGuestsDraft(e.target.value)}
                onBlur={() => {
                  const n = Number(guestsDraft.replace(/\D/g, ""));
                  if (n > 0) setGuests(Math.min(700, n));
                  else setGuestsDraft(String(guests));
                }}
                className="font-mono tabular"
              />
            </Field>
            <Field label={t(c.layout)}>
              <Select value={layout} onValueChange={(v) => v && setLayout(v as LayoutId)} items={layouts.map((l) => ({ value: l.id, label: t(l.name) }))} />
            </Field>
          </div>
        </div>

        <Field label={t(c.spaces)} hint={t(c.spacesHint)}>
          <CheckboxGroup
            variant="card"
            value={picked}
            onValueChange={(v) => setPicked(v as SpaceId[])}
            items={spaces.map((s) => {
              const cap = s.caps[layout];
              return {
                value: s.id,
                label: t(s.name),
                description: cap === null ? `${t(s.floor)} · —` : `${t(s.floor)} · ${t({ en: "up to", tr: "en fazla" })} ${num(cap)}`,
              };
            })}
          />
        </Field>
        {tooSmall ? (
          <Alert tone="warning" live="polite">
            {fill(t(c.tooSmall), { n: num(guests), layout: t(layoutName.name).toLowerCase(), cap: num(capTotal) })}
          </Alert>
        ) : null}

        <Field label={t(c.catering)}>
          <RadioGroup
            variant="card"
            orientation="horizontal"
            value={catering}
            onValueChange={(v) => setCatering(v)}
            items={[
              { value: "kiln", label: t(c.kiln), description: t(c.kilnHint) },
              { value: "own", label: t(c.own), description: t(c.ownHint) },
            ]}
            className="sm:grid-cols-2"
          />
        </Field>

        <Field label={t(c.budget)} optional>
          <RadioGroup variant="segmented" defaultValue={null} name="budget" items={c.budgets.map((b) => ({ value: b, label: `₺${b}` }))} />
        </Field>

        <div className="grid gap-5 border-t border-line pt-8 sm:grid-cols-2">
          <div data-field="name">
            <Field label={t(c.name)} error={errors.name} required>
              <Input name="name" autoComplete="name" />
            </Field>
          </div>
          <Field label={t(c.company)} optional>
            <Input name="company" autoComplete="organization" />
          </Field>
          <div data-field="email">
            <Field label={t(c.email)} error={errors.email} required>
              <Input name="email" type="email" autoComplete="email" />
            </Field>
          </div>
          <div data-field="phone">
            <Field label={t(c.phone)} error={errors.phone} required>
              <Input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+90 216 000 00 00" />
            </Field>
          </div>
        </div>
        <Field label={t(c.message)} hint={t(c.messageHint)}>
          <Textarea name="message" rows={4} />
        </Field>
      </form>

      <aside aria-label={t(c.estimate)} className="lg:sticky lg:top-24 lg:self-start">
        <div className="border-2 border-fg bg-surface p-5">
          <p className="m-0 font-mono text-[11px] font-medium tracking-[0.14em] text-fg-muted uppercase">{t(c.estimate)}</p>
          <p className="m-0 mt-1 text-small text-fg-muted">{weekend === null ? t(c.pickDate) : weekend ? t(c.weekend) : t(c.weekday)}</p>
          <ul className="m-0 mt-4 grid list-none gap-2 p-0 text-small">
            {chosen.length === 0 ? <li className="text-fg-muted">{t(c.noSpaces)}</li> : null}
            {chosen.map((s) => (
              <li key={s.id} className="flex justify-between gap-4">
                <span className="text-fg">{t(s.name)}</span>
                <span className="font-mono text-fg tabular">{lira(weekend === false ? s.weekday : s.weekend)}</span>
              </li>
            ))}
            {kitchen ? (
              <li className="flex justify-between gap-4">
                <span className="text-fg">{t(c.kitchen)}</span>
                <span className="font-mono text-fg tabular">{lira(kitchen)}</span>
              </li>
            ) : null}
          </ul>
          <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-3">
            <span className="font-medium text-fg">{t(c.total)}</span>
            <span className="font-display text-2xl text-fg tabular" aria-live="polite">
              {hire + kitchen > 0 ? lira(hire + kitchen) : "—"}
            </span>
          </div>
          <p className="m-0 mt-2 font-mono text-xs text-fg-muted">
            {num(guests)} · {t(layoutName.name)}
          </p>
          <Button type="submit" form="om-enquiry" variant="primary" size="lg" className="mt-5 w-full rounded-none">
            {t(c.send)}
          </Button>
          <p className="m-0 mt-3 text-xs text-fg-muted">{t(c.hold)}</p>
        </div>
      </aside>
    </div>
  );
}
