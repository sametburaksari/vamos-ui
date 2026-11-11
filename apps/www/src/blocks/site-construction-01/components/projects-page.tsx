"use client";

import * as React from "react";
import { EmptyState, Field, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ProjectCard } from "./home-parts";
import { copyFor, fill, projects, statusName, typeName, type ProjectStatus, type ProjectType, type SiteLocale } from "./content";

const c = {
  crumb: { en: "Projects", tr: "Projeler" },
  title: { en: "Every project, *with its timeline*", tr: "Her proje, *çizelgesiyle*" },
  lead: { en: "Open a project to drag through its build month by month — planned phases against what the site diary recorded.", tr: "Bir projeyi açın ve yapımında ay ay gezinin — planlanan aşamalar ve şantiye günlüğünün kaydettikleri." },
  status: { en: "Status", tr: "Durum" },
  type: { en: "Type", tr: "Tür" },
  all: { en: "All", tr: "Tümü" },
  count: { en: "{n} of {total} projects", tr: "{total} projeden {n} tanesi" },
  none: { en: "No projects match", tr: "Eşleşen proje yok" },
  noneHint: { en: "Try another status or type.", tr: "Başka bir durum veya tür deneyin." },
};

export function ProjectsPage({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const [status, setStatus] = React.useState<"all" | ProjectStatus>("all");
  const [type, setType] = React.useState<"all" | ProjectType>("all");
  const list = projects.filter((p) => (status === "all" || p.status === status) && (type === "all" || p.type === type));
  return (
    <>
      <PageIntro
        locale={intl}
        labels={labels}
        variant="ruled"
        breadcrumb={[{ label: "Stonebridge", href: sitePageHref("home") }, { label: t(c.crumb) }]}
        title={t(c.title)}
        lead={t(c.lead)}
        meta={[
          { label: t({ en: "Delivered since 1994", tr: "1994’ten beri teslim" }), value: t({ en: "61 buildings", tr: "61 bina" }) },
          { label: t({ en: "On site now", tr: "Şu an şantiyede" }), value: t({ en: "2 projects, 410 people", tr: "2 proje, 410 kişi" }) },
        ]}
      />
      <Section aria-label={t(c.crumb)} theme={{ rhythm: "tight" }} className="pt-2! pb-24">
        <Container>
          <div className="mb-10 flex flex-wrap items-end gap-x-8 gap-y-4">
            <Field label={t(c.status)}>
              <ToggleGroup type="single" value={status} onValueChange={(v) => setStatus(v as typeof status)} aria-label={t(c.status)}>
                <ToggleGroupItem value="all">{t(c.all)}</ToggleGroupItem>
                {(["construction", "completed", "planning"] as const).map((s) => (
                  <ToggleGroupItem key={s} value={s}>
                    {t(statusName[s])}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
            <Field label={t(c.type)}>
              <ToggleGroup type="single" value={type} onValueChange={(v) => setType(v as typeof type)} aria-label={t(c.type)}>
                <ToggleGroupItem value="all">{t(c.all)}</ToggleGroupItem>
                {(["residential", "civic", "commercial"] as const).map((s) => (
                  <ToggleGroupItem key={s} value={s}>
                    {t(typeName[s])}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
            <p className="ms-auto font-mono text-xs text-fg-muted" aria-live="polite" data-testid="sb-count">
              {fill(t(c.count), { n: list.length, total: projects.length })}
            </p>
          </div>
          {list.length ? (
            <div className="grid gap-x-8 gap-y-12 @3xl:grid-cols-2">
              {list.map((p) => (
                <ProjectCard key={p.slug} p={p} locale={locale} headingLevel={2} />
              ))}
            </div>
          ) : (
            <EmptyState title={t(c.none)} description={t(c.noneHint)} />
          )}
        </Container>
      </Section>
    </>
  );
}
