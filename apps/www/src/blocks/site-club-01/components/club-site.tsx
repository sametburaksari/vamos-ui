import { Button } from "@vamos-ui/react";
import { BlogList, Container, Cta, Footer, MediaText, Navbar, Section, SectionHeader, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { CLUB, copyFor, EMAIL, news, photos, PHONE, scorers, standings, type SiteLocale } from "./content";
import { Crest, Hoops } from "./crest";
import { FixturesPage } from "./fixtures-page";
import { ClubHero } from "./hero";
import { LeagueTable } from "./league-table";
import { MembershipPage } from "./membership-page";

const home = (anchor?: string) => sitePageHref("home", anchor);
const fixtures = sitePageHref("fixtures");
const membership = sitePageHref("membership");

/**
 * One language version of the Harbor City FC site: navbar and footer around three pages (home,
 * fixtures, membership). Server component; the SiteShell in page.tsx picks page and language.
 */
export function ClubSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, lira } = c;
  const common = { locale: c.intl, labels: c.labels };

  return (
    <>
      <Hoops className="h-1.5 [background:repeating-linear-gradient(90deg,var(--accent)_0_24px,var(--fg)_24px_48px)]" />
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="inline-flex items-center gap-2.5 font-display text-xl leading-none font-bold tracking-[0.01em] uppercase">
            <Crest className="h-8 w-auto" id={`hcfc-crest-nav-${locale}`} />
            {CLUB}
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Fixtures", tr: "Fikstür" }), href: fixtures },
          { label: t({ en: "Table", tr: "Puan durumu" }), href: sitePageHref("fixtures", "table") },
          { label: t({ en: "News", tr: "Haberler" }), href: home("news") },
          { label: t({ en: "The Quayside", tr: "The Quayside" }), href: home("ground") },
          { label: t({ en: "Membership", tr: "Üyelik" }), href: membership },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: membership, label: t({ en: "Become a member", tr: "Üye ol" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Harbor City FC — the Pilots", tr: "Harbor City FC — Pilotlar" })}>
          <ClubHero c={c} />

          {/* League snapshot + top scorers. */}
          <Section anchor="standings" headingId="hc-standings-title" theme={{ surface: "surface-2" }}>
            <Container>
              <SectionHeader
                headingId="hc-standings-title"
                align="split"
                eyebrow={t({ en: "Coastal League · after matchday 11", tr: "Sahil Ligi · 11. hafta sonrası" })}
                title={t({ en: "Five points off *the top*", tr: "Zirveye *beş puan*" })}
                lead={t({
                  en: "Port Avalon lead, but they still have to come to The Quayside on 5 December. Unbeaten at home since March.",
                  tr: "Port Avalon önde, ama 5 Aralık’ta The Quayside’a gelmek zorundalar. Mart’tan beri iç sahada yenilmedik.",
                })}
                actions={
                  <Button asChild variant="solid">
                    <a href={sitePageHref("fixtures", "table")}>
                      {t({ en: "Full table", tr: "Tüm puan durumu" })}
                      <ArrowRight aria-hidden />
                    </a>
                  </Button>
                }
              />
              <div className="mt-10 grid gap-10 lg:grid-cols-12">
                <div className="min-w-0 lg:col-span-8">
                  <LeagueTable c={c} rows={standings} compact caption={t({ en: "Coastal League, top six and Harbor City", tr: "Sahil Ligi, ilk altı ve Harbor City" })} />
                </div>
                <aside aria-labelledby="hc-scorers-title" className="lg:col-span-4">
                  <h3 id="hc-scorers-title" className="m-0 border-b-2 border-fg pb-2 font-display text-2xl leading-none text-fg uppercase">
                    {t({ en: "Top scorers", tr: "Gol krallığı" })}
                  </h3>
                  <ol className="m-0 list-none p-0">
                    {scorers.map((s, i) => (
                      <li key={s.name} className="grid grid-cols-[2rem_1fr_auto] items-baseline gap-3 border-b border-line py-3">
                        <span className="font-mono text-xs text-fg-muted tabular">{i + 1}</span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-fg">{s.name}</span>
                          <span className="block text-xs text-fg-muted">
                            {t(s.pos)} · {t({ en: `${s.apps} apps`, tr: `${s.apps} maç` })}
                          </span>
                        </span>
                        <span className={i === 0 ? "font-display text-4xl leading-none text-accent-ink tabular" : "font-display text-3xl leading-none text-fg tabular"}>{s.goals}</span>
                      </li>
                    ))}
                  </ol>
                </aside>
              </div>
            </Container>
          </Section>

          <BlogList
            {...common}
            anchor="news"
            variant="editorial"
            eyebrow={t({ en: "News", tr: "Haberler" })}
            title={t({ en: "From the *dressing room*", tr: "Soyunma *odasından*" })}
            allLink={{ href: "/news", label: t({ en: "All news", tr: "Tüm haberler" }) }}
            posts={news.map((n, i) => ({
              href: `/news/${i + 1}`,
              title: t(n.title),
              excerpt: t(n.excerpt),
              publishedAt: n.date,
              readingMinutes: n.minutes,
              category: { label: t(n.category) },
              cover: n.photo ? { ...photos[n.photo], alt: t(photos[n.photo].alt) } : undefined,
            }))}
          />

          <MediaText
            {...common}
            anchor="ground"
            variant="overlap"
            eyebrow={t({ en: "The Quayside", tr: "The Quayside" })}
            title={t({ en: "Football with the *ferries* behind the goal", tr: "Kalenin arkasında *vapurlarla* futbol" })}
            body={t({
              en: `${f.number(5150)} seats, three stands and the harbour where the fourth should be. Gates open 90 minutes before kick-off; the 14:10 ferry from Central Pier lands five minutes from the turnstiles. Step-free entry at gates 7–9.`,
              tr: `${f.number(5150)} koltuk, üç tribün ve dördüncünün yerinde liman. Kapılar başlama vuruşundan 90 dakika önce açılır; Merkez İskele’den 14:10 vapuru turnikelere beş dakika mesafede yanaşır. 7–9 numaralı kapılarda basamaksız giriş.`,
            })}
            media={{ ...photos.stadium, alt: t(photos.stadium.alt) }}
            cta={{ link: { href: sitePageHref("membership", "stands"), label: t({ en: "See the stands", tr: "Tribünleri gör" }) }, style: "secondary" }}
            aspect="3:2"
          />

          <Cta
            {...common}
            variant="band"
            eyebrow={t({ en: "Season tickets", tr: "Kombineler" })}
            title={t({ en: `Season tickets from *${lira(1900)}*`, tr: `Kombine *${lira(1900)}*’den başlıyor` })}
            lead={t({ en: `Or join as a supporter for ${lira(750)}: own a piece of the club, buy before general sale and vote at the AGM.`, tr: `Ya da ${lira(750)} karşılığında taraftar üye olun: kulübün bir parçasına sahip olun, genel satıştan önce bilet alın, genel kurulda oy kullanın.` })}
            actions={[
              { link: { href: membership, label: t({ en: "Compare memberships", tr: "Üyelikleri karşılaştır" }) }, style: "primary" },
            ]}
          />
        </SiteShellPage>

        <SiteShellPage id="fixtures" title={t({ en: "Fixtures & results — Harbor City FC", tr: "Fikstür ve sonuçlar — Harbor City FC" })}>
          <FixturesPage c={c} />
        </SiteShellPage>

        <SiteShellPage id="membership" title={t({ en: "Membership — Harbor City FC", tr: "Üyelik — Harbor City FC" })}>
          <MembershipPage c={c} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: CLUB, href: home(), logo: <Crest className="h-10 w-auto" id={`hcfc-crest-footer-${locale}`} /> }}
        about={t({
          en: "A member-owned football club on the harbour since 1923. First team, women’s side and an academy of 140 players.",
          tr: "1923’ten beri limanda, üyelerine ait bir futbol kulübü. A takım, kadın takımı ve 140 oyunculu bir akademi.",
        })}
        columns={[
          {
            title: t({ en: "Matchday", tr: "Maç günü" }),
            links: [
              { href: fixtures, label: t({ en: "Fixtures & results", tr: "Fikstür ve sonuçlar" }) },
              { href: sitePageHref("fixtures", "table"), label: t({ en: "League table", tr: "Puan durumu" }) },
              { href: home("ground"), label: t({ en: "Getting to The Quayside", tr: "The Quayside’a ulaşım" }) },
            ],
          },
          {
            title: t({ en: "Join in", tr: "Katılın" }),
            links: [
              { href: membership, label: t({ en: "Membership", tr: "Üyelik" }) },
              { href: sitePageHref("membership", "faq"), label: t({ en: "Membership FAQ", tr: "Üyelik SSS" }) },
              { href: "/academy", label: t({ en: "Academy trials", tr: "Akademi seçmeleri" }) },
            ],
          },
          {
            title: t({ en: "Club", tr: "Kulüp" }),
            links: [
              { href: home("news"), label: t({ en: "News", tr: "Haberler" }) },
              { href: "/agm", label: t({ en: "AGM minutes", tr: "Genel kurul tutanakları" }) },
              { href: "/safeguarding", label: t({ en: "Safeguarding", tr: "Çocuk koruma" }) },
            ],
          },
        ]}
        contact={{ address: "12 Pier Road, Harbor City", phone: PHONE, email: EMAIL }}
        social={[
          { network: "instagram", href: "https://instagram.com/harborcityfc.example" },
          { network: "youtube", href: "https://youtube.com/@harborcityfc.example" },
        ]}
        legalLinks={[
          { href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) },
          { href: "/ground-regulations", label: t({ en: "Ground regulations", tr: "Stat kuralları" }) },
        ]}
        year={2026}
      />
    </>
  );
}
