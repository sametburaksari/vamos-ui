"use client";

import * as React from "react";
import { Badge, Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@vamos-ui/react";
import { BlockHeading, Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ApplyForm } from "./apply-form";
import { useCareers } from "./careers-provider";
import { JobRow } from "./job-board";
import { copyFor, jobs, kinds, places, process, teams, type L, type SiteLocale } from "./content";

function List({ title, items, t }: { title: string; items: L[]; t: (v: L) => string }) {
  if (!items.length) return null;
  return (
    <section className="mt-10">
      <h2 className="font-display text-[1.45rem] leading-tight text-fg">{title}</h2>
      <ul className="mt-4 flex flex-col">
        {items.map((it, i) => (
          <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2 border-t border-line py-3 text-body text-fg">
            <span aria-hidden className="pt-1 font-mono text-[11px] text-fg-muted tabular">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{t(it)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * One job post: breadcrumb, title, a ruled fact strip (team, places, contract, band, closing
 * date), what you will do / need / nice to have, this role's process, and the apply form in a
 * sticky column on wide screens. Followed by other roles in the same team.
 */
export function JobDetail({ locale }: { locale: SiteLocale }) {
  const { t, f, band, k } = copyFor(locale);
  const { job } = useCareers();
  const team = teams.find((x) => x.id === job.team)!;
  const related = jobs.filter((j) => j.team === job.team && j.id !== job.id).slice(0, 3);
  const firstRender = React.useRef(true);

  // Opening another role from this page: back to the top, focus on the new title.
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const h1 = document.getElementById("np-job-title");
    h1?.scrollIntoView({ block: "start" });
    h1?.focus({ preventScroll: true });
  }, [job.id]);

  const facts: { label: string; value: React.ReactNode }[] = [
    { label: t({ en: "Team", tr: "Ekip" }), value: t(team.name) },
    { label: t({ en: "Where", tr: "Nerede" }), value: job.places.map((p) => t(places[p].name)).join(" / ") },
    { label: t({ en: "Contract", tr: "Sözleşme" }), value: t(kinds[job.kind]) },
    { label: t({ en: "Band, yearly gross", tr: "Bant, yıllık brüt" }), value: job.salary[0] === job.salary[1] ? `${k(job.salary[0])}` : band(job.salary) },
    { label: t({ en: "Apply by", tr: "Son başvuru" }), value: f.date(job.closes, { day: "numeric", month: "long", year: "numeric" }) },
  ];

  return (
    <>
      <Section theme={{ rhythm: "tight" }} className="border-b border-line">
        <Container>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={sitePageHref("home")}>{t({ en: "Careers", tr: "Kariyer" })}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={sitePageHref("jobs")}>{t({ en: "Open roles", tr: "Açık pozisyonlar" })}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{job.ref}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Badge tone="outline" shape="square" className="font-mono">
              {job.ref}
            </Badge>
            <Badge tone="neutral">{t(job.level)}</Badge>
          </div>
          <BlockHeading level={1} size="display-l" id="np-job-title" tabIndex={-1} className="mt-4 max-w-[22ch] outline-none">
            {t(job.title)}
          </BlockHeading>
          <dl className="mt-10 grid grid-cols-2 border-t-2 border-fg sm:grid-cols-3 lg:grid-cols-5">
            {facts.map((x) => (
              <div key={x.label} className="border-b border-line py-3 pe-4 lg:border-b-0">
                <dt className="font-mono text-[11px] tracking-[0.06em] text-fg-muted uppercase">{x.label}</dt>
                <dd className="mt-1 text-small font-medium text-fg">{x.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-16">
            <article className="min-w-0 max-w-[68ch]">
              <p className="text-lead text-fg">{t(job.summary)}</p>
              <List title={t({ en: "What you will do", tr: "Neler yapacaksınız" })} items={job.doing} t={t} />
              <List title={t({ en: "What you need", tr: "Aradıklarımız" })} items={job.need} t={t} />
              <List title={t({ en: "Nice to have", tr: "Olursa güzel" })} items={job.nice} t={t} />
              <section className="mt-10">
                <h2 className="font-display text-[1.45rem] leading-tight text-fg">{t({ en: "How we hire for this role", tr: "Bu pozisyon için süreç" })}</h2>
                <p className="mt-2 text-small text-fg-muted">{t({ en: `Hiring manager: ${job.hiringManager}. Every step is a conversation, not a test you fail silently.`, tr: `İşe alım yöneticisi: ${job.hiringManager}. Her adım bir görüşmedir, sessizce kaldığınız bir sınav değil.` })}</p>
                <ol className="mt-5 flex flex-col">
                  {process.map((p, i) => (
                    <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-2 border-t border-line py-3">
                      <span className="font-mono text-[11px] text-fg-muted tabular">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-small font-medium text-fg">{t(p.title)}</span>
                      <span className="font-mono text-[11px] text-fg-muted">{t(p.duration)}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </article>
            <aside aria-label={t({ en: "Application", tr: "Başvuru" })} className="lg:sticky lg:top-24 lg:self-start">
              <ApplyForm job={job} locale={locale} />
            </aside>
          </div>
        </Container>
      </Section>

      {related.length ? (
        <Section theme={{ surface: "surface-2" }} headingId="np-related-title">
          <Container>
            <h2 id="np-related-title" className="font-display text-display-m text-fg">
              {t({ en: `More in ${t(team.name)}`, tr: `${t(team.name)} ekibinde diğerleri` })}
            </h2>
            <ul className="mt-6 border-t-2 border-fg">
              {related.map((j) => (
                <JobRow key={j.id} job={j} locale={locale} compact />
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
