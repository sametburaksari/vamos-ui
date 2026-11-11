"use client";

import { Button } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { useBox } from "./box-provider";
import { copyFor, frequencies, priceFor, sizes, type SiteLocale } from "./content";
import { PlanMatrix } from "./plan-matrix";

/** Home version of the builder: the price grid and one line that carries the choice to the plans page. */
export function HomePicker({ locale }: { locale: SiteLocale }) {
  const { t, tl } = copyFor(locale);
  const { plan } = useBox();
  const size = sizes.find((s) => s.id === plan.size)!;
  const freq = frequencies.find((f) => f.id === plan.freq)!;
  return (
    <div>
      <PlanMatrix locale={locale} idPrefix="bx-home" />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-small text-fg-muted" aria-live="polite">
          <span className="font-medium text-fg">{t(size.name)}</span>, {t(freq.name).toLocaleLowerCase(locale === "tr" ? "tr" : "en")} — <span className="font-medium text-fg tabular">{tl(priceFor(plan.size, plan.freq))}</span> {t({ en: "per delivery", tr: "teslimat başına" })}
        </p>
        <Button asChild variant="primary" size="lg">
          <a href={sitePageHref("plans")}>
            {t({ en: "Choose roast and grind", tr: "Kavrum ve öğütümü seçin" })}
            <ArrowRight aria-hidden className="rtl:rotate-180" />
          </a>
        </Button>
      </div>
    </div>
  );
}
