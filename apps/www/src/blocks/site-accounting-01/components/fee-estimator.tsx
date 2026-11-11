"use client";

import * as React from "react";
import { Button, Checkbox, Field, RadioGroup, Slider } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, Copy, Check } from "lucide-react";
import { companyTypes, copyFor, DEFAULT_FEE, estimate, extras, fill, invoiceBands, PER_EMPLOYEE, tl, type CompanyType, type ExtraId, type FeeInput, type InvoiceBand, type SiteLocale } from "./content";

const c = {
  eyebrow: { en: "Fee estimate", tr: "Ücret tahmini" },
  title: { en: "Four answers, one *monthly figure*", tr: "Dört cevap, tek *aylık rakam*" },
  lead: { en: "The statement on the right is the fee we start from. Change anything — it recalculates line by line.", tr: "Sağdaki döküm, başlangıç ücretimizdir. Herhangi bir şeyi değiştirin — satır satır yeniden hesaplanır." },
  q1: { en: "1 · What kind of company?", tr: "1 · Nasıl bir şirket?" },
  q2: { en: "2 · People on payroll", tr: "2 · Bordrodaki kişi sayısı" },
  q2hint: { en: "{fee} per person a month: payslips, SGK, withholding.", tr: "Kişi başı aylık {fee}: bordro, SGK, muhtasar." },
  q3: { en: "3 · Sales and purchase invoices a month", tr: "3 · Aylık alış ve satış faturası" },
  q4: { en: "4 · Anything extra?", tr: "4 · Ek bir şey var mı?" },
  auditNote: { en: "Audit-ready year end is offered to A.Ş. and branches, where an independent audit applies.", tr: "Denetime hazır yıl sonu, bağımsız denetime tabi A.Ş. ve şubelere sunulur." },
  onlyAs: { en: "For A.Ş. and branches", tr: "A.Ş. ve şubeler için" },
  people: { en: "{n} people", tr: "{n} kişi" },
  nobody: { en: "No employees", tr: "Çalışan yok" },
  statement: { en: "Fee statement", tr: "Ücret dökümü" },
  ref: { en: "Ref.", tr: "Ref." },
  monthly: { en: "Monthly, excl. VAT", tr: "Aylık, KDV hariç" },
  vat: { en: "VAT 20%", tr: "KDV %20" },
  total: { en: "Monthly total", tr: "Aylık toplam" },
  once: { en: "Once a year or once only", tr: "Yılda bir veya tek sefer" },
  yearEnd: { en: "Year-end close (March)", tr: "Yıl sonu kapanış (mart)" },
  takeover: { en: "Takeover from your current accountant", tr: "Mevcut muhasebeciden devir" },
  annual: { en: "First 12 months, excl. VAT", tr: "İlk 12 ay, KDV hariç" },
  teamSenior: { en: "Your team: a senior accountant, partner sign-off on every return.", tr: "Ekibiniz: kıdemli muhasebeci, her beyannamede ortak imzası." },
  teamPartner: { en: "Your team: a senior accountant plus a monthly partner review meeting.", tr: "Ekibiniz: kıdemli muhasebeci ve her ay ortak kontrol toplantısı." },
  book: { en: "Book a call about this estimate", tr: "Bu tahmin için görüşme ayarla" },
  copy: { en: "Copy summary", tr: "Özeti kopyala" },
  copied: { en: "Copied", tr: "Kopyalandı" },
  valid: { en: "Valid for engagements signed before 31 December 2026.", tr: "31 Aralık 2026’dan önce imzalanan sözleşmeler için geçerlidir." },
};

