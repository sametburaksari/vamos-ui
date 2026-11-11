"use client";

import * as React from "react";
import { Badge } from "@vamos-ui/react";
import { BlockHeading, Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useDesk } from "./desk-provider";
import { copyFor, issues, topics, type SiteLocale } from "./content";
import { SubscribeForm } from "./subscribe-form";

/**
 * One letter as it arrives: issue number in the margin, date and reading time, a drop cap, the
 * pulled sentence in the accent, Nil's sign-off, the subscribe card and older / newer letters.
 */
export function IssuePage({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const { issue, openIssue } = useDesk();
  const idx = issues.findIndex((i) => i.n === issue.n);
  const newer = idx > 0 ? issues[idx - 1] : undefined;
  const older = idx < issues.length - 1 ? issues[idx + 1] : undefined;
  const topic = topics.find((x) => x.id === issue.topic)!;
  const first = React.useRef(true);

  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const h1 = document.getElementById("sd-issue-title");
    h1?.scrollIntoView({ block: "center" });
    h1?.focus({ preventScroll: true });
  }, [issue.n]);

  return (
    <Section>
      <Container>
        <article className="mx-auto grid max-w-[64rem] gap-x-12 lg:grid-cols-[8rem_minmax(0,1fr)]">
          <aside aria-hidden className="hidden lg:block">
            <div className="sticky top-28 font-display text-[5.5rem] leading-[0.8] text-accent-ink">
              <span className="block font-mono text-[11px] tracking-[0.14em] text-fg-muted uppercase">Nº</span>
              {issue.n}
            </div>
          </aside>
          <div className="min-w-0 max-w-[40rem]">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tracking-[0.1em] text-fg-muted uppercase">
              <a href={sitePageHref("archive")} className="rounded-[2px] hover:text-fg focus-ring">
                {t({ en: "Archive", tr: "Arşiv" })}
              </a>
              <span aria-hidden>/</span>
              <span className="lg:hidden">Nº {issue.n} ·</span>
              <time dateTime={issue.date}>{f.date(issue.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</time>
              <span aria-hidden>·</span>
              <span>
                {issue.minutes} {t({ en: "min read", tr: "dk okuma" })}
              </span>
            </p>
            <BlockHeading level={1} size="display-l" id="sd-issue-title" tabIndex={-1} className="mt-5 outline-none">
              {t(issue.title)}
            </BlockHeading>
            <p className="mt-5 text-lead text-fg-muted italic">{t(issue.dek)}</p>
            <div className="mt-6 flex items-center gap-3">
              <Badge tone="outline">{t(topic.name)}</Badge>
              <span className="text-small text-fg-muted">{t({ en: "by Nil Arden", tr: "Nil Arden" })}</span>
            </div>

            <div className="mt-10 flex flex-col gap-6 border-t border-fg/70 pt-10 text-[1.15rem] leading-[1.75] text-fg">
              {issue.body.map((p, i) => (
                <React.Fragment key={i}>
                  <p className={i === 0 ? "first-letter:float-start first-letter:me-3 first-letter:mt-1 first-letter:font-display first-letter:text-[4.6rem] first-letter:leading-[0.8] first-letter:text-accent-ink" : undefined}>{t(p)}</p>
                  {i === 2 && issue.pull ? (
                    <blockquote className="my-4 border-s-4 border-accent ps-6 font-display text-[1.9rem] leading-[1.15] text-fg italic">{t(issue.pull)}</blockquote>
                  ) : null}
                </React.Fragment>
              ))}
              <p className="font-display text-[1.6rem] text-fg italic">— Nil</p>
              {issue.body.length < 3 ? (
                <p className="rounded-ui border border-dashed border-line p-4 text-small text-fg-muted">
                  {t({ en: "This is the opening of the letter as it appears in the archive preview. The full text went to readers on the date above.", tr: "Bu, mektubun arşiv önizlemesindeki girişidir. Tam metin yukarıdaki tarihte okurlara gitti." })}
                </p>
              ) : null}
            </div>

            <section aria-labelledby="sd-issue-sub" className="mt-14 rounded-ui-lg bg-surface-2 p-6 sm:p-8">
              <h2 id="sd-issue-sub" className="font-display text-[1.8rem] leading-tight text-fg">
                {t({ en: "Get the next one on Sunday", tr: "Sıradakini pazar günü alın" })}
              </h2>
              <p className="mt-2 mb-6 text-small text-fg-muted">{t({ en: "One letter every second Sunday. Free, no tracking.", tr: "İki pazarda bir mektup. Ücretsiz, izleme yok." })}</p>
              <SubscribeForm locale={locale} tone="card" idPrefix={`sd-issue-${locale}`} />
            </section>

            <nav aria-label={t({ en: "More letters", tr: "Diğer mektuplar" })} className="mt-12 grid gap-px border-y border-fg/70 bg-line sm:grid-cols-2">
              {older ? (
                <button type="button" onClick={() => openIssue(older.n)} className="flex flex-col gap-1 bg-scene py-5 text-start focus-ring sm:pe-6">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-fg-muted uppercase">
                    <ArrowLeft aria-hidden className="size-3.5 rtl:rotate-180" /> {t({ en: "Older", tr: "Daha eski" })} · Nº {older.n}
                  </span>
                  <span className="font-display text-[1.25rem] text-fg">{t(older.title)}</span>
                </button>
              ) : (
                <span className="bg-scene" />
              )}
              {newer ? (
                <button type="button" onClick={() => openIssue(newer.n)} className="flex flex-col items-end gap-1 bg-scene py-5 text-end focus-ring sm:ps-6">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-fg-muted uppercase">
                    {t({ en: "Newer", tr: "Daha yeni" })} · Nº {newer.n} <ArrowRight aria-hidden className="size-3.5 rtl:rotate-180" />
                  </span>
                  <span className="font-display text-[1.25rem] text-fg">{t(newer.title)}</span>
                </button>
              ) : null}
            </nav>
          </div>
        </article>
      </Container>
    </Section>
  );
}
