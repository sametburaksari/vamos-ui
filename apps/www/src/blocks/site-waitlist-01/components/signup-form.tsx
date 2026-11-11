"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button, Field, Input, toast } from "@vamos-ui/react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { copyFor, type SiteLocale } from "./content";
import { EMAIL_RE, useWaitlist } from "./waitlist-provider";

/**
 * The one form on the page: an email, validated on submit (and live once it has been wrong),
 * then a short "planting" pause, a toast and the joined page.
 */
export function SignupForm({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const { join } = useWaitlist();
  const { navigate } = useSiteShell();
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const check = (v: string) =>
    !v.trim() ? t({ en: "Enter your email to join.", tr: "Katılmak için e-postanızı yazın." }) : !EMAIL_RE.test(v.trim()) ? t({ en: "That doesn’t look like an email — check for a missing @ or dot.", tr: "Bu bir e-posta gibi görünmüyor — eksik @ ya da nokta olabilir." }) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = check(value);
    setTouched(true);
    setError(err);
    if (err) {
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      join(value.trim());
      setBusy(false);
      toast.success(t({ en: "You’re on the list", tr: "Listedesiniz" }), { description: value.trim() });
      navigate({ page: "joined" });
    }, 700);
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-3" aria-label={t({ en: "Join the waitlist", tr: "Bekleme listesine katılın" })}>
      <Field label={t({ en: "Email", tr: "E-posta" })} error={touched ? error : undefined} hint={t({ en: "Two emails, ever: your turn, and if launch moves.", tr: "Yalnızca iki e-posta: sıranız geldiğinde ve lansman kayarsa." })}>
        <Input
          ref={inputRef}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder={t({ en: "you@example.com", tr: "siz@example.com" })}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (touched) setError(check(e.target.value));
          }}
          className="h-12 text-base"
        />
      </Field>
      <Button type="submit" variant="primary" size="lg" loading={busy} loadingText={t({ en: "Saving your spot…", tr: "Yeriniz ayrılıyor…" })} className="w-full">
        {t({ en: "Join the waitlist", tr: "Listeye katıl" })}
        <ArrowRight aria-hidden className="rtl:-scale-x-100" />
      </Button>
    </form>
  );
}
