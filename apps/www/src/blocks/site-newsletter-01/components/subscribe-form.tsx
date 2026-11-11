"use client";

import * as React from "react";
import { Button, Field, Input, RadioGroup, RadioGroupItem, cn } from "@vamos-ui/react";
import { MailCheck } from "lucide-react";
import { CountUp } from "@vamos-ui/react/motion";
import { useDesk, type Cadence } from "./desk-provider";
import { copyFor, READERS, type SiteLocale } from "./content";

/** "14,207 readers" — counts this visitor once they subscribe. */
export function ReaderCount({ locale, className }: { locale: SiteLocale; className?: string }) {
  const { t, intl } = copyFor(locale);
  const { subscription } = useDesk();
  const n = READERS + (subscription ? 1 : 0);
  return (
    <span className={className} data-testid="reader-count">
      <CountUp value={n} locale={intl} className="tabular" /> {t({ en: "readers", tr: "okur" })}
    </span>
  );
}

/**
 * Subscribe to The Slow Desk: email, every letter or a monthly digest, one button. Validates
 * the address (with a typo hint for common domains), then shows the double opt-in step with the
 * address to check and an undo. `tone="masthead"` sits on the paper; `tone="card"` closes an issue.
 */
export function SubscribeForm({ locale, tone = "masthead", idPrefix }: { locale: SiteLocale; tone?: "masthead" | "card"; idPrefix: string }) {
  const { t } = copyFor(locale);
  const { subscription, subscribe, unsubscribe } = useDesk();
  const [email, setEmail] = React.useState("");
  const [cadence, setCadence] = React.useState<Cadence>("fortnightly");
  const [error, setError] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const statusRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const emailId = `${idPrefix}-email`;

  const typo = (() => {
    const m = /@(gmial|gmal|gnail|hotmial|outlok|yaho)\.(com|co)$/i.exec(email.trim());
    if (!m) return null;
    const fix: Record<string, string> = { gmial: "gmail", gmal: "gmail", gnail: "gmail", hotmial: "hotmail", outlok: "outlook", yaho: "yahoo" };
    return email.trim().replace(m[1]!, fix[m[1]!.toLowerCase()]!);
  })();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError(t({ en: "That doesn’t look like an email address yet.", tr: "Bu henüz bir e-posta adresine benzemiyor." }));
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      subscribe({ email: email.trim(), cadence });
      requestAnimationFrame(() => statusRef.current?.focus());
    }, 650);
  };

  if (subscription) {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" data-testid="subscribed" className={cn("vm-enter flex items-start gap-4 rounded-ui border border-fg/70 p-5 focus-ring", tone === "card" ? "bg-surface" : "bg-surface-2")}>
        <MailCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-accent-ink" />
        <div className="min-w-0">
          <p className="font-display text-[1.35rem] leading-tight text-fg">{t({ en: "One more step: check your inbox.", tr: "Bir adım kaldı: gelen kutunuza bakın." })}</p>
          <p className="mt-1 text-small break-words text-fg-muted">
            {t({ en: "I sent a confirmation link to", tr: "Onay bağlantısını şu adrese gönderdim:" })} <strong className="text-fg">{subscription.email}</strong>.{" "}
            {subscription.cadence === "monthly" ? t({ en: "You’ll get the monthly digest on the first Sunday.", tr: "Aylık özeti ayın ilk pazarı alacaksınız." }) : t({ en: "The next letter arrives on Sunday at 07:00.", tr: "Sonraki mektup pazar 07.00’de gelir." })}
          </p>
          <Button type="button" variant="link" className="mt-2 text-small" onClick={unsubscribe}>
            {t({ en: "Wrong address? Start again", tr: "Adres yanlış mı? Baştan başlayın" })}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} aria-label={t({ en: "Subscribe to The Slow Desk", tr: "The Slow Desk’e abone olun" })} className="flex flex-col gap-4">
      <Field id={emailId} label={t({ en: "Your email", tr: "E-postanız" })} error={error ?? undefined} hint={typo ? undefined : t({ en: "No tracking pixels. Unsubscribe in one click.", tr: "İzleme pikseli yok. Tek tıkla abonelikten çıkın." })}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input ref={inputRef} id={emailId} type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" size="lg" value={email} onChange={(e) => setEmail(e.target.value)} className="min-w-0 flex-1" />
          <Button type="submit" variant="primary" size="lg" className="vm-press" loading={sending} loadingText={t({ en: "Sending…", tr: "Gönderiliyor…" })}>
            {t({ en: "Subscribe — it’s free", tr: "Abone ol — ücretsiz" })}
          </Button>
        </div>
      </Field>
      {typo ? (
        <p className="-mt-2 text-small text-fg-muted">
          {t({ en: "Did you mean", tr: "Bunu mu demek istediniz:" })}{" "}
          <button type="button" className="rounded-[2px] font-medium text-accent-ink underline underline-offset-4 focus-ring" onClick={() => setEmail(typo)}>
            {typo}
          </button>
          ?
        </p>
      ) : null}
      {/* Explicit item ids: this form is server-rendered on the home page and must hydrate identically. */}
      <RadioGroup<Cadence> variant="segmented" size="sm" aria-label={t({ en: "How often", tr: "Sıklık" })} value={cadence} onValueChange={setCadence}>
        <RadioGroupItem id={`${idPrefix}-fortnightly`} value="fortnightly" label={t({ en: "Every letter · fortnightly", tr: "Her mektup · iki haftada bir" })} />
        <RadioGroupItem id={`${idPrefix}-monthly`} value="monthly" label={t({ en: "Monthly digest", tr: "Aylık özet" })} />
      </RadioGroup>
    </form>
  );
}
