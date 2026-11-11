import { DescriptionList } from "@vamos-ui/react";
import { BlockImage, Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { Gallery } from "@vamos-ui/react/media";
import { copyFor, disciplines, projects, type Project, type SiteLocale } from "./content";

/** Page id of a project's case story. */
export const projectPage = (id: string) => `work-${id}`;

/**
 * A project's case story: ruled intro with the facts, the cover across the page, brief /
 * approach / result as three numbered columns, the rest of the series as a masonry wall that opens
 * in the lightbox, credits, and a large link to the next project.
 */
export function ProjectPage({ project, locale }: { project: Project; locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const i = projects.findIndex((p) => p.id === project.id);
  const next = projects[(i + 1) % projects.length]!;
  const discipline = t(disciplines.find((d) => d.id === project.discipline)!.label);
  const [cover, ...rest] = project.photos;
  const alt = (p: Project["photos"][number]) => t(p.alt);

  const story = [
    { label: t({ en: "Brief", tr: "Talep" }), text: t(project.brief) },
    { label: t({ en: "Approach", tr: "Yaklaşım" }), text: t(project.approach) },
    { label: t({ en: "Result", tr: "Sonuç" }), text: t(project.result) },
  ];

  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        breadcrumb={[{ label: t({ en: "Work", tr: "İşler" }), href: sitePageHref("home", "work") }, { label: project.title }]}
        eyebrow={`${String(i + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`}
        title={project.title}
        lead={t(project.summary)}
        meta={[
          { label: t({ en: "Client", tr: "Müşteri" }), value: `${project.client} · ${t(project.clientType)}` },
          { label: t({ en: "Discipline", tr: "Disiplin" }), value: `${discipline}, ${project.year}` },
          { label: t({ en: "Place", tr: "Yer" }), value: t(project.place) },
        ]}
      />

      <Container size="wide" className="@container">
        <BlockImage {...cover!} alt={alt(cover!)} aspect="21:9" priority sizes="(min-width: 90rem) 90rem, 100vw" className="rounded-none" />
      </Container>

      <Section aria-label={t({ en: "Case story", tr: "Proje hikâyesi" })}>
        <Container>
          <ol className="grid gap-10 @3xl:grid-cols-3 @3xl:gap-8">
            {story.map((s, n) => (
              <li key={s.label} className="border-t border-fg pt-4">
                <p className="mb-4 flex items-baseline gap-3 font-mono text-eyebrow uppercase tracking-[0.12em]">
                  <span className="text-accent-ink">{String(n + 1).padStart(2, "0")}</span>
                  <span>{s.label}</span>
                </p>
                <p className="text-pretty text-lead leading-[1.45] text-fg">{s.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section anchor="frames" theme={{ rhythm: "tight" }} aria-labelledby={`pf-frames-${project.id}`}>
        <Container size="wide">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-t border-fg pt-4">
            <h2 id={`pf-frames-${project.id}`} className="font-display text-display-m">
              {t({ en: `${rest.length} more frames`, tr: `${rest.length} kare daha` })}
            </h2>
            <p className="font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted">{t({ en: "From the series · click to enlarge", tr: "Seriden · büyütmek için tıklayın" })}</p>
          </div>
          <Gallery
            items={rest.map((p, n) => ({ id: `${project.id}-${n}`, src: p.src, width: p.width, height: p.height, alt: alt(p), caption: t(project.place) }))}
            layout="masonry"
            columns={{ base: 1, sm: 2, lg: 3 }}
            captions="below"
            gap="lg"
            rounded="none"
            lightbox={{ backdrop: "solid", chrome: "minimal", thumbnails: true }}
            label={t({ en: `${project.title}, more frames`, tr: `${project.title}, diğer kareler` })}
          />
        </Container>
      </Section>

      <Section theme={{ rhythm: "tight" }} aria-label={t({ en: "Credits", tr: "Künye" })}>
        <Container className="grid gap-6 @3xl:grid-cols-12">
          <h2 className="font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted @3xl:col-span-4">{t({ en: "Credits", tr: "Künye" })}</h2>
          <DescriptionList className="@3xl:col-span-8" labelWidth="12rem" items={project.credits.map((c, n) => ({ key: String(n), label: t(c.label), value: t(c.value) }))} />
        </Container>
      </Section>

      <Section theme={{ surface: "surface-2" }}>
        <Container>
          <a href={sitePageHref(projectPage(next.id))} className="group block rounded-ui py-4 focus-ring">
            <span className="font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted">{t({ en: "Next project", tr: "Sonraki proje" })}</span>
            <span className="mt-3 flex items-end justify-between gap-6">
              <span className="font-display text-display-xl transition-transform duration-300 group-hover:translate-x-2 motion-reduce:transition-none">{next.title}</span>
              <span aria-hidden className="mb-2 hidden font-mono text-small text-accent-ink @2xl:block">
                {String(((i + 1) % projects.length) + 1).padStart(2, "0")} →
              </span>
            </span>
          </a>
        </Container>
      </Section>
    </>
  );
}
