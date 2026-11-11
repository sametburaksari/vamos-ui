import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ProgressTimeline } from "./progress-timeline";
import { HazardRule, ProjectCard } from "./home-parts";
import { AS_OF, copyFor, fill, monthLabel, projectEnd, projects, projectStart, statusName, typeName, type SiteLocale } from "./content";

const head = {
  eyebrow: { en: "Progress timeline", tr: "İlerleme çizelgesi" },
  title: { en: "Drag through the build", tr: "Yapım sürecinde gezinin" },
  lead: { en: "Planned phases against the site diary. Months after {today} are our forecast.", tr: "Planlanan aşamalar ve şantiye günlüğü. {today} sonrası aylar tahminimizdir." },
};

/** One project: intro with photo, key facts, the progress timeline and two other projects. */
export function ProjectPage({ locale, slug }: { locale: SiteLocale; slug: string }) {
  const { t, intl, labels } = copyFor(locale);
  const p = projects.find((x) => x.slug === slug)!;
  const others = projects.filter((x) => x.slug !== slug).slice(0, 2);
  const facts = [
    { label: t({ en: "Status", tr: "Durum" }), value: t(statusName[p.status]) },
    { label: t({ en: "Type", tr: "Tür" }), value: t(typeName[p.type]) },
    { label: t({ en: "Client", tr: "İşveren" }), value: t(p.client) },
    { label: t({ en: "Contract value", tr: "Sözleşme bedeli" }), value: t(p.value) },
    { label: t({ en: "Gross area", tr: "Brüt alan" }), value: locale === "tr" ? p.area.replace(",", ".") : p.area },
    { label: t({ en: "Programme", tr: "Program" }), value: `${monthLabel(projectStart(p), locale)} – ${monthLabel(projectEnd(p), locale)}` },
    ...p.facts.map((f) => ({ label: t(f.label), value: t(f.value) })),
  ];
  return (
    <>
      <PageIntro
        locale={intl}
        labels={labels}
        variant="with-media"
        breadcrumb={[{ label: "Stonebridge", href: sitePageHref("home") }, { label: t({ en: "Projects", tr: "Projeler" }), href: sitePageHref("projects") }, { label: p.name }]}
        eyebrow={t(p.place)}
        title={p.name}
        lead={t(p.summary)}
        media={{ ...p.photo, alt: t(p.photo.alt) }}
      />
      <Section aria-label={t({ en: "Key facts", tr: "Temel bilgiler" })} theme={{ rhythm: "tight" }}>
        <Container>
          <dl className="grid border-t-2 border-fg @2xl:grid-cols-2 @5xl:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="flex flex-col gap-1 border-b border-line py-4 @2xl:pe-8">
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">{f.label}</dt>
                <dd className="text-body text-fg">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>
      <Section aria-labelledby={`sb-tl-${slug}`} theme={{ surface: "surface-2" }} anchor="timeline">
        <Container>
          <div className="mb-10 flex max-w-[60ch] flex-col gap-3">
            <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-fg-muted">{t(head.eyebrow)}</p>
            <h2 id={`sb-tl-${slug}`} className="font-display text-display-l uppercase leading-[0.95] text-fg [font-weight:var(--display-weight)]">
              {t(head.title)}
            </h2>
            <p className="text-body text-fg-muted">{fill(t(head.lead), { today: monthLabel(AS_OF, locale, true) })}</p>
          </div>
          <ProgressTimeline locale={locale} slug={slug} />
        </Container>
      </Section>
      <HazardRule />
      <Section aria-labelledby={`sb-more-${slug}`}>
        <Container>
          <h2 id={`sb-more-${slug}`} className="mb-10 font-display text-display-m uppercase text-fg [font-weight:var(--display-weight)]">
            {t({ en: "More projects", tr: "Diğer projeler" })}
          </h2>
          <div className="grid gap-10 @3xl:grid-cols-2">
            {others.map((o) => (
              <ProjectCard key={o.slug} p={o} locale={locale} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
