"use client";

import * as React from "react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { useJob } from "./job-provider";
import { ServicePicker } from "./service-picker";
import { copyFor } from "./content";

const c = {
  crumb: { en: "Prices & times", tr: "Fiyatlar ve süreler" },
  title: { en: "Every job, *timed and priced*", tr: "Her iş, *süresi ve fiyatıyla*" },
  lead: { en: "Prices include parts, fluids and labour for your car size. Times are what our bays actually average — the job card adds them up and tells you when to come back.", tr: "Fiyatlara araç boyutunuza göre parça, sıvı ve işçilik dahildir. Süreler bölmelerimizin gerçek ortalamasıdır — iş kartı bunları toplar ve ne zaman geleceğinizi söyler." },
  picker: { en: "Service picker", tr: "Hizmet seçici" },
  notes: [
    { en: "Prices include 20% VAT.", tr: "Fiyatlara %20 KDV dahildir." },
    { en: "Extra work is only done after you say yes on the phone.", tr: "Ek iş yalnızca telefonda onay verdikten sonra yapılır." },
    { en: "Electric and hybrid cars: same prices, high-voltage-trained technician.", tr: "Elektrikli ve hibrit araçlar: aynı fiyat, yüksek gerilim eğitimli teknisyen." },
  ],
};

export function ServicesPage() {
  const { t, locale } = useJob();
  const { intl, labels } = copyFor(locale);
  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="ruled" breadcrumb={[{ label: "Gearline", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.picker)} className="pt-4! pb-24">
        <Container>
          <ServicePicker mode="full" headingId="gl-jobcard-services" />
          <ul className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-small text-fg-muted @3xl:flex-row @3xl:gap-8">
            {c.notes.map((n) => (
              <li key={n.en} className="flex items-baseline gap-2">
                <span aria-hidden className="size-1.5 shrink-0 translate-y-[-1px] bg-accent" />
                {t(n)}
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
