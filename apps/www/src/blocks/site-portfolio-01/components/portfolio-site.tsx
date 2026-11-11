import { Container, Footer, Navbar, Section, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { AboutPage } from "./about-page";
import { copyFor, disciplines, EMAIL, PHONE, projects, type SiteLocale } from "./content";
import { ProjectPage, projectPage } from "./project-page";
import { WorkGrid } from "./work-grid";
import { WorkIndex } from "./work-index";

/** Page ids of the shell, home first. */
export const portfolioPages = ["home", ...projects.map((p) => projectPage(p.id)), "about"];

const home = (anchor?: string) => sitePageHref("home", anchor);
const about = (anchor?: string) => sitePageHref("about", anchor);

/**
 * One language version of the portfolio: split navbar, then home (the name as the hero, a
 * filterable masonry wall with a lightbox, the project index with a cursor-following preview,
 * a short bio), one case-story page per project, and about + contact.
 */
export function PortfolioSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const discipline = (id: string) => t(disciplines.find((d) => d.id === id)!.label);

  const frames = projects.flatMap((p) =>
    p.featured.map((n) => {
      const ph = p.photos[n]!;
      return { id: `${p.id}-${n}`, src: ph.src, width: ph.width, height: ph.height, alt: t(ph.alt), caption: `${p.title} — ${p.year}`, discipline: p.discipline };
    }),
  );

  return (
    <>
      <Navbar
        {...common}
        variant="split"
        sticky
        wordmark="Ilse Marén"
        homeHref={home()}
        items={[
          { label: t({ en: "Work", tr: "İşler" }), href: home("work") },
          { label: t({ en: "Index", tr: "Dizin" }), href: home("index") },
          { label: t({ en: "About", tr: "Hakkında" }), href: about() },
          { label: t({ en: "Contact", tr: "İletişim" }), href: about("contact") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: `mailto:${EMAIL}`, label: t({ en: "Book a shoot", tr: "Çekim planla" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Ilse Marén — photographer", tr: "Ilse Marén — fotoğrafçı" })}>
          {/* Name as the hero: the type is the image. */}
          <Section anchor="top" theme={{ rhythm: "tight" }} className="overflow-hidden">
            <Container size="wide">
              <p className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-eyebrow uppercase tracking-[0.14em] text-fg-muted">
                <span>{t({ en: "Photographer", tr: "Fotoğrafçı" })}</span>
                <span>Rotterdam — Istanbul</span>
                <span className="inline-flex items-center gap-2 text-fg">
                  <span aria-hidden className="size-2 rounded-full bg-accent" />
                  {t({ en: "Booking from January 2027", tr: "Ocak 2027’den itibaren rezervasyon" })}
                </span>
              </p>
              <h1 className="mt-4 font-display text-[clamp(4.5rem,1rem+17.5cqi,19rem)] font-[720] leading-[0.8] tracking-[-0.055em] @3xl:mt-6">
                <span className="block">Ilse</span>
                <span className="block @3xl:ps-[22cqi]">
                  Marén<span className="text-accent-ink">.</span>
                </span>
              </h1>
              <div className="mt-8 grid gap-6 border-t border-fg pt-5 @3xl:mt-12 @3xl:grid-cols-12">
                <p className="max-w-[34ch] text-pretty text-lead text-fg @3xl:col-span-6">
                  {t({
                    en: "Landscapes, buildings and the people who look after them — for magazines, architects and brands that would rather wait for the light.",
                    tr: "Manzaralar, binalar ve onlara bakan insanlar — ışığı beklemeyi tercih eden dergiler, mimarlar ve markalar için.",
                  })}
                </p>
                <dl className="grid grid-cols-3 gap-4 text-small @3xl:col-span-6 @3xl:col-start-7">
                  {[
                    [t({ en: "Projects", tr: "Proje" }), String(projects.length)],
                    [t({ en: "Since", tr: "Başlangıç" }), "2014"],
                    [t({ en: "Formats", tr: "Format" }), "120 · 35 mm"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted">{k}</dt>
                      <dd className="mt-1 font-display text-h3">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Container>
          </Section>

          <Section anchor="work" aria-labelledby="pf-work" theme={{ rhythm: "tight" }}>
            <Container size="wide">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <h2 id="pf-work" className="font-display text-display-m">
                  {t({ en: "Selected work", tr: "Seçili işler" })}
                </h2>
                <p className="font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted">2023 — 2026</p>
              </div>
              <WorkGrid
                frames={frames}
                filterLabel={t({ en: "Filter by discipline", tr: "Disipline göre süz" })}
                filters={[{ id: "all", label: t({ en: "All", tr: "Tümü" }) }, ...disciplines.map((d) => ({ id: d.id, label: t(d.label) }))]}
              />
            </Container>
          </Section>

          <Section anchor="index" aria-labelledby="pf-index">
            <Container size="wide">
              <div className="mb-8 grid gap-4 @3xl:grid-cols-12">
                <h2 id="pf-index" className="font-display text-display-m @3xl:col-span-5">
                  {t({ en: "Index", tr: "Dizin" })}
                </h2>
                <p className="max-w-[46ch] text-fg-muted @3xl:col-span-6 @3xl:col-start-7">
                  {t({ en: "Every commissioned and personal series since 2023. Hover a row to see its cover; open it for the whole story.", tr: "2023’ten bu yana tüm sipariş ve kişisel seriler. Kapağını görmek için bir satırın üzerine gelin; hikâyenin tamamı için açın." })}
                </p>
              </div>
              <WorkIndex
                label={t({ en: "Projects", tr: "Projeler" })}
                columns={[t({ en: "No.", tr: "No." }), t({ en: "Project", tr: "Proje" }), t({ en: "Client", tr: "Müşteri" }), t({ en: "Discipline", tr: "Disiplin" }), t({ en: "Year", tr: "Yıl" })]}
                rows={projects.map((p, i) => {
                  const cover = p.photos[0]!;
                  return {
                    id: p.id,
                    no: String(i + 1).padStart(2, "0"),
                    title: p.title,
                    clientType: t(p.clientType),
                    discipline: discipline(p.discipline),
                    year: p.year,
                    href: sitePageHref(projectPage(p.id)),
                    image: { src: cover.src, alt: t(cover.alt), width: cover.width, height: cover.height },
                  };
                })}
              />
            </Container>
          </Section>

          <Section theme={{ surface: "surface-2" }} aria-labelledby="pf-bio">
            <Container size="wide" className="grid gap-8 @3xl:grid-cols-12">
              <h2 id="pf-bio" className="font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted @3xl:col-span-3">
                {t({ en: "In short", tr: "Kısaca" })}
              </h2>
              <div className="@3xl:col-span-9">
                <p className="max-w-[28ch] text-balance font-display text-display-m">
                  {t({ en: "I go back to the same place until it stops posing.", tr: "Bir yer poz vermeyi bırakana kadar oraya geri dönerim." })}
                </p>
                <p className="mt-6 max-w-[60ch] text-fg-muted">
                  {t({
                    en: "Twelve years of editorial and commissioned work, four solo shows, clients in architecture, publishing and outdoor gear. Working in Türkiye, the Netherlands and anywhere reachable on foot.",
                    tr: "Yayın ve sipariş işlerinde on iki yıl, dört kişisel sergi; mimarlık, yayıncılık ve outdoor ekipman alanlarında müşteriler. Türkiye’de, Hollanda’da ve yürüyerek ulaşılabilen her yerde çalışıyor.",
                  })}
                </p>
                <a href={about()} className="mt-8 inline-flex items-center gap-2 border-b border-fg pb-1 font-medium hover:border-accent hover:text-accent-ink focus-ring rounded-[2px]">
                  {t({ en: "About, clients and contact", tr: "Hakkında, müşteriler ve iletişim" })} <span aria-hidden>→</span>
                </a>
              </div>
            </Container>
          </Section>
        </SiteShellPage>

        {projects.map((p) => (
          <SiteShellPage key={p.id} id={projectPage(p.id)} title={`${p.title} — Ilse Marén`}>
            <ProjectPage project={p} locale={locale} />
          </SiteShellPage>
        ))}

        <SiteShellPage id="about" title={t({ en: "About and contact — Ilse Marén", tr: "Hakkında ve iletişim — Ilse Marén" })}>
          <AboutPage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="wordmark"
        brand={{ name: "Ilse Marén", href: home() }}
        about={t({ en: "Photographer. Landscapes, architecture and portraits, on commission and for print.", tr: "Fotoğrafçı. Sipariş ve baskı için manzara, mimari ve portre." })}
        columns={[
          { title: t({ en: "Site", tr: "Site" }), links: [{ href: home("work"), label: t({ en: "Work", tr: "İşler" }) }, { href: home("index"), label: t({ en: "Index", tr: "Dizin" }) }, { href: about(), label: t({ en: "About", tr: "Hakkında" }) }] },
          { title: t({ en: "Representation", tr: "Temsil" }), links: [{ href: "mailto:agent@example.com", label: "Norte Agency, Rotterdam" }, { href: "/prints", label: t({ en: "Print sales", tr: "Baskı satışı" }) }] },
        ]}
        contact={{ email: EMAIL, phone: PHONE }}
        social={[{ network: "instagram", href: "https://instagram.com/example" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/licensing", label: t({ en: "Image licensing", tr: "Görsel lisansı" }) }]}
        year={2026}
      />
    </>
  );
}
