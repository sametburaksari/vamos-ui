"use client";

import * as React from "react";
import { Button, Field, Input, RadioGroup, Textarea } from "@vamos-ui/react";
import { copyFor, type SiteLocale } from "./content";

/** "Suggest a guest": who, why, how you know them. Validates on submit, then thanks you. */
export function GuestForm({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const [errors, setErrors] = React.useState<{ guest?: string; why?: string; email?: string }>({});
  const [sent, setSent] = React.useState<string | null>(null);
  const doneRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (sent) doneRef.current?.focus();
  }, [sent]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const guest = String(d.get("guest") ?? "").trim();
    const why = String(d.get("why") ?? "").trim();
    const email = String(d.get("email") ?? "").trim();
    const next: typeof errors = {};
    if (!guest) next.guest = t({ en: "Who should we talk to?", tr: "Kiminle konuşmalıyız?" });
    if (why.length < 20) next.why = t({ en: "A sentence or two, please — at least 20 characters.", tr: "Bir iki cümle lütfen — en az 20 karakter." });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t({ en: "That email doesn’t look right.", tr: "Bu e-posta doğru görünmüyor." });
    setErrors(next);
    if (Object.keys(next).length) {
      e.currentTarget.querySelector<HTMLElement>(`[name=${next.guest ? "guest" : next.why ? "why" : "email"}]`)?.focus();
      return;
    }
    setSent(guest);
  };

  if (sent) {
    return (
      <div ref={doneRef} tabIndex={-1} className="surface rounded-ui-lg p-6 outline-none" data-testid="guest-sent">
        <p className="m-0 font-display text-h3">{t({ en: `${sent} is on the list.`, tr: `${sent} listeye eklendi.` })}</p>
        <p className="m-0 mt-2 text-fg-muted">{t({ en: "We read every suggestion on Monday mornings. If we book them, you get a seat at the recording.", tr: "Her öneriyi pazartesi sabahları okuyoruz. Konuğu ağırlarsak kayıtta size de bir sandalye var." })}</p>
        <Button variant="secondary" className="mt-4" onClick={() => setSent(null)}>
          {t({ en: "Suggest someone else", tr: "Başka birini öner" })}
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="surface grid gap-5 rounded-ui-lg p-5 sm:p-6" aria-label={t({ en: "Suggest a guest", tr: "Konuk öner" })}>
      <Field label={t({ en: "Guest’s name", tr: "Konuğun adı" })} required error={errors.guest}>
        <Input name="guest" />
      </Field>
      <Field label={t({ en: "How do you know them?", tr: "Onu nereden tanıyorsunuz?" })}>
        <RadioGroup
          name="relation"
          defaultValue="eaten"
          variant="segmented"
          items={[
            { value: "eaten", label: t({ en: "Ate their food", tr: "Yemeğini yedim" }) },
            { value: "read", label: t({ en: "Read their work", tr: "İşini okudum" }) },
            { value: "me", label: t({ en: "It’s me", tr: "Benim" }) },
          ]}
        />
      </Field>
      <Field label={t({ en: "Why them?", tr: "Neden o?" })} required error={errors.why} hint={t({ en: "The story you’d want to hear them tell.", tr: "Onun anlatmasını duymak istediğiniz hikâye." })}>
        <Textarea name="why" rows={4} />
      </Field>
      <Field label={t({ en: "Your email", tr: "E-postanız" })} optional error={errors.email}>
        <Input name="email" type="email" autoComplete="email" />
      </Field>
      <Button type="submit" variant="primary" className="justify-self-start">
        {t({ en: "Send suggestion", tr: "Öneriyi gönder" })}
      </Button>
    </form>
  );
}
