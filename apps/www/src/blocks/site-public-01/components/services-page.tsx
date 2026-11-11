import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, services, type SiteLocale } from "./content";
import { ServiceFinder } from "./service-finder";

/** Services A–Z: page intro with breadcrumb, then the searchable, filterable list. */
export function ServicesPage({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const online = services.filter((s) => s.channels.includes("online")).length;
  return (
    <>
      <PageIntro
        locale={intl}
        labels={labels}
        variant="ruled"
        breadcrumb={[{ label: t({ en: "Home", tr: "Ana sayfa" }), href: sitePageHref("home") }, { label: t({ en: "Services A–Z", tr: "Hizmetler A–Z" }) }]}
        title={t({ en: "Services A–Z", tr: "Hizmetler A–Z" })}
        lead={t({
          en: `What each service needs, what it costs and how long it takes. ${online} of ${services.length} can be started online, any time.`,
          tr: `Her hizmet için gerekenler, ücreti ve süresi. ${services.length} hizmetin ${online} tanesine istediğiniz an çevrimiçi başlayabilirsiniz.`,
        })}
      />
      <Section aria-label={t({ en: "Service finder", tr: "Hizmet bulucu" })} theme={{ rhythm: "tight" }} className="pt-8">
        <Container>
          <ServiceFinder locale={locale} />
        </Container>
      </Section>
    </>
  );
}
