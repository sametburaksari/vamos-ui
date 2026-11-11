"use client";

import * as React from "react";
import { addIsoDays, Alert, Button, Calendar, Checkbox, Field, Input, RadioGroup, Select, Textarea } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { Check } from "lucide-react";
import { bouquetById, bouquets, cardIdeas, cardStyles, CUTOFF, districts, FREE_FROM, intlOf, liraOf, pick, SIZE_NAME, SIZE_STEMS, slots, type L, type SiteLocale, type Size, type SlotId } from "./content";
import { istanbulNow, toMinutes, useOrder } from "./order-provider";

const MAX = 240;

const c = {
  s1: { en: "The flowers", tr: "Çiçekler" },
  s2: { en: "Delivery", tr: "Teslimat" },
  s3: { en: "The card", tr: "Kart" },
  s4: { en: "Who it’s for, who it’s from", tr: "Kime, kimden" },
  bouquet: { en: "Bouquet", tr: "Buket" },
  size: { en: "Size", tr: "Boyut" },
  district: { en: "District", tr: "İlçe" },
  districtHint: { en: "Asian side: same day if you order by 14:00. European side: from tomorrow.", tr: "Anadolu yakası: 14:00’e kadar siparişte aynı gün. Avrupa yakası: yarından itibaren." },
  pickDistrict: { en: "Choose a district", tr: "İlçe seçin" },
  date: { en: "Delivery date", tr: "Teslimat tarihi" },
  dateHint: { en: "We don’t deliver on Sundays.", tr: "Pazar günleri teslimat yapmıyoruz." },
  slot: { en: "Time window", tr: "Saat aralığı" },
  slotGone: { en: "Too late for today", tr: "Bugün için geç" },
  sameDayFrom: { en: "Order by {time}", tr: "{time}’e kadar" },
  style: { en: "Card", tr: "Kart" },
  message: { en: "Your message", tr: "Mesajınız" },
  messageHint: { en: "We write it by hand, so short is lovely. Line breaks are kept.", tr: "Elle yazıyoruz; kısa olması güzel. Satır sonları korunur." },
  ideas: { en: "Need a start?", tr: "Başlangıç mı lazım?" },
  from: { en: "Sign it as", tr: "İmza" },
  anonymous: { en: "Send anonymously — we won’t tell them, even if they call", tr: "İsimsiz gönder — arasalar bile söylemeyiz" },
  rName: { en: "Recipient’s name", tr: "Alıcının adı" },
  rPhone: { en: "Recipient’s phone", tr: "Alıcının telefonu" },
  rPhoneHint: { en: "Only used if the courier can’t find the door.", tr: "Yalnızca kurye kapıyı bulamazsa kullanılır." },
  rAddress: { en: "Delivery address", tr: "Teslimat adresi" },
  rAddressHint: { en: "Street, number, flat, and anything that helps: door code, “blue door next to the bakery”.", tr: "Sokak, numara, daire ve yardımcı olacak her şey: kapı kodu, “fırının yanındaki mavi kapı”." },
  email: { en: "Your email", tr: "E-postanız" },
  emailHint: { en: "For the receipt and a photo of the bouquet before it leaves.", tr: "Fiş ve buket yola çıkmadan önceki fotoğrafı için." },
  envelope: { en: "On the envelope", tr: "Zarfın üzerinde" },
  deliver: { en: "Deliver {date}, {from}–{to}", tr: "{date}, {from}–{to} arası teslim" },
  noDate: { en: "Choose a day and a time window", tr: "Bir gün ve saat aralığı seçin" },
  noCard: { en: "No card — the flowers go on their own.", tr: "Kart yok — çiçekler yalnız gidiyor." },
  placeholderMsg: { en: "Your words appear here, in our handwriting.", tr: "Sözleriniz burada, bizim el yazımızla görünecek." },
  anonSign: { en: "— someone who thinks of you", tr: "— seni düşünen biri" },
  summary: { en: "Your order", tr: "Siparişiniz" },
  delivery: { en: "Delivery", tr: "Teslimat" },
  free: { en: "Free", tr: "Ücretsiz" },
  freeNote: { en: "Free delivery on the Asian side from {amount}.", tr: "Anadolu yakasında {amount} üzeri teslimat ücretsiz." },
  total: { en: "Total", tr: "Toplam" },
  place: { en: "Place order · {total}", tr: "Siparişi ver · {total}" },
  payNote: { en: "You pay on the next screen by card. Nothing is charged until we confirm the flowers.", tr: "Ödemeyi bir sonraki ekranda kartla yaparsınız. Çiçekleri onaylayana kadar çekim yapılmaz." },
  required: { en: "Please fill this in.", tr: "Lütfen doldurun." },
  needMessage: { en: "Write a message, or choose “No card”.", tr: "Bir mesaj yazın ya da “Kart yok”u seçin." },
  badPhone: { en: "Enter a phone number with at least 10 digits.", tr: "En az 10 haneli bir telefon numarası girin." },
  badEmail: { en: "Enter an email like name@example.com.", tr: "ad@example.com gibi bir e-posta girin." },
  fix: { en: "A few things need a look before we can tie this one.", tr: "Bunu bağlayabilmemiz için birkaç şeye bakmak gerekiyor." },
  doneTitle: { en: "It’s on the list for {date}", tr: "{date} listesinde" },
  doneText: { en: "Order {ref}. {name} gets {bouquet} between {from} and {to}. We’ll email you a photo before it leaves the shop.", tr: "Sipariş {ref}. {name}, {bouquet} buketini {from}–{to} arası alacak. Dükkândan çıkmadan önce size fotoğrafını e-postayla göndereceğiz." },
  another: { en: "Send another bouquet", tr: "Başka bir buket gönder" },
  browse: { en: "Back to the bouquets", tr: "Buketlere dön" },
} satisfies Record<string, L>;

