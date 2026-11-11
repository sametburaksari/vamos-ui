import { Container, Footer, Navbar, PageIntro, Section, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, EMAIL, PHONE, RSVP_BY, type SiteLocale } from "./content";
import { DetailsPage } from "./details-page";
import { WeddingHome } from "./home";
import { RsvpFlow } from "./rsvp-flow";
import { Sprig } from "./sprig";

export const weddingPages = ["home", "details", "rsvp"];
const home = (anchor?: string) => sitePageHref("home", anchor);
const details = (anchor?: string) => sitePageHref("details", anchor);
const rsvp = sitePageHref("rsvp");

/**
 * One language version of Ece & Daniel's wedding site: a centred monogram navbar, three pages
 * (home, details, RSVP) and a quiet footer. Server component; SiteShell picks page and language.
 */
export function WeddingSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, date, intl, labels } = c;
  const common = { locale: intl, labels };
  return (
    <>
      <Navbar
        {...common}
        variant="split"
        sticky
        wordmark={
          <span className="inline-flex items-baseline gap-1 font-display text-xl tracking-[-0.01em] text-fg">
            E<em className="text-accent-ink">&amp;</em>D
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Our story", tr: "Hikâyemiz" }), href: home("story") },
          { label: t({ en: "Schedule", tr: "Program" }), href: details("schedule") },
          { label: t({ en: "Travel & stay", tr: "Ulaşım" }), href: details("travel") },
          { label: t({ en: "Details", tr: "Ayrıntılar" }), href: details() },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: rsvp, label: "RSVP" }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Ece & Daniel — 12 June 2027, Urla", tr: "Ece & Daniel — 12 Haziran 2027, Urla" })}>
          <WeddingHome c={c} />
        </SiteShellPage>

        <SiteShellPage id="details" title={t({ en: "Details — Ece & Daniel", tr: "Ayrıntılar — Ece & Daniel" })}>
          <DetailsPage c={c} />
        </SiteShellPage>

        <SiteShellPage id="rsvp" title={t({ en: "RSVP — Ece & Daniel", tr: "Katılım — Ece & Daniel" })}>
          <PageIntro
            {...common}
            variant="simple"
            theme={{ rhythm: "tight" }}
            breadcrumb={[{ label: "Ece & Daniel", href: home() }, { label: "RSVP" }]}
            eyebrow={t({ en: `Kindly reply by ${date(RSVP_BY, { day: "numeric", month: "long", year: "numeric" })}`, tr: "Lütfen 1 Nisan 2027’ye kadar yanıtlayın" })}
            title={t({ en: "Will you *join us*?", tr: "Bize *katılır mısınız*?" })}
            lead={t({ en: "Four short steps: find your invitation, tell us who’s coming, choose dinner, and a few last bits. You can change your reply until April.", tr: "Dört kısa adım: davetiyenizi bulun, kimlerin geleceğini söyleyin, yemeği seçin ve birkaç son ayrıntı. Yanıtınızı Nisan’a kadar değiştirebilirsiniz." })}
          />
          <Section anchor="reply" theme={{ rhythm: "tight" }} className="pt-0 pb-24">
            <Container>
              <RsvpFlow locale={locale} />
            </Container>
          </Section>
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="minimal"
        brand={{ name: "Ece & Daniel", href: home() }}
        about={
          <span className="inline-flex items-center gap-3">
            <Sprig className="h-3 w-10 text-accent-ink" />
            {t({ en: "12 June 2027 · Bademli Olive Estate, Urla", tr: "12 Haziran 2027 · Bademli Zeytinliği, Urla" })}
          </span>
        }
        columns={[
          {
            title: t({ en: "The wedding", tr: "Düğün" }),
            links: [
              { href: details("schedule"), label: t({ en: "Schedule", tr: "Program" }) },
              { href: details("travel"), label: t({ en: "Travel & stay", tr: "Ulaşım ve konaklama" }) },
              { href: details("faq"), label: t({ en: "Questions", tr: "Sorular" }) },
              { href: rsvp, label: "RSVP" },
            ],
          },
        ]}
        contact={{ email: EMAIL, phone: PHONE }}
        year={2027}
      />
    </>
  );
}
