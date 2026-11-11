"use client";

import * as React from "react";
import { Button, Field, RadioGroup } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, Check } from "lucide-react";
import { companyTypes, copyFor, estimate, tl, type CompanyType, type SiteLocale } from "./content";

const c = {
  eyebrow: { en: "Chartered accountants · Kadıköy, İstanbul", tr: "Mali müşavirlik · Kadıköy, İstanbul" },
  title: { en: "Your books, closed by the *fifth*.", tr: "Defterleriniz, ayın *beşinde* kapalı." },
  lead: {
    en: "Bookkeeping, payroll and tax for 212 companies, from one-person studios to foreign branches. A fixed monthly fee you can see before we talk, and a licensed partner who signs every return.",
    tr: "Tek kişilik stüdyolardan yabancı şubelere 212 şirkete defter, bordro ve vergi. Konuşmadan önce görebileceğiniz sabit aylık ücret ve her beyannameyi imzalayan lisanslı bir ortak.",
  },
  estimate: { en: "Estimate my fee", tr: "Ücretimi hesapla" },
  call: { en: "Book a 20-minute call", tr: "20 dakikalık görüşme ayarla" },
  ledgerTitle: { en: "November 2026 · a typical month", tr: "Kasım 2026 · sıradan bir ay" },
  ledgerClient: { en: "Pinecone Ceramics Ltd. — client file 0418", tr: "Pinecone Seramik Ltd. — müşteri dosyası 0418" },
  day: { en: "Day", tr: "Gün" },
  entry: { en: "Entry", tr: "Kayıt" },
  status: { en: "Status", tr: "Durum" },
  done: { en: "Done", tr: "Tamam" },
  due: { en: "Due", tr: "Bekliyor" },
  signed: { en: "Signed N. Aydemir, SMMM", tr: "İmza N. Aydemir, SMMM" },
  previewEyebrow: { en: "Fees", tr: "Ücretler" },
  previewTitle: { en: "The price, *before* the first call", tr: "Fiyat, *ilk görüşmeden önce*" },
  previewLead: { en: "Pick your company type. The full estimate adds payroll, invoice volume and extras line by line.", tr: "Şirket türünüzü seçin. Tam tahmin bordroyu, fatura hacmini ve ekstraları satır satır ekler." },
  type: { en: "Company type", tr: "Şirket türü" },
  from: { en: "from", tr: "başlangıç" },
  perMonth: { en: "a month, excl. VAT", tr: "aylık, KDV hariç" },
  included: { en: "Always included", tr: "Her zaman dahil" },
  full: { en: "Build my full estimate", tr: "Tam tahminimi oluştur" },
};

const ledger: { day: string; entry: { en: string; tr: string }; done: boolean }[] = [
  { day: "01", entry: { en: "Bank feeds and October receipts imported", tr: "Banka hareketleri ve ekim fişleri aktarıldı" }, done: true },
  { day: "05", entry: { en: "October books closed, trial balance sent", tr: "Ekim defteri kapandı, mizan gönderildi" }, done: true },
  { day: "10", entry: { en: "Management pack and cash forecast", tr: "Yönetim raporu ve nakit tahmini" }, done: true },
  { day: "26", entry: { en: "Payroll, withholding and SGK returns", tr: "Bordro, muhtasar ve SGK bildirgeleri" }, done: false },
  { day: "28", entry: { en: "VAT return filed and paid", tr: "KDV beyannamesi verildi ve ödendi" }, done: false },
];

/** Splits a "*word*" emphasis into an <em>. */
function Emph({ text }: { text: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <em key={i} className="text-accent-ink [font-style:var(--display-em)]">
            {p}
          </em>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  );
}

