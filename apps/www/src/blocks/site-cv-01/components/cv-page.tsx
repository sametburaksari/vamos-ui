import { ArrowLeft } from "lucide-react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, type SiteLocale } from "./content";
import { CvSheet } from "./cv-sheet";
import { PrintButton } from "./print-button";

/**
 * The printable CV: a slim toolbar over a desk-coloured backdrop and the CV as one sheet of A4.
 * On screen the sheet keeps paper proportions from 52rem up; when printed only the sheet is
 * left, at A4 with 12 mm margins.
 */
export function CvPage({ locale, fileName }: { locale: SiteLocale; fileName: string }) {
  const { t } = copyFor(locale);
  return (
    <main id="content" className="@container min-h-dvh bg-surface-2 print:min-h-0 print:bg-transparent">
      <div className="vb-container flex flex-wrap items-center justify-between gap-3 py-4 print:hidden">
        <a href={sitePageHref("home")} className="inline-flex items-center gap-2 rounded-[3px] text-small text-fg-muted hover:text-fg focus-ring">
          <ArrowLeft aria-hidden className="size-4" />
          {t({ en: "Back to the site", tr: "Siteye dön" })}
        </a>
        <div className="flex items-center gap-4">
          <p className="hidden font-mono text-[0.75rem] text-fg-muted @2xl:block">{t({ en: "A4 · 1 page · updated Nov 2026", tr: "A4 · 1 sayfa · güncelleme Kas 2026" })}</p>
          <PrintButton variant="primary" size="sm" fileName={fileName} hint={t({ en: "Opens the print dialog; choose “Save as PDF”.", tr: "Yazdırma penceresini açar; “PDF olarak kaydet”i seçin." })}>
            {t({ en: "Download PDF", tr: "PDF indir" })}
          </PrintButton>
        </div>
      </div>
      <div className="vb-container pb-16 print:p-0">
        <CvSheet
          locale={locale}
          className="vm-enter vm-enter-media mx-auto w-full max-w-[52rem] rounded-[2px] px-5 py-7 shadow-[var(--popover-shadow)] @3xl:min-h-[calc(52rem*1.4142)] @3xl:px-[3.25rem] @3xl:py-[3rem] print:max-w-none print:rounded-none print:p-0 print:shadow-none"
        />
      </div>
    </main>
  );
}
