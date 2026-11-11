"use client";

import * as React from "react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { useQuote } from "./quote-provider";
import { QuoteCalculator } from "./quote-calculator";
import { copyFor } from "./content";

const c = {
  crumb: { en: "Get a quote", tr: "Teklif al" },
  title: { en: "Your price in *five questions*", tr: "*Beş soruda* fiyatınız" },
  lead: { en: "The range updates with every answer. Nothing is booked until you confirm the fixed price on the phone.", tr: "Aralık her cevapla güncellenir. Sabit fiyatı telefonda onaylayana kadar hiçbir şey kesinleşmez." },
};

export function QuotePage() {
  const { t, locale } = useQuote();
  const { intl, labels } = copyFor(locale);
  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="simple" breadcrumb={[{ label: "Tidyframe", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.crumb)} className="pt-4! pb-24">
        <Container>
          <QuoteCalculator />
        </Container>
      </Section>
    </>
  );
}
