import { Breadcrumb } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { copyFor, pagedProjects, projectPage, statuses, typologies, type Project, type SiteLocale } from "./content";
import { ProjectStory } from "./project-story";

/** One project: title block with the facts, the story with margin captions, the next project. */
export function ProjectPage({ project: p, locale }: { project: Project; locale: SiteLocale }) {
  const { t, intl } = copyFor(locale);
  const nf = new Intl.NumberFormat(intl);
  const at = pagedProjects.findIndex((x) => x.id === p.id);
  const next = pagedProjects[(at + 1) % pagedProjects.length]!;
  const facts: [string, string][] = [
    [t({ en: "Location", tr: "Yer" }), t(p.place)],
    [t({ en: "Typology", tr: "Tipoloji" }), t(typologies.find((x) => x.id === p.typology)!.label)],
    [t({ en: "Client", tr: "Müşteri" }), t(p.client)],
    [t({ en: "Gross area", tr: "Brüt alan" }), `${nf.format(p.area)} m²`],
    [t({ en: "Status", tr: "Durum" }), `${t(statuses[p.status])}, ${p.year}`],
    [t({ en: "Team", tr: "Ekip" }), p.team],
  ];
  const headingId = `kt-${p.id}`;

  return (
    <>
      <Section aria-labelledby={headingId} theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <Breadcrumb
            className="font-mono text-[11px] uppercase tracking-[0.12em]"
            items={[
              { label: "Kerte", href: sitePageHref("home") },
              { label: t({ en: "Work", tr: "İşler" }), href: sitePageHref("home", "work") },
              { label: t(p.name) },
            ]}
          />
          <div className="mt-8 grid gap-x-5 gap-y-8 border-t border-fg pt-4 @3xl:grid-cols-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-ink @3xl:col-span-2">{p.no}</p>
            <div className="@3xl:col-span-6">
              <h1 id={headingId} tabIndex={-1} className="font-display text-display-xl text-balance outline-none">
                {t(p.name)}
              </h1>
              {p.intro ? <p className="mt-6 max-w-[56ch] text-pretty text-lead text-fg-muted">{t(p.intro)}</p> : null}
            </div>
            <dl className="self-end border border-fg text-small @3xl:col-span-4">
              {facts.map(([k, v], i) => (
                <div key={k} className={`grid grid-cols-[7rem_minmax(0,1fr)] gap-3 px-3 py-2 ${i > 0 ? "border-t border-line" : ""}`}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">{k}</dt>
                  <dd className="text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </Section>

      <Section aria-label={t({ en: "Project story", tr: "Proje hikâyesi" })} theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <ProjectStory project={p} locale={locale} />
        </Container>
      </Section>

      <Section aria-label={t({ en: "Next project", tr: "Sonraki proje" })} theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <a
            href={sitePageHref(projectPage(next.id))}
            className="group grid gap-x-5 gap-y-2 border-y border-fg py-6 focus-ring @3xl:grid-cols-12 @3xl:items-baseline"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted @3xl:col-span-2">{t({ en: "Next project", tr: "Sonraki proje" })}</span>
            <span className="font-display text-display-m group-hover:text-accent-ink @3xl:col-span-8">{t(next.name)}</span>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted @3xl:col-span-2 @3xl:justify-self-end">
              {next.no}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 motion-reduce:transition-none" />
            </span>
          </a>
        </Container>
      </Section>
    </>
  );
}
