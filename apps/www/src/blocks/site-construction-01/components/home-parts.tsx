"use client";

import * as React from "react";
import { Button, Progress } from "@vamos-ui/react";
import { BlockImage, Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AS_OF, copyFor, monthLabel, num, photos, progressAt, projectEnd, projects, statusName, typeName, type Project, type SiteLocale } from "./content";

const c = {
  eyebrow: { en: "Contractor & developer · İstanbul and İzmir", tr: "Yüklenici ve geliştirici · İstanbul ve İzmir" },
  title: { en: "We build to the date on *the board*.", tr: "Panodaki *tarihe* göre inşa ederiz." },
  lead: {
    en: "Homes, civic buildings and careful restorations since 1994. Every live project publishes its progress month by month — the same diary our clients read.",
    tr: "1994’ten beri konut, kamu binası ve özenli restorasyonlar. Süren her proje ilerlemesini ay ay yayımlar — müşterilerimizin okuduğu günlüğün aynısı.",
  },
  projects: { en: "See our projects", tr: "Projelerimizi görün" },
  talk: { en: "Discuss a project", tr: "Bir projeyi konuşalım" },
  board: { en: "Site board · {month}", tr: "Şantiye panosu · {month}" },
  handover: { en: "Handover {month}", tr: "Teslim {month}" },
  progressOf: { en: "{name} progress", tr: "{name} ilerlemesi" },
  open: { en: "Open timeline", tr: "Çizelgeyi aç" },
};

export const projectHref = (slug: string) => sitePageHref(`project-${slug}`);

/** A thin hazard-tape rule: accent and ink stripes. Decorative. */
export function HazardRule({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`h-2 bg-[repeating-linear-gradient(-45deg,var(--accent)_0_14px,var(--fg)_14px_28px)] ${className}`} />;
}

function Emph({ text }: { text: string }) {
  return (
    <>
      {text.split("*").map((p, i) =>
        i % 2 ? (
          <span key={i} className="text-accent-ink">
            {p}
          </span>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  );
}

export function BuildHero({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const live = projects.filter((p) => p.status === "construction");
  return (
    <Section aria-labelledby="sb-hero-title" className="relative overflow-hidden pt-8! pb-0!">
      <Container>
        <div className="grid gap-10 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] @5xl:gap-12">
          <div className="flex flex-col justify-center gap-7 @5xl:py-16">
            <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-fg-muted">{t(c.eyebrow)}</p>
            <h1 id="sb-hero-title" className="font-display text-display-xl uppercase leading-[0.92] text-balance text-fg [font-weight:var(--display-weight)]">
              <Emph text={t(c.title)} />
            </h1>
            <p className="max-w-[48ch] text-lead text-fg-muted">{t(c.lead)}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="primary" size="lg">
                <a href={sitePageHref("projects")}>
                  {t(c.projects)}
                  <ArrowRight aria-hidden className="rtl:rotate-180" />
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href={sitePageHref("home", "contact")}>{t(c.talk)}</a>
              </Button>
            </div>
          </div>
          <div className="relative min-h-[28rem] overflow-hidden rounded-t-ui-lg @5xl:min-h-[40rem]">
            <BlockImage {...photos.slab} alt={t(photos.slab.alt)} priority sizes="(min-width: 1024px) 55vw, 100vw" className="absolute inset-0 size-full" imgClassName="size-full object-cover" />
            <div className="absolute inset-x-3 bottom-3 @md:inset-x-auto @md:start-5 @md:bottom-5 @md:w-[22rem]">
              <div className="surface-popover rounded-ui-lg p-4">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">{t(c.board).replace("{month}", monthLabel(AS_OF, locale, true))}</p>
                <ul className="flex flex-col gap-4">
                  {live.map((p) => {
                    const pr = progressAt(p, AS_OF).overall;
                    return (
                      <li key={p.slug} className="relative flex flex-col gap-1.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <a href={projectHref(p.slug)} className="font-display text-[1.15rem] uppercase leading-tight text-fg after:absolute after:inset-0 focus-ring rounded-[2px]">
                            {p.name}
                          </a>
                          <span className="font-mono text-small tabular text-fg">{num(Math.round(pr * 100), locale)}%</span>
                        </div>
                        <Progress value={pr * 100} size="sm" aria-label={t(c.progressOf).replace("{name}", p.name)} />
                        <span className="font-mono text-[11px] text-fg-muted">
                          {t(p.place)} · {t(c.handover).replace("{month}", monthLabel(projectEnd(p), locale))}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
      <HazardRule />
    </Section>
  );
}

export function ProjectCard({ p, locale, headingLevel = 3 }: { p: Project; locale: SiteLocale; headingLevel?: 2 | 3 }) {
  const { t } = copyFor(locale);
  const pr = progressAt(p, AS_OF).overall;
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="group relative flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-ui">
        <BlockImage {...p.photo} alt={t(p.photo.alt)} aspect="4:3" sizes="(min-width: 1024px) 33vw, 100vw" imgClassName="transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
        <span className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-scene px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-fg shadow-sm">
          <span aria-hidden className={`size-1.5 rounded-full ${p.status === "construction" ? "bg-accent" : p.status === "completed" ? "bg-success" : "bg-fg-muted"}`} />
          {t(statusName[p.status])}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg-muted">
          {t(typeName[p.type])} · {t(p.place)}
        </p>
        <H className="font-display text-h3 uppercase leading-tight text-fg">
          <a href={projectHref(p.slug)} className="after:absolute after:inset-0 focus-ring rounded-[2px]">
            {p.name}
          </a>
        </H>
        <p className="text-small text-fg-muted">{t(p.summary)}</p>
      </div>
      <div className="mt-auto flex items-center gap-3 border-t border-line pt-3">
        <Progress value={pr * 100} size="xs" aria-label={t(c.progressOf).replace("{name}", p.name)} className="flex-1" />
        <span className="font-mono text-xs tabular text-fg">{num(Math.round(pr * 100), locale)}%</span>
        <ArrowUpRight aria-hidden className="size-4 text-fg-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
      </div>
    </article>
  );
}

export function FeaturedProjects({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  return (
    <Section aria-labelledby="sb-featured">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-fg-muted">{t({ en: "Projects", tr: "Projeler" })}</p>
            <h2 id="sb-featured" className="font-display text-display-l uppercase leading-[0.95] text-fg [font-weight:var(--display-weight)]">
              {t({ en: "On site, open book", tr: "Şantiyede, açık defter" })}
            </h2>
          </div>
          <Button asChild variant="secondary">
            <a href={sitePageHref("projects")}>
              {t({ en: "All projects", tr: "Tüm projeler" })}
              <ArrowRight aria-hidden className="rtl:rotate-180" />
            </a>
          </Button>
        </div>
        <div className="grid gap-10 @3xl:grid-cols-2 @5xl:grid-cols-3">
          {projects.slice(0, 3).map((p) => (
            <ProjectCard key={p.slug} p={p} locale={locale} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