const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? "");
const isSunday = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay() === 0;
const nextOpen = (iso: string) => {
  let d = addIsoDays(iso, 1);
  while (isSunday(d)) d = addIsoDays(d, 1);
  return d;
};

/**
 * The order page. Signature: delivery date + card message. The calendar's earliest day and the
 * time windows follow the district and the 14:00 cut-off (Istanbul time), Sundays are closed,
 * and the card is previewed as it will be written, with the envelope line beside it.
 */
export function OrderForm({ locale }: { locale: SiteLocale }) {
  const t = (v: L) => pick(v, locale);
  const lira = liraOf(locale);
  const intl = intlOf(locale);
  const { bouquet, setBouquet, size, setSize } = useOrder();
  const [district, setDistrict] = React.useState<string | null>(null);
  const [day, setDay] = React.useState<string | null>(null);
  const [slot, setSlot] = React.useState<SlotId | null>(null);
  const [style, setStyle] = React.useState<(typeof cardStyles)[number]["id"]>("plain");
  const [message, setMessage] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [anon, setAnon] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState<{ ref: string; name: string } | null>(null);
  const [clock, setClock] = React.useState<ReturnType<typeof istanbulNow> | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const topRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const tick = () => setClock(istanbulNow());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const b = bouquetById(bouquet);
  const d = districts.find((x) => x.id === district);
  const today = clock?.day ?? null;
  const sameDayOk = !!clock && !clock.sunday && clock.minutes < toMinutes(CUTOFF) && (d ? d.side === "asia" : true);
  const earliest = today ? (sameDayOk ? today : nextOpen(today)) : undefined;
  const max = today ? addIsoDays(today, 60) : undefined;
  const slotOpen = (id: SlotId) => {
    if (!day || !clock || day !== today) return true;
    const s = slots.find((x) => x.id === id)!;
    return !!s.sameDayUntil && clock.minutes < toMinutes(s.sameDayUntil);
  };

  // Keep the chosen day and window valid when the district or the clock changes.
  React.useEffect(() => {
    if (day && earliest && day < earliest) setDay(null);
  }, [day, earliest]);
  React.useEffect(() => {
    if (slot && !slotOpen(slot)) setSlot(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, clock]);

  const price = b ? b.prices[size] : 0;
  const cardPrice = cardStyles.find((x) => x.id === style)!.price;
  const subtotal = price + cardPrice;
  const fee = d ? (d.side === "asia" && subtotal >= FREE_FROM ? 0 : d.fee) : 0;
  const total = subtotal + fee;
  const chosenSlot = slots.find((s) => s.id === slot);
  const longDay = (iso: string) => new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
  const envelope = day && chosenSlot ? fill(t(c.deliver), { date: longDay(day), from: chosenSlot.from, to: chosenSlot.to }) : t(c.noDate);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const next: Record<string, string> = {};
    if (!b) next.bouquet = t(c.required);
    if (!district) next.district = t(c.required);
    if (!day) next.day = t(c.required);
    if (!slot) next.slot = t(c.required);
    if (style !== "none" && !message.trim()) next.message = t(c.needMessage);
    if (!v("rname")) next.rname = t(c.required);
    if (v("rphone").replace(/\D/g, "").length < 10) next.rphone = t(c.badPhone);
    if (!v("raddress")) next.raddress = t(c.required);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) next.email = t(c.badEmail);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"] :is(input, textarea, button, [tabindex="0"])`)?.focus());
      return;
    }
    setDone({ ref: `PS-${day!.slice(5).replace("-", "")}-${String(total).slice(-3)}`, name: v("rname") });
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ block: "start" });
      topRef.current?.querySelector<HTMLElement>("h2")?.focus();
    });
  };

  if (done && day && chosenSlot && b) {
    return (
      <div ref={topRef} className="mx-auto max-w-2xl py-10 text-center" role="status">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-accent text-accent-fg">
          <Check aria-hidden className="size-6" />
        </span>
        <h2 tabIndex={-1} className="m-0 mt-6 font-display text-display-m text-fg outline-none">
          {fill(t(c.doneTitle), { date: longDay(day) })}
        </h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-fg-muted">{fill(t(c.doneText), { ref: done.ref, name: done.name, bouquet: t(b.name), from: chosenSlot.from, to: chosenSlot.to })}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="primary" className="rounded-full" onClick={() => { setDone(null); setMessage(""); setDay(null); setSlot(null); }}>
            {t(c.another)}
          </Button>
          <Button asChild variant="ghost" className="rounded-full">
            <a href={sitePageHref("bouquets")}>{t(c.browse)}</a>
          </Button>
        </div>
      </div>
    );
  }

  const sectionTitle = (n: string, label: L) => (
    <h2 className="m-0 flex items-baseline gap-4 border-t border-fg pt-4 font-display text-display-m text-fg">
      <span className="font-mono text-sm text-accent-ink tabular">{n}</span>
      {t(label)}
    </h2>
  );

  return (
    <div ref={topRef} className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
      <form ref={formRef} id="ps-order" onSubmit={submit} noValidate className="grid min-w-0 gap-14">
        {Object.keys(errors).length ? <Alert tone="danger" live="polite">{t(c.fix)}</Alert> : null}

        {/* 01 · Flowers */}
        <section className="grid gap-6" aria-labelledby="ps-s1">
          <div id="ps-s1">{sectionTitle("01", c.s1)}</div>
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div data-field="bouquet">
              <Field label={t(c.bouquet)} error={errors.bouquet}>
                <Select value={bouquet} onValueChange={(v) => setBouquet(v)} items={bouquets.map((x) => ({ value: x.id, label: `${t(x.name)} · ${lira(x.prices[size])}` }))} />
              </Field>
            </div>
            <Field label={t(c.size)}>
              <RadioGroup variant="segmented" value={size} onValueChange={(v) => setSize(v as Size)} items={(["s", "m", "l"] as const).map((s) => ({ value: s, label: t(SIZE_NAME[s]) }))} />
            </Field>
          </div>
          {b ? <p className="m-0 -mt-2 font-mono text-xs text-fg-muted">{t(SIZE_STEMS[size])} — {t(b.stems)}</p> : null}
        </section>

        {/* 02 · Delivery */}
        <section className="grid gap-6" aria-labelledby="ps-s2">
          <div id="ps-s2">{sectionTitle("02", c.s2)}</div>
          <div data-field="district">
            <Field label={t(c.district)} hint={t(c.districtHint)} error={errors.district}>
              <Select
                value={district}
                onValueChange={setDistrict}
                placeholder={t(c.pickDistrict)}
                items={districts.map((x) => ({ value: x.id, label: `${x.name} · ${x.fee === 0 ? t(c.free) : lira(x.fee)}`, group: x.side === "asia" ? t({ en: "Asian side", tr: "Anadolu yakası" }) : t({ en: "European side", tr: "Avrupa yakası" }) }))}
              />
            </Field>
          </div>
          <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:gap-8">
            <div data-field="day">
              <Field label={t(c.date)} hint={t(c.dateHint)} error={errors.day}>
                <Calendar variant="card" value={day} onValueChange={setDay} min={earliest} max={max} disabledDays={{ dayOfWeek: [0] }} required aria-label={t(c.date)} />
              </Field>
            </div>
            <div data-field="slot">
              <Field label={t(c.slot)} error={errors.slot}>
                <RadioGroup
                  variant="card"
                  value={slot}
                  onValueChange={(v) => setSlot(v as SlotId)}
                  items={slots.map((s) => ({
                    value: s.id,
                    label: `${t(s.label)} · ${s.from}–${s.to}`,
                    description: !slotOpen(s.id) ? t(c.slotGone) : s.sameDayUntil ? fill(t(c.sameDayFrom), { time: s.sameDayUntil }) + t({ en: " for same day", tr: " aynı gün için" }) : t({ en: "From tomorrow", tr: "Yarından itibaren" }),
                    disabled: !slotOpen(s.id),
                  }))}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* 03 · Card */}
        <section className="grid gap-6" aria-labelledby="ps-s3">
          <div id="ps-s3">{sectionTitle("03", c.s3)}</div>
          <Field label={t(c.style)}>
            <RadioGroup variant="card" orientation="horizontal" value={style} onValueChange={(v) => setStyle(v as typeof style)} items={cardStyles.map((s) => ({ value: s.id, label: s.price ? `${t(s.name)} · +${lira(s.price)}` : t(s.name), description: t(s.detail) }))} className="sm:grid-cols-3" />
          </Field>
          {style !== "none" ? (
            <>
              <div data-field="message">
                <Field label={t(c.message)} hint={`${t(c.messageHint)} ${message.length}/${MAX}`} error={errors.message}>
                  <Textarea rows={4} maxLength={MAX} value={message} onChange={(e) => setMessage(e.target.value)} />
                </Field>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-small text-fg-muted">{t(c.ideas)}</span>
                  {cardIdeas.map((idea) => (
                    <button key={t(idea)} type="button" onClick={() => setMessage(t(idea))} className="rounded-full border border-line px-3 py-1 text-small text-fg transition-colors hover:border-accent-ink hover:text-accent-ink focus-ring">
                      {t(idea).split(/[—.]/)[0]!.trim()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
                <Field label={t(c.from)} disabled={anon}>
                  <Input value={anon ? "" : from} onChange={(e) => setFrom(e.target.value)} placeholder={locale === "tr" ? "Sevgiyle, Zeynep" : "Love, Zeynep"} />
                </Field>
                <Checkbox label={t(c.anonymous)} checked={anon} onCheckedChange={(v) => setAnon(v === true)} />
              </div>
            </>
          ) : null}
        </section>

        {/* 04 · People */}
        <section className="grid gap-5" aria-labelledby="ps-s4">
          <div id="ps-s4">{sectionTitle("04", c.s4)}</div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div data-field="rname">
              <Field label={t(c.rName)} error={errors.rname} required>
                <Input name="rname" autoComplete="off" />
              </Field>
            </div>
            <div data-field="rphone">
              <Field label={t(c.rPhone)} hint={t(c.rPhoneHint)} error={errors.rphone} required>
                <Input name="rphone" type="tel" inputMode="tel" placeholder="+90 216 000 00 00" />
              </Field>
            </div>
          </div>
          <div data-field="raddress">
            <Field label={t(c.rAddress)} hint={t(c.rAddressHint)} error={errors.raddress} required>
              <Textarea name="raddress" rows={3} />
            </Field>
          </div>
          <div data-field="email">
            <Field label={t(c.email)} hint={t(c.emailHint)} error={errors.email} required>
              <Input name="email" type="email" autoComplete="email" />
            </Field>
          </div>
        </section>
      </form>

      {/* Preview + summary -------------------------------------------------- */}
      <aside aria-label={t(c.summary)} className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative px-2 pt-6 pb-4">
          <p className="m-0 font-mono text-[11px] tracking-[0.14em] text-fg-muted uppercase">{t(c.envelope)}</p>
          <p className="m-0 mt-1 text-fg" aria-live="polite">{envelope}</p>
          <div className={`relative mt-6 aspect-[7/5] rotate-[-2deg] rounded-ui-sm border border-line p-6 shadow-[0_24px_48px_-28px_color-mix(in_srgb,var(--fg)_55%,transparent)] transition-transform motion-reduce:rotate-0 ${style === "letterpress" ? "bg-accent-soft" : "bg-surface"} ${style === "none" ? "opacity-60" : ""}`}>
            {style === "letterpress" ? <span aria-hidden className="absolute inset-2 rounded-ui-sm border border-accent-ink/40" /> : null}
            <span className="absolute end-5 top-4 font-mono text-[10px] tracking-[0.18em] text-accent-ink uppercase">Petal &amp; Stem</span>
            {style === "none" ? (
              <p className="m-0 grid h-full place-items-center text-center text-small text-fg-muted">{t(c.noCard)}</p>
            ) : (
              <div className="flex h-full flex-col justify-center">
                <p className={`m-0 font-display text-xl leading-snug break-words whitespace-pre-line sm:text-2xl ${message ? "text-fg" : "text-fg-subtle italic"}`}>{message || t(c.placeholderMsg)}</p>
                <p className="m-0 mt-3 font-display text-fg-muted italic">{anon ? t(c.anonSign) : from ? `— ${from}` : ""}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-ui border border-line bg-surface p-5">
          <h2 className="m-0 font-display text-h3 text-fg">{t(c.summary)}</h2>
          <dl className="m-0 mt-4 grid gap-2 text-small">
            <div className="flex justify-between gap-4">
              <dt className="text-fg-muted">{b ? `${t(b.name)} · ${t(SIZE_NAME[size])}` : t(c.bouquet)}</dt>
              <dd className="m-0 font-mono text-fg tabular">{lira(price)}</dd>
            </div>
            {cardPrice ? (
              <div className="flex justify-between gap-4">
                <dt className="text-fg-muted">{t(cardStyles[1]!.name)}</dt>
                <dd className="m-0 font-mono text-fg tabular">{lira(cardPrice)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-fg-muted">{t(c.delivery)}{d ? ` · ${d.name}` : ""}</dt>
              <dd className="m-0 font-mono text-fg tabular">{!d ? "—" : fee === 0 ? t(c.free) : lira(fee)}</dd>
            </div>
            <div className="mt-2 flex justify-between gap-4 border-t border-line pt-3 text-base">
              <dt className="font-medium text-fg">{t(c.total)}</dt>
              <dd className="m-0 font-mono font-medium text-fg tabular">{lira(total)}</dd>
            </div>
          </dl>
          {d && d.side === "asia" && fee > 0 ? <p className="m-0 mt-3 text-xs text-fg-muted">{fill(t(c.freeNote), { amount: lira(FREE_FROM) })}</p> : null}
          <Button type="submit" form="ps-order" variant="primary" size="lg" className="mt-5 w-full rounded-full">
            {fill(t(c.place), { total: lira(total) })}
          </Button>
          <p className="m-0 mt-3 text-xs text-fg-muted">{t(c.payNote)}</p>
        </div>
      </aside>
    </div>
  );
}
