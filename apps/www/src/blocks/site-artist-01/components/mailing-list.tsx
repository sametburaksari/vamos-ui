"use client";

import * as React from "react";
import { Button, Field, Input, NativeSelect } from "@vamos-ui/react";
import { copyFor, shows, type SiteLocale } from "./content";

/** Mailing list with a nearest-city choice, so presale codes go to the right people. */
export function MailingList({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const [error, setError] = React.useState<string>();
  const [done, setDone] = React.useState<{ city: string } | null>(null);
  const cities = [...new Set(shows.map((s) => t(s.city)))];

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const email = String(d.get("email") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t({ en: "Enter an email address like name@example.com.", tr: "ad@example.com gibi bir e-posta adresi girin." }));
      e.currentTarget.querySelector<HTMLInputElement>("[name=email]")?.focus();
      return;
    }
    setError(undefined);
    setDone({ city: String(d.get("city") ?? "") });
  };

  if (done) {
    return (
      <p role="status" className="m-0 border-2 border-accent p-5 text-lead" data-testid="list-done">
        {done.city
          ? t({ en: `You’re in. Presale codes for ${done.city} arrive 48 hours before general sale.`, tr: `Listedesiniz. ${done.city} ön satış kodları genel satıştan 48 saat önce gelir.` })
          : t({ en: "You’re in. First email: the Salt Hour sleeve notes.", tr: "Listedesiniz. İlk e-posta: Salt Hour kapak notları." })}
      </p>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end" aria-label={t({ en: "Mailing list", tr: "E-posta listesi" })}>
      <Field label={t({ en: "Email", tr: "E-posta" })} error={error} required>
        <Input name="email" type="email" autoComplete="email" size="lg" />
      </Field>
      <Field label={t({ en: "Nearest city", tr: "En yakın şehir" })} optional>
        <NativeSelect name="city" size="lg" defaultValue="" items={[{ value: "", label: t({ en: "Anywhere", tr: "Fark etmez" }) }, ...cities.map((c) => ({ value: c, label: c }))]} />
      </Field>
      <Button type="submit" variant="primary" size="lg">
        {t({ en: "Sign up", tr: "Kaydol" })}
      </Button>
    </form>
  );
}
