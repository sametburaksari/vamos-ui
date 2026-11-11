"use client";

import * as React from "react";
import { Alert, Button, Field, Input, RadioGroup, Textarea } from "@vamos-ui/react";
import { CohortDates } from "./cohort-dates";
import { cohorts, copyFor, PRICES, type Cohort, type SiteLocale } from "./content";

type Plan = "cohort" | "instalments";

/**
 * Enrolment: cohort (with its live-session calendar), how to pay, name, email and a line about
 * the learner. Validates on submit and holds the seat for 48 hours (sample: nothing is sent).
 */
export function EnrolForm({ locale }: { locale: SiteLocale }) {
  const { t, f, currency } = copyFor(locale);
  const [cohort, setCohort] = React.useState<Cohort["id"]>("winter");
  const [plan, setPlan] = React.useState<Plan>("cohort");
  const [errors, setErrors] = React.useState<{ name?: string; email?: string }>({});
  const [done, setDone] = React.useState<{ name: string; email: string } | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const doneRef = React.useRef<HTMLDivElement>(null);
  const chosen = cohorts.find((c) => c.id === cohort)!;

  React.useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  const price = plan === "cohort" ? f.currency(PRICES.cohort[currency as "USD" | "TRY"], currency) : t({ en: `3 × ${f.currency(PRICES.instalment[currency as "USD" | "TRY"], currency)}`, tr: `3 × ${f.currency(PRICES.instalment[currency as "USD" | "TRY"], currency)}` });

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const next: typeof errors = {};
    if (name.length < 2) next.name = t({ en: "Tell us your name.", tr: "Adınızı yazın." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t({ en: "Enter an email like name@example.com.", tr: "ad@example.com gibi bir e-posta girin." });
    setErrors(next);
    if (next.name || next.email) {
      formRef.current?.querySelector<HTMLInputElement>(next.name ? "[name=name]" : "[name=email]")?.focus();
      return;
    }
    setDone({ name, email });
  };

  if (done) {
    return (
      <div ref={doneRef} tabIndex={-1} className="flex flex-col gap-6 outline-none">
        <Alert tone="success" title={t({ en: `Seat held, ${done.name.split(" ")[0]}`, tr: `Yeriniz ayrıldı, ${done.name.split(" ")[0]}` })}>
          {t({
            en: `We are holding one seat in the ${t(chosen.name).toLowerCase()} (starts ${f.date(chosen.start, "long")}) for 48 hours. Nora will email ${done.email} today to book your 20-minute call.`,
            tr: `${t(chosen.name)} için (başlangıç ${f.date(chosen.start, "long")}) bir yeri 48 saatliğine ayırdık. Nora 20 dakikalık görüşmenizi planlamak için bugün ${done.email} adresine yazacak.`,
          })}
        </Alert>
        <dl className="grid gap-4 border-y border-line py-5 text-small @2xl:grid-cols-3">
          {[
            { k: t({ en: "Cohort", tr: "Dönem" }), v: f.dateRange(chosen.start, chosen.end, "medium") },
            { k: t({ en: "Payment", tr: "Ödeme" }), v: price },
            { k: t({ en: "Due", tr: "Son ödeme" }), v: t({ en: "After your call", tr: "Görüşmeden sonra" }) },
          ].map((row) => (
            <div key={row.k} className="flex flex-col gap-1">
              <dt className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{row.k}</dt>
              <dd className="tabular text-fg">{row.v}</dd>
            </div>
          ))}
        </dl>
        <Button variant="secondary" className="w-fit" onClick={() => setDone(null)}>
          {t({ en: "Change details", tr: "Bilgileri değiştir" })}
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-10" aria-labelledby="enrol-form-title">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-4 font-mono text-eyebrow uppercase tracking-[0.1em] text-fg-muted">{t({ en: "1 · Choose a cohort", tr: "1 · Dönem seçin" })}</legend>
        <CohortDates locale={locale} value={cohort} onValueChange={setCohort} name="cohort" />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-4 font-mono text-eyebrow uppercase tracking-[0.1em] text-fg-muted">{t({ en: "2 · How you pay", tr: "2 · Nasıl ödersiniz" })}</legend>
        <RadioGroup
          variant="card"
          orientation="horizontal"
          name="plan"
          aria-label={t({ en: "Payment", tr: "Ödeme" })}
          value={plan}
          onValueChange={(v) => setPlan(v as Plan)}
          items={[
            { value: "cohort", label: (
              <span className="flex flex-col gap-1">
                <span>{t({ en: `Once · ${f.currency(PRICES.cohort[currency as "USD" | "TRY"], currency)}`, tr: `Tek seferde · ${f.currency(PRICES.cohort[currency as "USD" | "TRY"], currency)}` })}</span>
                <span className="text-small font-normal text-fg-muted">{t({ en: "Paid after your call, before week one.", tr: "Görüşmeden sonra, ilk haftadan önce ödenir." })}</span>
              </span>
            ) },
            { value: "instalments", label: (
              <span className="flex flex-col gap-1">
                <span>{t({ en: `Three months · 3 × ${f.currency(PRICES.instalment[currency as "USD" | "TRY"], currency)}`, tr: `Üç ay · 3 × ${f.currency(PRICES.instalment[currency as "USD" | "TRY"], currency)}` })}</span>
                <span className="text-small font-normal text-fg-muted">{t({ en: "No interest; first payment before week one.", tr: "Faizsiz; ilk ödeme ilk haftadan önce." })}</span>
              </span>
            ) },
          ]}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-4 font-mono text-eyebrow uppercase tracking-[0.1em] text-fg-muted">{t({ en: "3 · About you", tr: "3 · Sizi tanıyalım" })}</legend>
        <div className="grid gap-5 @2xl:grid-cols-2">
          <Field label={t({ en: "Full name", tr: "Ad soyad" })} required error={errors.name} hint={t({ en: "As it should read on your certificate.", tr: "Sertifikanızda yazacağı şekilde." })}>
            <Input name="name" autoComplete="name" />
          </Field>
          <Field label={t({ en: "Email", tr: "E-posta" })} required error={errors.email} hint={t({ en: "Only for the course. No newsletter.", tr: "Yalnızca kurs için. Bülten yok." })}>
            <Input name="email" type="email" autoComplete="email" inputMode="email" />
          </Field>
        </div>
        <Field label={t({ en: "What would you like to answer with data?", tr: "Veriyle neyi yanıtlamak istersiniz?" })} optional hint={t({ en: "One sentence is plenty. It shapes your capstone.", tr: "Bir cümle yeter. Bitirme projenizi şekillendirir." })}>
          <Textarea name="question" rows={3} />
        </Field>
      </fieldset>

      <div className="flex flex-col gap-3 border-t border-line pt-6 @2xl:flex-row @2xl:items-center @2xl:justify-between">
        <p className="text-small text-fg-muted">
          {t({ en: "Nothing is charged now. Full refund until the end of week two.", tr: "Şimdi hiçbir ücret alınmaz. İkinci haftanın sonuna kadar tam iade." })}
        </p>
        <Button type="submit" variant="primary" size="lg">
          {t({ en: `Hold my seat · ${t(chosen.name)}`, tr: `Yerimi ayır · ${t(chosen.name)}` })}
        </Button>
      </div>
    </form>
  );
}
