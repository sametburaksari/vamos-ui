"use client";

import * as React from "react";
import { LineChart, type ChartConfig } from "@vamos-ui/react/charts";
import { Container, Section } from "@vamos-ui/react/blocks";
import { FileDown } from "lucide-react";
import { certificates, copyFor, num, SPC, spc, type SiteLocale } from "./content";

const c = {
  eyebrow: { en: "Live from the measuring room", tr: "Ölçüm odasından canlı" },
  title: { en: "One bore, *24 subgroups*", tr: "Tek delik, *24 alt grup*" },
  lead: {
    en: "Bore Ø52 H7 on housing PB510, five parts measured on the CMM every 40 minutes. Deviation from nominal in micrometres; the drawing allows 0 to +30 µm.",
    tr: "PB510 yatağında Ø52 H7 delik; her 40 dakikada beş parça koordinat ölçüm makinesinde ölçülür. Nominalden sapma mikrometre cinsinden; resim 0 ile +30 µm arasına izin verir.",
  },
  chart: { en: "Bore Ø52 H7, subgroup mean deviation from nominal, week 44 2026, in micrometres", tr: "Ø52 H7 delik, alt grup ortalamasının nominalden sapması, 2026 44. hafta, mikrometre" },
  mean: { en: "Subgroup mean", tr: "Alt grup ortalaması" },
  sub: { en: "Subgroup", tr: "Alt grup" },
  ucl: { en: "UCL", tr: "ÜKS" },
  lcl: { en: "LCL", tr: "AKS" },
  utl: { en: "Upper tolerance +30", tr: "Üst tolerans +30" },
  cpk: { en: "Cpk", tr: "Cpk" },
  cpkNote: { en: "Customer minimum 1.33", tr: "Müşteri asgarisi 1,33" },
  n: { en: "Parts measured", tr: "Ölçülen parça" },
  nNote: { en: "24 subgroups × 5", tr: "24 alt grup × 5" },
  out: { en: "Points outside limits", tr: "Sınır dışı nokta" },
  outNote: { en: "Western Electric rules 1–4", tr: "Western Electric kuralları 1–4" },
  certEyebrow: { en: "Certificates", tr: "Belgeler" },
  certTitle: { en: "Audited, *every year*", tr: "*Her yıl* denetlenir" },
  valid: { en: "Valid until", tr: "Geçerlilik" },
  pdf: { en: "PDF", tr: "PDF" },
  pdfOf: { en: "PDF: {name} certificate", tr: "PDF: {name} belgesi" },
};

export function SpcPanel({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const um = (v: number) => Math.round((v - 52) * 10000) / 10;
  const data = spc.map((r) => ({ sub: r.sub, mean: um(r.mean) }));
  const config = { mean: { label: t(c.mean), color: "chart-1", format: (v: unknown) => `${num(Number(v), locale, 1)} µm` } } satisfies ChartConfig;
  const outside = data.filter((d) => d.mean > um(SPC.ucl) || d.mean < um(SPC.lcl)).length;
  const stat = (label: string, value: string, note: string) => (
    <div className="flex flex-col gap-1 border-t border-line pt-3">
      <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-fg-muted">{label}</dt>
      <dd className="font-display text-[2.25rem] leading-none font-semibold tabular text-fg">{value}</dd>
      <dd className="text-xs text-fg-muted">{note}</dd>
    </div>
  );
  return (
    <Section aria-labelledby="os-spc-title" anchor="spc">
      <Container>
        <div className="grid gap-10 @5xl:grid-cols-[minmax(0,1fr)_16rem] @5xl:gap-14">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex max-w-[62ch] flex-col gap-3">
              <p className="font-mono text-eyebrow uppercase tracking-[0.14em] text-fg-muted">{t(c.eyebrow)}</p>
              <h2 id="os-spc-title" className="font-display text-display-m uppercase text-fg [font-weight:var(--display-weight)]">
                {t(c.title).split("*").map((p, i) => (i % 2 ? <span key={i} className="text-accent-ink">{p}</span> : p))}
              </h2>
              <p className="text-body text-fg-muted">{t(c.lead)}</p>
            </div>
            <div className="rounded-ui border border-line bg-surface p-4">
              <LineChart
                title={t(c.chart)}
                data={data}
                x="sub"
                xLabel={t(c.sub)}
                config={config}
                height="md"
                curve="linear"
                dots="all"
                legend="none"
                reference={[
                  { y: 30, label: t(c.utl), color: "chart-3", labelPosition: "above" },
                  { y: um(SPC.ucl), label: `${t(c.ucl)} ${num(um(SPC.ucl), locale, 1)}`, labelPosition: "above" },
                  { y: um(SPC.lcl), label: `${t(c.lcl)} ${num(um(SPC.lcl), locale, 1)}` },
                ]}
                tableToggle
              />
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-5 self-end @2xl:grid-cols-3 @5xl:grid-cols-1">
            {stat(t(c.cpk), num(SPC.cpk, locale, 2), t(c.cpkNote))}
            {stat(t(c.n), num(data.length * 5, locale), t(c.nNote))}
            {stat(t(c.out), String(outside), t(c.outNote))}
          </dl>
        </div>
      </Container>
    </Section>
  );
}

export function CertificateList({ locale }: { locale: SiteLocale }) {
  const { t, intl } = copyFor(locale);
  const date = (iso: string) => new Intl.DateTimeFormat(intl, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
  return (
    <Section aria-labelledby="os-cert-title" theme={{ surface: "surface-2" }} anchor="certificates">
      <Container>
        <div className="mb-8 flex flex-col gap-3">
          <p className="font-mono text-eyebrow uppercase tracking-[0.14em] text-fg-muted">{t(c.certEyebrow)}</p>
          <h2 id="os-cert-title" className="font-display text-display-m uppercase text-fg [font-weight:var(--display-weight)]">
            {t(c.certTitle).split("*").map((p, i) => (i % 2 ? <span key={i} className="text-accent-ink">{p}</span> : p))}
          </h2>
        </div>
        <ul className="flex flex-col border-t-2 border-fg">
          {certificates.map((cert) => (
            <li key={cert.name} className="grid gap-2 border-b border-line py-4 @3xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto_auto] @3xl:items-center @3xl:gap-8">
              <h3 className="font-display text-h3 font-semibold uppercase text-fg">{cert.name}</h3>
              <div className="flex flex-col gap-0.5">
                <p className="text-small text-fg">{t(cert.scope)}</p>
                <p className="text-xs text-fg-muted">{t(cert.body)}</p>
              </div>
              <p className="font-mono text-xs text-fg-muted">
                {t(c.valid)} <span className="text-fg">{date(cert.until)}</span>
              </p>
              <a href={`/certificates/${cert.name.split(" ")[0]!.toLowerCase()}.pdf`} aria-label={t(c.pdfOf).replace("{name}", cert.name)} className="inline-flex items-center gap-1.5 justify-self-start rounded-[2px] font-mono text-xs font-semibold text-accent-ink underline-offset-4 hover:underline focus-ring">
                <FileDown aria-hidden className="size-4" />
                {t(c.pdf)}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
