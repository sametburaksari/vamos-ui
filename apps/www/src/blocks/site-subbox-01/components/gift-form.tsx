"use client";

import * as React from "react";
import { Alert, Button, Field, Input, RadioGroup, Select, Switch, Textarea } from "@vamos-ui/react";
import { CircleCheck } from "lucide-react";
import { addDays, copyFor, giftLengths, giftPrice, nextShipDate, sizes, TODAY, type GiftLength, type SiteLocale } from "./content";

const MAX = 180;
type GiftSize = "single" | "double";

/**
 * Gift a subscription: length (3, 6 or 12 boxes, longer is cheaper), size, the first shipping
 * Wednesday, recipient and a card message previewed live as the printed card. Validates on
 * submit and ends with a gift reference.
 */
export function GiftForm({ locale }: { locale: SiteLocale }) {
  const { t, f, tl } = copyFor(locale);
  const ships = Array.from({ length: 6 }, (_, i) => addDays(nextShipDate(TODAY), i * 7));
  const [length, setLength] = React.useState<GiftLength>("6");
  const [size, setSize] = React.useState<GiftSize>("single");
  const [start, setStart] = React.useState<string | null>(ships[0]!);
  const [to, setTo] = React.useState("");
  const [city, setCity] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [surprise, setSurprise] = React.useState(true);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState<string | null>(null);
  const doneRef = React.useRef<HTMLDivElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const total = giftPrice(size, length);
  const months = giftLengths.find((g) => g.id === length)!.months;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (to.trim().length < 2) err.to = t({ en: "Who is it for?", tr: "Kimin için?" });
    if (city.trim().length < 2) err.city = t({ en: "Add the delivery city.", tr: "Teslimat şehrini ekleyin." });
    if (from.trim().length < 2) err.from = t({ en: "Sign the card.", tr: "Kartı imzalayın." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) err.email = t({ en: "We send the receipt here.", tr: "Makbuzu buraya göndeririz." });
    setErrors(err);
    const firstKey = Object.keys(err)[0];
    if (firstKey) {
      formRef.current?.querySelector<HTMLElement>(`[data-field="${firstKey}"] input`)?.focus();
      return;
    }
    setDone(`GIFT-${months}${size === "single" ? "S" : "D"}-${String(1000 + to.length * 97 + from.length * 31).slice(-4)}`);
    requestAnimationFrame(() => doneRef.current?.focus());
  };

  const card = (
    <figure aria-label={t({ en: "Card preview", tr: "Kart önizlemesi" })} className="relative mx-auto w-full max-w-[24rem] -rotate-[1.2deg] rounded-[4px] border border-fg/60 bg-surface-2 p-6 shadow-[0_18px_40px_-24px_var(--fg)] motion-reduce:rotate-0">
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[10px] tracking-[0.12em] text-fg-muted uppercase">Brewcraft Box · {t({ en: "gift", tr: "hediye" })}</span>
        <span aria-hidden className="grid size-12 place-items-center rounded-full border-2 border-dashed border-accent-ink/60 font-mono text-[9px] leading-tight text-accent-ink">
          {months}
          <br />
          {t({ en: "box", tr: "kutu" })}
        </span>
      </div>
      <p className="mt-4 font-display text-[1.55rem] leading-tight text-fg">{to.trim() ? t({ en: `For ${to.trim()},`, tr: `${to.trim()} için,` }) : t({ en: "For someone who deserves good coffee,", tr: "İyi kahveyi hak eden birine," })}</p>
      <blockquote className="mt-3 min-h-[4.5rem] text-small whitespace-pre-line break-words text-fg-muted italic">{message.trim() || t({ en: "Your message appears here, printed on cotton card and tucked into the first box.", tr: "Mesajınız burada görünür; pamuklu karta basılıp ilk kutuya konur." })}</blockquote>
      <figcaption className="mt-4 flex items-end justify-between gap-4 border-t border-dashed border-fg/30 pt-3 text-small">
        <span className="font-display text-lg text-fg">— {from.trim() || t({ en: "you", tr: "siz" })}</span>
        <span className="font-mono text-[10px] text-fg-muted">{start ? f.date(start, { day: "numeric", month: "short", year: "numeric" }) : ""}</span>
      </figcaption>
    </figure>
  );

  if (done) {
    return (
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div ref={doneRef} tabIndex={-1} role="status" className="rounded-ui-lg border border-line bg-surface p-6 focus-ring" data-testid="gift-done">
          <CircleCheck aria-hidden className="size-7 text-success" />
          <h2 className="mt-3 font-display text-[1.8rem] leading-tight text-fg">{t({ en: "The gift is on its way", tr: "Hediye yolda" })}</h2>
          <p className="mt-2 text-small text-fg-muted">
            {t({
              en: `${months} boxes for ${to.trim()}, first one shipping ${start ? f.date(start, { weekday: "long", day: "numeric", month: "long" }) : ""}. Reference ${done}; the receipt goes to ${email.trim()}.`,
              tr: `${to.trim()} için ${months} kutu; ilki ${start ? f.date(start, { day: "numeric", month: "long", weekday: "long" }) : ""} kargoda. Referans ${done}; makbuz ${email.trim()} adresine gider.`,
            })}
          </p>
          <Button type="button" variant="secondary" className="mt-5" onClick={() => setDone(null)}>
            {t({ en: "Send another gift", tr: "Bir hediye daha gönder" })}
          </Button>
        </div>
        {card}
      </div>
    );
  }

  const count = Object.keys(errors).length;
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
      <form ref={formRef} noValidate onSubmit={submit} aria-label={t({ en: "Gift subscription", tr: "Hediye abonelik" })} className="flex min-w-0 flex-col gap-6">
        {count ? <Alert tone="danger" live="assertive" title={t({ en: "A few details are missing", tr: "Birkaç bilgi eksik" })} /> : null}
        <Field label={t({ en: "How many boxes", tr: "Kaç kutu" })}>
          <RadioGroup<GiftLength>
            variant="card"
            value={length}
            onValueChange={setLength}
            className="grid-cols-1 sm:grid-cols-3"
            items={giftLengths.map((g) => ({
              value: g.id,
              label: `${t(g.label)} · ${tl(giftPrice(size, g.id))}`,
              description: g.discount ? t({ en: `${f.percent(g.discount)} off, one box every 4 weeks`, tr: `${f.percent(g.discount)} indirim, 4 haftada bir kutu` }) : t({ en: "One box every 4 weeks", tr: "4 haftada bir kutu" }),
            }))}
          />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t({ en: "Size", tr: "Boyut" })}>
            <RadioGroup<GiftSize> variant="segmented" value={size} onValueChange={setSize} items={sizes.filter((s) => s.id !== "kilo").map((s) => ({ value: s.id as GiftSize, label: t(s.name) }))} />
          </Field>
          <Field label={t({ en: "First box ships", tr: "İlk kutu kargoda" })}>
            <Select value={start} onValueChange={setStart} items={ships.map((d) => ({ value: d, label: f.date(d, { weekday: "short", day: "numeric", month: "long" }) }))} />
          </Field>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div data-field="to">
            <Field label={t({ en: "Recipient’s name", tr: "Alıcının adı" })} required error={errors.to}>
              <Input value={to} onChange={(e) => setTo(e.target.value)} autoComplete="off" />
            </Field>
          </div>
          <div data-field="city">
            <Field label={t({ en: "Delivery city", tr: "Teslimat şehri" })} required error={errors.city} hint={t({ en: "We ask them for the full address by email.", tr: "Tam adresi e-postayla kendisine sorarız." })}>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
          </div>
        </div>
        <div>
          <Field label={t({ en: "Card message", tr: "Kart mesajı" })} optional>
            <Textarea rows={4} maxLength={MAX} value={message} onChange={(e) => setMessage(e.target.value)} />
          </Field>
          <p className="mt-1 text-end font-mono text-[11px] text-fg-muted tabular" aria-live={message.length > MAX - 20 ? "polite" : "off"}>
            {MAX - message.length} {t({ en: "characters left", tr: "karakter kaldı" })}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div data-field="from">
            <Field label={t({ en: "From", tr: "Gönderen" })} required error={errors.from}>
              <Input value={from} onChange={(e) => setFrom(e.target.value)} autoComplete="given-name" />
            </Field>
          </div>
          <div data-field="email">
            <Field label={t({ en: "Your email", tr: "E-postanız" })} required error={errors.email}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </Field>
          </div>
        </div>
        <Field orientation="horizontal" label={t({ en: "Keep it a surprise", tr: "Sürpriz olsun" })} hint={surprise ? t({ en: "They hear from us only when we need the address.", tr: "Yalnızca adres gerektiğinde bizden haber alır." }) : t({ en: "We email them your message today.", tr: "Mesajınızı bugün kendisine e-postayla göndeririz." })}>
          <Switch checked={surprise} onCheckedChange={setSurprise} />
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-fg/70 pt-5">
          <p>
            <span className="block text-small text-fg-muted">{t({ en: `${months} boxes, delivery included`, tr: `${months} kutu, teslimat dahil` })}</span>
            <span className="font-display text-[2rem] leading-none text-fg tabular" data-testid="gift-total">
              {tl(total)}
            </span>
          </p>
          <Button type="submit" variant="primary" size="lg">
            {t({ en: "Pay and send the gift", tr: "Öde ve hediyeyi gönder" })}
          </Button>
        </div>
      </form>
      <div className="lg:sticky lg:top-24 lg:self-start">{card}</div>
    </div>
  );
}