export function LedgerHero({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  return (
    <Section aria-labelledby="lg-hero-title" className="relative overflow-hidden">
      {/* Ledger ruling: a hairline every 2rem and a double margin rule on the start side. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_calc(2rem-1px),var(--line)_calc(2rem-1px),var(--line)_2rem)] opacity-70 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 start-[max(1rem,calc(50%-41rem))] hidden w-[5px] border-x border-accent/50 @3xl:block" />
      <Container className="relative">
        <div className="grid items-end gap-12 @5xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] @5xl:gap-16">
          <div className="flex flex-col gap-7 @3xl:ps-10">
            <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-fg-muted">{t(c.eyebrow)}</p>
            <h1 id="lg-hero-title" className="font-display text-display-xl font-[var(--display-weight)] tracking-[var(--display-tracking)] text-balance text-fg">
              <Emph text={t(c.title)} />
            </h1>
            <p className="max-w-[54ch] text-lead text-fg-muted">{t(c.lead)}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="primary" size="lg">
                <a href={sitePageHref("services", "estimate")}>
                  {t(c.estimate)}
                  <ArrowRight aria-hidden className="rtl:rotate-180" />
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href={sitePageHref("contact")}>{t(c.call)}</a>
              </Button>
            </div>
          </div>

          <figure className="surface relative rounded-ui-lg p-5 @md:p-7">
            <figcaption className="flex flex-col gap-1 border-b-[3px] border-double border-line pb-4">
              <span className="font-display text-h3 text-fg">{t(c.ledgerTitle)}</span>
              <span className="font-mono text-xs text-fg-muted">{t(c.ledgerClient)}</span>
            </figcaption>
            <table className="w-full border-collapse text-small">
              <caption className="sr-only">{t(c.ledgerTitle)}</caption>
              <thead>
                <tr className="text-start font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted">
                  <th scope="col" className="w-12 py-3 text-start font-normal">{t(c.day)}</th>
                  <th scope="col" className="py-3 text-start font-normal">{t(c.entry)}</th>
                  <th scope="col" className="py-3 text-end font-normal">{t(c.status)}</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((row) => (
                  <tr key={row.day} className="border-t border-line">
                    <td className="py-3 align-top font-mono tabular text-fg-muted">{row.day}</td>
                    <td className="py-3 pe-3 text-fg">{t(row.entry)}</td>
                    <td className="py-3 text-end">
                      {row.done ? (
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-accent-ink">
                          <Check aria-hidden className="size-3.5" strokeWidth={3} />
                          {t(c.done)}
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-fg-muted">{t(c.due)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 border-t-[3px] border-double border-line pt-3 text-end font-display text-small italic text-fg-muted">{t(c.signed)}</p>
          </figure>
        </div>
      </Container>
    </Section>
  );
}

export function FeePreview({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const [type, setType] = React.useState<CompanyType>("ltd");
  const est = estimate({ type, employees: 0, invoices: "50", extras: [] });
  return (
    <Section aria-labelledby="lg-fees-title" theme={{ surface: "surface-2" }} anchor="fees">
      <Container>
        <div className="grid gap-10 @5xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] @5xl:gap-16">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-fg-muted">{t(c.previewEyebrow)}</p>
            <h2 id="lg-fees-title" className="font-display text-display-m text-balance text-fg">
              <Emph text={t(c.previewTitle)} />
            </h2>
            <p className="max-w-[48ch] text-lead text-fg-muted">{t(c.previewLead)}</p>
          </div>
          <div className="flex flex-col gap-6">
            <Field label={t(c.type)}>
              <RadioGroup variant="segmented" value={type} onValueChange={(v) => setType(v as CompanyType)} items={companyTypes.map((ct) => ({ value: ct.id, label: t(ct.short) }))} />
            </Field>
            <div className="grid gap-6 border-t border-line pt-6 @2xl:grid-cols-[auto_minmax(0,1fr)] @2xl:gap-10">
              <div className="flex flex-col" aria-live="polite">
                <span className="text-xs text-fg-muted">{t(c.from)}</span>
                <span className="font-mono text-[2.5rem] leading-none font-medium tabular tracking-tight text-fg" data-testid="lg-from">
                  {tl(est.monthly, locale)}
                </span>
                <span className="mt-1.5 text-xs text-fg-muted">{t(c.perMonth)}</span>
                <span className="mt-3 text-small text-fg">{t(est.type.note)}</span>
              </div>
              <div>
                <p className="mb-2 font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted">{t(c.included)}</p>
                <ul className="flex flex-col gap-2 text-small text-fg">
                  {est.type.included.map((line) => (
                    <li key={line.en} className="flex gap-2">
                      <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
                      {t(line)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <Button asChild variant="secondary">
                <a href={sitePageHref("services", "estimate")}>
                  {t(c.full)}
                  <ArrowRight aria-hidden className="rtl:rotate-180" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
