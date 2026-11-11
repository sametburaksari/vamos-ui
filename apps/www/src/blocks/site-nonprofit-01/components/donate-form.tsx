"use client";

import * as React from "react";
import { Alert, Button, Checkbox, Field, Input } from "@vamos-ui/react";
import { copyFor, splitGift, type SiteLocale } from "./content";
import { describe } from "./gift-builder";
import { giftAmount, useGift } from "./gift-store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Step 2 of the donate page: who is giving. Validates on submit, then shows the pledge with a
 * reference number (the payment provider's page would open here on a live site).
 */
export function DonateForm({ locale }: { locale: SiteLocale }) {
  const { t, lira } = copyFor(locale);
  const gift = useGift();
  const amount = giftAmount(gift);
  const monthly = gift.frequency === "monthly";
  const [errors, setErrors] = React.useState<{ name?: string; email?: string; amount?: string }>({});
  const [done, setDone] = React.useState<{ name: string; ref: string } | null>(null);
  const doneRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const next: typeof errors = {};
    if (!name) next.name = t({ en: "Tell us your name for the receipt.", tr: "Makbuz için adınızı yazın." });
    if (!EMAIL_RE.test(email)) next.email = t({ en: "We need a working email to send the receipt.", tr: "Makbuzu gönderebilmemiz için geçerli bir e-posta gerekli." });
    if (amount < 50) next.amount = t({ en: "Choose an amount of ₺50 or more in step 1.", tr: "1. adımda ₺50 veya üzeri bir tutar seçin." });
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = e.currentTarget.querySelector<HTMLInputElement>(next.name ? "[name=name]" : next.email ? "[name=email]" : "input");
      first?.focus();
      return;
    }
    setDone({ name: name.split(" ")[0] ?? name, ref: `OSF-26-${String(4800 + (amount % 997)).padStart(5, "0")}` });
  };

  if (done) {
    const split = splitGift(amount);
    return (
      <div ref={doneRef} tabIndex={-1} className="border border-fg bg-surface p-6 outline-none sm:p-8" data-testid="donate-done">
        <p className="m-0 font-mono text-[11px] tracking-[0.14em] text-accent-ink uppercase">{t({ en: "Pledge recorded", tr: "Bağış kaydedildi" })} · {done.ref}</p>
        <p className="m-0 mt-3 font-display text-display-m">
          {t({ en: `Thank you, ${done.name}.`, tr: `Teşekkürler, ${done.name}.` })}
        </p>
        <p className="m-0 mt-3 max-w-[56ch] text-lead text-fg-muted">
          {t({
            en: `${lira(amount)}${monthly ? " every month" : ""} becomes ${describe(split.lines, "en")}. The receipt and a photo of the shelf it lands on come by email within three weeks.`,
            tr: `${lira(amount)}${monthly ? " her ay" : ""}; ${describe(split.lines, "tr")} olacak. Makbuz ve bağışınızın gittiği rafın fotoğrafı üç hafta içinde e-postanıza gelir.`,
          })}
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => setDone(null)}>
          {t({ en: "Change the details", tr: "Bilgileri değiştir" })}
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="grid gap-5" aria-label={t({ en: "Your details", tr: "Bilgileriniz" })}>
      {errors.amount ? <Alert tone="danger" live="assertive">{errors.amount}</Alert> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t({ en: "Full name", tr: "Ad soyad" })} required error={errors.name}>
          <Input name="name" autoComplete="name" />
        </Field>
        <Field label={t({ en: "Email", tr: "E-posta" })} required error={errors.email} hint={t({ en: "For the receipt only.", tr: "Yalnızca makbuz için." })}>
          <Input name="email" type="email" autoComplete="email" />
        </Field>
      </div>
      <Field label={t({ en: "In honour or memory of", tr: "Anısına ya da adına" })} optional hint={t({ en: "We print this name on the shelf’s inside door.", tr: "Bu ismi rafın iç kapağına basıyoruz." })}>
        <Input name="dedication" />
      </Field>
      <Checkbox name="anonymous" label={t({ en: "Keep my name off the donor list", tr: "Adım bağışçı listesinde yer almasın" })} description={t({ en: "You still get a receipt.", tr: "Makbuzunuzu yine alırsınız." })} />
      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-5">
        <Button type="submit" variant="primary" size="lg">
          {amount >= 50
            ? t({ en: `Continue — ${lira(amount)}${monthly ? " a month" : ""}`, tr: `Devam — ${lira(amount)}${monthly ? " / ay" : ""}` })
            : t({ en: "Continue", tr: "Devam" })}
        </Button>
        <span className="text-small text-fg-muted">{t({ en: "Card or bank transfer on the next screen. 3-D Secure.", tr: "Kart veya havale bir sonraki ekranda. 3-D Secure." })}</span>
      </div>
    </form>
  );
}
