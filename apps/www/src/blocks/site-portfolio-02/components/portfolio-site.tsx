import { Footer, Navbar, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { ADDRESS, copyFor, EMAIL, pagedProjects, PHONE, projectPage, type SiteLocale } from "./content";
import { HomePage } from "./home-page";
import { ProjectPage } from "./project-page";
import { StudioPage } from "./studio-page";

/** Page ids of the shell, home first. */
export const portfolioPages = ["home", ...pagedProjects.map((p) => projectPage(p.id)), "studio"];

const home = (anchor?: string) => sitePageHref("home", anchor);

/**
 * One language version of the Kerte studio site: minimal navbar, home (title-block hero,
 * selected work as captioned plates on the 12-column grid, the project register, practice,
 * awards), one page per project with margin captions, and the studio page.
 */
export function PortfolioSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="inline-flex items-baseline gap-2">
            <span className="font-display text-[1.25rem] font-[500] tracking-[-0.03em]">Kerte</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">{t({ en: "Architects", tr: "Mimarlık" })}</span>
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Work", tr: "İşler" }), href: home("work") },
          { label: t({ en: "Index", tr: "Dizin" }), href: home("index") },
          { label: t({ en: "Practice", tr: "Pratik" }), href: home("practice") },
          { label: t({ en: "Studio", tr: "Stüdyo" }), href: sitePageHref("studio") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: sitePageHref("studio", "contact"), label: t({ en: "New commission", tr: "Yeni iş" }) }, style: "secondary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Kerte Architects — Moda, Istanbul", tr: "Kerte Mimarlık — Moda, İstanbul" })}>
          <HomePage locale={locale} />
        </SiteShellPage>
        {pagedProjects.map((p) => (
          <SiteShellPage key={p.id} id={projectPage(p.id)} title={`${t(p.name)} — Kerte`}>
            <ProjectPage project={p} locale={locale} />
          </SiteShellPage>
        ))}
        <SiteShellPage id="studio" title={t({ en: "Studio — Kerte Architects", tr: "Stüdyo — Kerte Mimarlık" })}>
          <StudioPage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Kerte", href: home() }}
        about={t({ en: "Architects for houses, housing and small public buildings. Moda, Istanbul, since 2011.", tr: "Ev, toplu konut ve küçük kamu yapıları için mimarlar. Moda, İstanbul, 2011’den beri." })}
        columns={[
          { title: t({ en: "Work", tr: "İşler" }), links: pagedProjects.map((p) => ({ href: sitePageHref(projectPage(p.id)), label: t(p.name) })) },
          { title: t({ en: "Studio", tr: "Stüdyo" }), links: [{ href: sitePageHref("studio"), label: t({ en: "People", tr: "Ekip" }) }, { href: sitePageHref("studio", "contact"), label: t({ en: "Contact", tr: "İletişim" }) }, { href: "/jobs", label: t({ en: "Jobs & internships", tr: "İş ve staj" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: ADDRESS }}
        social={[{ network: "instagram", href: "https://instagram.com/kerte.example" }]}
        legalLinks={[
          { href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) },
          { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) },
        ]}
        year={2026}
      />
    </>
  );
}