export function FeeEstimator({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const [input, setInput] = React.useState<FeeInput>(DEFAULT_FEE);
  const [copied, setCopied] = React.useState(false);
  const update = (patch: Partial<FeeInput>) => setInput((p) => ({ ...p, ...patch }));
  const est = estimate(input);
  const ref = `LA-${input.type.toUpperCase()}-${String(input.employees).padStart(2, "0")}-${input.invoices.replace("+", "P")}${est.lines.length > 1 ? `-${est.lines.length}L` : ""}`;

  const summary = () =>
    [
      `Ledgerly Advisors — ${t(c.statement)} ${ref}`,
      ...est.lines.map((l) => `${t(l.label)}: ${tl(l.amount, locale)}`),
      `${t(c.monthly)}: ${tl(est.monthly, locale)}`,
      `${t(c.total)}: ${tl(est.gross, locale)}`,
      `${t(c.yearEnd)}: ${tl(est.yearEnd, locale)}`,
    ].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };

  const legend = "mb-3 font-display text-h3 text-fg";

  return (
    <Section aria-labelledby="lg-est-title" anchor="estimate">
      <Container>
        <div className="mb-10 flex max-w-[60ch] flex-col gap-3">
          <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-fg-muted">{t(c.eyebrow)}</p>
          <h2 id="lg-est-title" className="font-display text-display-m text-balance text-fg">
            {t(c.title).split("*").map((p, i) => (i % 2 ? <em key={i} className="text-accent-ink [font-style:var(--display-em)]">{p}</em> : p))}
          </h2>
          <p className="text-lead text-fg-muted">{t(c.lead)}</p>
        </div>

        <div className="grid items-start gap-10 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] @5xl:gap-14">
          <div className="flex min-w-0 flex-col gap-10">
            <fieldset>
              <legend className={legend}>{t(c.q1)}</legend>
              <RadioGroup
                variant="card"
                aria-label={t(c.q1)}
                value={input.type}
                onValueChange={(v) => update({ type: v as CompanyType })}
                className="grid gap-3 @2xl:grid-cols-2"
                items={companyTypes.map((ct) => ({ value: ct.id, label: t(ct.name), description: `${t(ct.note)} · ${tl(ct.base, locale)}` }))}
              />
            </fieldset>

            <fieldset>
              <legend className={legend}>{t(c.q2)}</legend>
              <Field label={input.employees ? fill(t(c.people), { n: input.employees }) : t(c.nobody)} hint={fill(t(c.q2hint), { fee: tl(PER_EMPLOYEE, locale) })}>
                <Slider value={[input.employees]} onValueChange={(v) => update({ employees: v[0] ?? 0 })} min={0} max={60} step={1} marks={[{ value: 0, label: "0" }, { value: 20, label: "20" }, { value: 40, label: "40" }, { value: 60, label: "60" }]} formatValue={(n) => fill(t(c.people), { n })} />
              </Field>
            </fieldset>

            <fieldset>
              <legend className={legend}>{t(c.q3)}</legend>
              <RadioGroup variant="segmented" aria-label={t(c.q3)} value={input.invoices} onValueChange={(v) => update({ invoices: v as InvoiceBand })} items={invoiceBands.map((b) => ({ value: b.id, label: t(b.label) }))} />
            </fieldset>

            <fieldset>
              <legend className={legend}>{t(c.q4)}</legend>
              <ul className="grid gap-3 @2xl:grid-cols-2">
                {extras.map((e) => {
                  const unavailable = !!e.only && !e.only.includes(input.type);
                  if (unavailable) return null;
                  return (
                    <li key={e.id}>
                      <Checkbox
                        variant="card"
                        checked={input.extras.includes(e.id)}
                        onCheckedChange={(on) => update({ extras: on === true ? [...input.extras, e.id] : input.extras.filter((x: ExtraId) => x !== e.id) })}
                        label={`${t(e.name)} · +${tl(e.add, locale)}`}
                        description={e.only ? `${t(e.hint)} · ${t(c.onlyAs)}` : t(e.hint)}
                      />
                    </li>
                  );
                })}
              </ul>
              {input.type === "sole" || input.type === "ltd" ? <p className="mt-3 text-small text-fg-muted">{t(c.auditNote)}</p> : null}
            </fieldset>
          </div>

          {/* The statement: printed-invoice styling, dotted leaders, double rules. */}
          <aside aria-labelledby="lg-statement" className="surface rounded-ui-lg p-5 @md:p-7 @5xl:sticky @5xl:top-24">
            <div className="flex items-baseline justify-between gap-3 border-b-[3px] border-double border-line pb-3">
              <h3 id="lg-statement" className="font-display text-h3 text-fg">
                {t(c.statement)}
              </h3>
              <span className="font-mono text-xs text-fg-muted" data-testid="lg-ref">
                {t(c.ref)} {ref}
              </span>
            </div>
            <dl className="flex flex-col py-3 text-small" aria-live="polite">
              {est.lines.map((l) => (
                <div key={l.id} className="flex items-baseline gap-2 py-1.5">
                  <dt className="text-fg">{t(l.label)}</dt>
                  <span aria-hidden className="min-w-4 flex-1 translate-y-[-0.25em] border-b border-dotted border-fg-subtle" />
                  <dd className="font-mono tabular text-fg">{tl(l.amount, locale)}</dd>
                </div>
              ))}
            </dl>
            <dl className="flex flex-col gap-1 border-t border-line pt-3 text-small">
              <div className="flex justify-between gap-3">
                <dt className="text-fg-muted">{t(c.monthly)}</dt>
                <dd className="font-mono tabular text-fg">{tl(est.monthly, locale)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-fg-muted">{t(c.vat)}</dt>
                <dd className="font-mono tabular text-fg-muted">{tl(est.vat, locale)}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-end justify-between gap-3 border-y-[3px] border-double border-line py-3">
              <span className="text-small font-semibold text-fg">{t(c.total)}</span>
              <span className="font-mono text-[1.75rem] leading-none font-medium tabular text-accent-ink" data-testid="lg-total">
                {tl(est.gross, locale)}
              </span>
            </div>
            <p className="mt-5 mb-1 font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted">{t(c.once)}</p>
            <dl className="flex flex-col gap-1 text-small">
              <div className="flex justify-between gap-3">
                <dt className="text-fg">{t(c.yearEnd)}</dt>
                <dd className="font-mono tabular text-fg">{tl(est.yearEnd, locale)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-fg">{t(c.takeover)}</dt>
                <dd className="font-mono tabular text-fg">{tl(est.takeover, locale)}</dd>
              </div>
              <div className="mt-1 flex justify-between gap-3 border-t border-line pt-2">
                <dt className="text-fg-muted">{t(c.annual)}</dt>
                <dd className="font-mono tabular text-fg">{tl(est.annual, locale)}</dd>
              </div>
            </dl>
            <p className="mt-5 text-small text-fg-muted">{t(est.partner ? c.teamPartner : c.teamSenior)}</p>
            <div className="mt-5 flex flex-col gap-2">
              <Button asChild variant="primary" block>
                <a href={sitePageHref("contact")}>
                  {t(c.book)}
                  <ArrowRight aria-hidden className="rtl:rotate-180" />
                </a>
              </Button>
              <Button variant="ghost" block onClick={copy}>
                {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                <span aria-live="polite">{copied ? t(c.copied) : t(c.copy)}</span>
              </Button>
            </div>
            <p className="mt-4 text-xs text-fg-muted">{t(c.valid)}</p>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
