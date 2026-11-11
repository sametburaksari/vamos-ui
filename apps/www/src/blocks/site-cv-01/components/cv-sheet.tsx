import { cn } from "@vamos-ui/react";
import { copyFor, education, EMAIL, GITHUB, jobs, PHONE, profile, projects, skills, spoken, WEBSITE, type SiteLocale } from "./content";

export interface CvSheetProps {
  locale: SiteLocale;
  /** Rendered only for print (the home page carries one so ⌘P prints the CV, not the site). */
  printOnly?: boolean;
  className?: string;
}

/** Display form of a URL: no scheme, no trailing slash. */
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const tel = (e164: string) => e164.replace(/^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/, "+90 $1 $2 $3 $4");

/**
 * The CV as one sheet of A4 paper — the print-perfect mode. Always light (paper is paper, also
 * in dark mode), a 2-column grid that collapses on narrow screens, `break-inside: avoid` on
 * every entry, and an `@page` rule for A4 with 12 mm margins. Links print as their text, which
 * is the address itself, so the PDF stays useful on paper.
 */
export function CvSheet({ locale, printOnly, className }: CvSheetProps) {
  const { t, ym, span } = copyFor(locale);
  const H = ({ children }: { children: React.ReactNode }) => <h2 className="mb-2 border-b border-fg pb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-fg">{children}</h2>;
  const Title = printOnly ? "p" : "h1";

  return (
    <article
      data-cv-sheet=""
      aria-label={printOnly ? undefined : t({ en: "Curriculum vitae", tr: "Özgeçmiş" })}
      className={cn("light @container text-fg [background:linear-gradient(var(--surface),var(--surface)),var(--scene)] [--accent-ink:var(--accent-ink-light)]", printOnly ? "hidden print:block" : "print:shadow-none", className)}
    >
      <style>{"@media print{@page{size:A4;margin:12mm 13mm}html,body{background:none!important}[data-cv-sheet]{font-size:9.6pt;line-height:1.38}[data-cv-sheet] li,[data-cv-sheet] section{break-inside:avoid}}"}</style>
      <header className="flex flex-col gap-3 border-b-2 border-fg pb-4 @xl:flex-row @xl:items-end @xl:justify-between">
        <div>
          <Title className="text-[1.75rem] font-[680] leading-none tracking-[-0.03em] print:text-[22pt]">{profile.name}</Title>
          <p className="mt-1.5 text-small text-fg-muted print:text-[10pt]">
            <span className="font-medium text-accent-ink">{t(profile.role)}</span> · {t(profile.place)}
          </p>
        </div>
        <ul className="grid gap-0.5 text-[0.8125rem] @xl:text-end print:text-[8.6pt]">
          <li>
            <a href={`mailto:${EMAIL}`} className="hover:underline">{EMAIL}</a>
          </li>
          <li>
            <a href={`tel:${PHONE}`} className="hover:underline">{tel(PHONE)}</a>
          </li>
          <li>
            <a href={WEBSITE} className="hover:underline">{bare(WEBSITE)}</a> · <a href={GITHUB} className="hover:underline">{bare(GITHUB)}</a>
          </li>
        </ul>
      </header>

      <div className="mt-5 grid gap-6 @xl:grid-cols-[minmax(0,1fr)_12.5rem] @xl:gap-8">
        <div className="flex min-w-0 flex-col gap-5">
          <section>
            <H>{t({ en: "Profile", tr: "Profil" })}</H>
            <p className="text-pretty">{t(profile.intro)}</p>
          </section>

          <section>
            <H>{t({ en: "Experience", tr: "Deneyim" })}</H>
            <ol className="flex flex-col gap-3.5">
              {jobs.map((j) => (
                <li key={j.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="font-semibold">
                      {t(j.role)} · {j.company}
                    </p>
                    <p className="font-mono text-[0.75rem] tabular-nums text-fg-muted print:text-[8pt]">
                      {ym(j.from)} – {j.to ? ym(j.to) : t({ en: "present", tr: "halen" })}
                      <span className="sr-only"> ({span(j.from, j.to)})</span>
                    </p>
                  </div>
                  <p className="text-[0.8125rem] text-fg-muted print:text-[8.6pt]">
                    {t(j.about)} · {t(j.place)}
                  </p>
                  <ul className="mt-1 list-disc ps-4 marker:text-fg-subtle">
                    {j.points.map((p) => (
                      <li key={p.en} className="text-pretty">{t(p)}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <H>{t({ en: "Selected projects", tr: "Seçili projeler" })}</H>
            <ul className="flex flex-col gap-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <span className="font-semibold">{t(p.title)}</span> <span className="font-mono text-[0.75rem] text-fg-muted">{p.year}</span>
                  <span className="block text-[0.8125rem] text-fg-muted print:text-[8.6pt]">{t(p.outcome)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <section>
            <H>{t({ en: "Skills", tr: "Yetkinlikler" })}</H>
            <dl className="flex flex-col gap-2">
              {skills.map((s) => (
                <div key={s.key}>
                  <dt className="text-[0.75rem] font-semibold print:text-[8.4pt]">{t(s.label)}</dt>
                  <dd className="text-[0.8125rem] text-fg-muted print:text-[8.6pt]">{t(s.value)}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section>
            <H>{t({ en: "Languages", tr: "Diller" })}</H>
            <ul className="text-[0.8125rem] print:text-[8.6pt]">
              {spoken.map((s) => (
                <li key={s.lang.en}>
                  <span className="font-medium">{t(s.lang)}</span> <span className="text-fg-muted">— {t(s.level)}</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <H>{t({ en: "Education", tr: "Eğitim" })}</H>
            <p className="text-[0.8125rem] font-medium print:text-[8.6pt]">{t(education.degree)}</p>
            <p className="text-[0.8125rem] text-fg-muted print:text-[8.6pt]">
              {t(education.school)}, {education.years}
            </p>
          </section>
          <p className="mt-auto text-[0.6875rem] text-fg-muted print:text-[7.4pt]">
            {t({ en: "References on request. Updated November 2026.", tr: "Referanslar talep üzerine. Güncelleme: Kasım 2026." })}
          </p>
        </aside>
      </div>
    </article>
  );
}
